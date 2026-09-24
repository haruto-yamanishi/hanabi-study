import raw from '../data/catalog.json';
import { auditCatalog, type VocabularyEntry } from './vocabulary';

const checked = auditCatalog(raw);
if (checked.errors.length) throw new Error(`Vocabulary catalog is invalid: ${checked.errors.slice(0, 3).join('; ')}`);
export const catalog: VocabularyEntry[] = checked.entries;
export const catalogById = new Map(catalog.map(entry => [entry.id, entry]));
