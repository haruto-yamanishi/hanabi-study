import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = path.resolve(process.cwd());
const cache = new Map();

// Execute repository-owned TypeScript with real imports and module caching.
export function loadTs(relative) {
  const file = path.resolve(root, relative);
  if (cache.has(file)) return cache.get(file).exports;
  const source = fs.readFileSync(file, 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const mod = { exports: {} };
  cache.set(file, mod);
  const localRequire = specifier => {
    if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return require(specifier);
    const base = specifier.startsWith('@/') ? path.join(root, specifier.slice(2)) : path.resolve(path.dirname(file), specifier);
    const resolved = [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')].find(p => fs.existsSync(p) && fs.statSync(p).isFile());
    if (!resolved) throw new Error(`Cannot resolve ${specifier} from ${file}`);
    return loadTs(resolved);
  };
  new Function('exports','module','require',js)(mod.exports,mod,localRequire);
  return mod.exports;
}
