export const partsOfSpeech = ['verb', 'noun', 'adjective', 'adverb', 'phrase'] as const;
export type PartOfSpeech = typeof partsOfSpeech[number];
export const targets = ['eikenPre1', 'toefl', 'sat'] as const;
export type Target = typeof targets[number];
export const categories = ['academic', 'general', 'science', 'society', 'business', 'literature'] as const;
export type Category = typeof categories[number];
export type VocabularyEntry = {
  id: string;
  lemma: string;
  pos: PartOfSpeech;
  meaningJa: string;
  definitionEn: string;
  difficulty: number;
  example: string;
  targets: Partial<Record<Target, 1 | 2 | 3>>;
  category: Category;
  answerForm?: string;
  acceptedAnswers?: string[];
  synonyms?: string[];
  antonyms?: string[];
  confusingWords?: string[];
  collocations?: string[];
};

const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const normalized = (value: string) => value.normalize('NFKC').toLowerCase().trim().replace(/\s+/g, ' ');
export const normalizeLemma = (value: string) => normalized(value).replace(/[‐‑‒–—]/g, '-');
export const normalizeAnswer = (value: string) => normalizeLemma(value).replace(/^[\s.,!?;:"'“”‘’]+|[\s.,!?;:"'“”‘’]+$/g, '');
const hasOneOccurrence = (example: string, answer: string) => {
  const words = example.toLowerCase().match(/[a-z]+(?:[-'][a-z]+)*/g) ?? [];
  return words.filter(word => word === answer.toLowerCase()).length === 1;
};

export function validateEntry(value: unknown): string[] {
  if (!isObject(value)) return ['entry must be an object'];
  const errors: string[] = [];
  for (const key of ['id', 'lemma', 'meaningJa', 'definitionEn', 'example']) if (!nonempty(value[key])) errors.push(`${key} is required`);
  if (nonempty(value.id) && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.id)) errors.push('id must be a stable lowercase slug');
  if (!partsOfSpeech.includes(value.pos as PartOfSpeech)) errors.push('invalid pos');
  if (!Number.isInteger(value.difficulty) || Number(value.difficulty) < 1 || Number(value.difficulty) > 8) errors.push('difficulty must be 1..8');
  if (!categories.includes(value.category as Category)) errors.push('invalid category');
  if (!isObject(value.targets) || !Object.keys(value.targets).length) errors.push('at least one target is required');
  else for (const [target, usefulness] of Object.entries(value.targets)) {
    if (!targets.includes(target as Target) || ![1, 2, 3].includes(Number(usefulness))) errors.push(`invalid target: ${target}`);
  }
  for (const key of ['answerForm']) if (value[key] !== undefined && !nonempty(value[key])) errors.push(`${key} must be nonempty`);
  for (const key of ['acceptedAnswers', 'synonyms', 'antonyms', 'confusingWords', 'collocations']) {
    if (value[key] !== undefined && (!Array.isArray(value[key]) || !(value[key] as unknown[]).every(nonempty))) errors.push(`${key} must be nonempty strings`);
  }
  const answer = nonempty(value.answerForm) ? value.answerForm : value.lemma;
  if (nonempty(value.example) && nonempty(answer) && !hasOneOccurrence(value.example, answer)) errors.push('example must contain exactly one answerForm or lemma');
  if (nonempty(value.definitionEn) && !/[a-z]/i.test(value.definitionEn)) errors.push('definitionEn must be English');
  return errors;
}

export function auditCatalog(values: unknown[]): { entries: VocabularyEntry[]; errors: string[]; warnings: string[] } {
  const errors: string[] = [], warnings: string[] = [];
  const ids = new Set<string>(), lemmaPos = new Map<string, string>(), lemmaOnly = new Map<string, string>();
  for (const [index, value] of values.entries()) {
    const row = value as Partial<VocabularyEntry>;
    const label = `row ${index + 1}${row && typeof row.id === 'string' ? ` (${row.id})` : ''}`;
    for (const issue of validateEntry(value)) errors.push(`${label}: ${issue}`);
    if (!row || typeof row.id !== 'string' || typeof row.lemma !== 'string' || typeof row.pos !== 'string') continue;
    if (ids.has(row.id)) errors.push(`${label}: duplicate id ${row.id}`);
    ids.add(row.id);
    const key = `${normalizeLemma(row.lemma)}|${row.pos}`;
    if (lemmaPos.has(key)) errors.push(`${label}: duplicate lemma + pos with ${lemmaPos.get(key)}`);
    lemmaPos.set(key, row.id);
    const word = normalizeLemma(row.lemma);
    if (lemmaOnly.has(word) && lemmaOnly.get(word) !== row.id) warnings.push(`${label}: same lemma as ${lemmaOnly.get(word)}; verify distinct part of speech`);
    lemmaOnly.set(word, row.id);
  }
  return { entries: errors.length ? [] : values as VocabularyEntry[], errors, warnings };
}

export function productionAnswer(entry: VocabularyEntry, input: string): boolean {
  const valid = [entry.answerForm ?? entry.lemma, ...(entry.acceptedAnswers ?? [])];
  return valid.some(answer => normalizeAnswer(answer) === normalizeAnswer(input));
}

export function cloze(entry: VocabularyEntry): string {
  const answer = entry.answerForm ?? entry.lemma;
  const pattern = new RegExp(`\\b${answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  return entry.example.replace(pattern, '_____');
}
