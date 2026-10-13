import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const PORT = 8128;
const ROOT_DIR = process.cwd();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.json': 'application/json'
};

let chromeProc = null;
let server = null;

server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = parsedUrl.pathname;

  if (pathname === '/log') {
    const msg = parsedUrl.searchParams.get('msg');
    console.log(`  ${msg}`);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }

  if (pathname === '/finish' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const result = JSON.parse(body);
        console.log('\n========================================');
        if (result.success) {
          console.log(`🎉 E2E TEST BAŞARILI: ${result.count} testin tamamı tarayıcıda geçti!`);
        } else {
          console.error(`❌ E2E TEST BAŞARISIZ: ${result.error}`);
        }
        console.log('========================================\n');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'done' }));

        setTimeout(() => {
          if (chromeProc) chromeProc.kill();
          server.close();
          process.exit(result.success ? 0 : 1);
        }, 500);
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
    });
    return;
  }

  let filePath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);
  if (pathname === '/e2e.html') {
    filePath = path.join(ROOT_DIR, 'tests', 'e2e.html');
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`\n🚀 E2E Test Sunucusu Başlatıldı: http://localhost:${PORT}`);
  console.log('🌐 Google Chrome Headless başlatılıyor...\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=960,540',
    `http://localhost:${PORT}/e2e.html`
  ]);

  chromeProc.on('error', err => {
    console.error('Chrome başlatma hatası:', err.message);
    server.close();
    process.exit(1);
  });

  // 15 saniye zaman aşımı koruması
  setTimeout(() => {
    console.error('❌ E2E Test Zaman Aşımı (15s)!');
    if (chromeProc) chromeProc.kill();
    server.close();
    process.exit(1);
  }, 15000);
});
