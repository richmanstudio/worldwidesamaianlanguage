import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const js = readFileSync('dist/assets/site.js', 'utf8');
const syntax = spawnSync(process.execPath, ['--check', 'dist/assets/site.js'], { encoding: 'utf8' });
assert.equal(syntax.status, 0, `Синтаксис браузерного JS: ${syntax.stderr}`);
assert.ok(js.includes('const LETTERS'), 'Не найден букварь в сборке');
assert.ok(js.includes('function render'), 'Не найдена маршрутизация в сборке');
assert.ok(js.includes('function renderDictionary'), 'Не найден словарь в сборке');

const port = await new Promise((resolve, reject) => {
  const s = createServer();
  s.on('error', reject);
  s.listen(0, '127.0.0.1', () => {
    const addr = s.address();
    s.close(() => resolve(addr.port));
  });
});
const server = spawn(process.execPath, ['scripts/serve.mjs'], {
  env: { ...process.env, PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe']
});
let serverLog = '';
server.stdout.on('data', chunk => { serverLog += chunk.toString(); });
server.stderr.on('data', chunk => { serverLog += chunk.toString(); });

try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/`);
      ready = res.status === 200;
      if (ready) break;
    } catch { /* server still starting */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, `Сервер не запустился: ${serverLog}`);
  for (const [path, snippet, type] of [
    ['/', 'Энциклопедия международного языка', 'text/html'],
    ['/assets/site.js', 'function render', 'application/javascript'],
    ['/assets/style.css', '.webpage', 'text/css'],
    ['/favicon.svg', '<svg', 'image/svg+xml'],
    ['/static-index.html','Указатель статических HTML-страниц','text/html'],
    ['/pages/words/meya.html','календарный месяц','text/html'],
    ['/pages/articles/standard-status.html','Что такое стандарт','text/html']
  ]) {
    const res = await fetch(`http://127.0.0.1:${port}${path}`);
    assert.equal(res.status, 200, `HTTP ${path}`);
    assert.ok(res.headers.get('content-type')?.startsWith(type), `MIME ${path}`);
    assert.ok((await res.text()).toLowerCase().includes(snippet.toLowerCase()), `Содержимое ${path}`);
    console.log(`✓ ${path}: HTTP 200, ожидаемые данные и MIME`);
  }
  const missing = await fetch(`http://127.0.0.1:${port}/missing-not-found.html`);
  assert.equal(missing.status, 404, 'Несуществующая страница должна вернуть 404');
  console.log('✓ Несуществующая страница: HTTP 404');
  console.log('✓ Готово: тест сборки и сервера пройден');
} finally {
  server.kill();
}
