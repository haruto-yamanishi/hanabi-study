import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditCatalog, type VocabularyEntry } from '../lib/vocabulary';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'data/vocabulary');
const files = fs.readdirSync(source).filter(file => file.endsWith('.jsonl')).sort();
if (!files.length) throw new Error('No vocabulary JSONL files');
const rows: unknown[] = [];
for (const file of files) {
  for (const [lineIndex, line] of fs.readFileSync(path.join(source, file), 'utf8').split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    try { rows.push(JSON.parse(line)); }
    catch { throw new Error(`${file}:${lineIndex + 1}: invalid JSON`); }
  }
}
const result = auditCatalog(rows);
for (const warning of result.warnings) console.warn(`warning: ${warning}`);
if (result.errors.length) throw new Error(result.errors.join('\n'));
const entries = (result.entries as VocabularyEntry[]).sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id));
const output = `${JSON.stringify(entries, null, 2)}\n`;
const target = path.join(root, 'data/catalog.json');
if (process.argv.includes('--write')) fs.writeFileSync(target, output);
else if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== output) throw new Error('data/catalog.json is stale. Run npm run vocab:build');
console.log(`Vocabulary audit OK: ${entries.length} entries across ${files.length} file(s)`);
