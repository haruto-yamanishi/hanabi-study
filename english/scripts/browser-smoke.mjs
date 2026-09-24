import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'out');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  const file = path.resolve(output, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!file.startsWith(`${output}${path.sep}`)) { response.writeHead(403).end(); return; }
  try { const bytes = await fs.readFile(file); response.writeHead(200, { 'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream' }).end(bytes); }
  catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.getByRole('button', { name: '今日の150を始める' }).waitFor();
  if (process.env.HANABI_SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.HANABI_SCREENSHOT_DIR, 'home.png'), fullPage: true });
  await page.getByRole('button', { name: 'Initial Test' }).click();
  await page.getByRole('button', { name: '診断を始める →' }).click();
  await page.getByRole('button', { name: '意味を確認' }).click();
  await page.getByRole('button', { name: '× 分からなかった' }).click();
  await page.getByText('確認済み 1語').waitFor();
  await page.reload();
  await page.getByRole('button', { name: 'Initial Test' }).click();
  await page.getByText('確認済み 1語').waitFor();
  await page.getByRole('button', { name: "Today's 150" }).click();
  if (process.env.HANABI_SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.HANABI_SCREENSHOT_DIR, 'today.png'), fullPage: true });
  const word = await page.locator('.word-display').textContent();
  assert(word);
  await page.getByRole('button', { name: '意味を確認' }).click();
  await page.getByRole('button', { name: '意味は分かった →' }).click();
  await page.getByRole('textbox', { name: '英単語を入力' }).fill(word);
  await page.getByRole('button', { name: '回答する ↵' }).click();
  await page.getByText('正解', { exact: true }).waitFor();
  await page.getByRole('button', { name: '次の語へ →' }).click();
  await page.getByText('完了 1語', { exact: false }).waitFor();
  await page.reload();
  await page.getByRole('button', { name: "Today's 150" }).click();
  await page.getByText('完了 1語', { exact: false }).waitFor();
  const saved = await page.evaluate(async () => {
    const request = indexedDB.open('HanabiStudyEnglishV1');
    const database = await new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const transaction = database.transaction(['progress', 'attempts', 'plans']);
    const read = store => new Promise((resolve, reject) => { const request = transaction.objectStore(store).getAll(); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    return { progress: await read('progress'), attempts: await read('attempts'), plans: await read('plans') };
  });
  const catalog = JSON.parse(await fs.readFile(path.join(root, 'data/catalog.json'), 'utf8'));
  const studied = catalog.find(entry => entry.lemma === word);
  assert(studied);
  assert(saved.progress.some(item => item.id === studied.id && item.status === 'usable'));
  assert(saved.attempts.length >= 2);
  assert.equal(saved.plans[0].doneIds.length, 1);
  assert.deepEqual(errors, []);
  console.log('Browser smoke OK: diagnostic resume, typed promotion, IndexedDB history and daily resume');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
