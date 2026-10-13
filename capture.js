import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const PORT = 8124;
const ROOT_DIR = process.cwd();
const SCREENSHOTS_DIR = path.join(ROOT_DIR, 'screenshots');
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || null;

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
if (ARTIFACT_DIR && !fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.json': 'application/json'
};

let chromeProc = null;

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = parsedUrl.pathname;

  if (pathname === '/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { filename, data } = JSON.parse(body);
        const base64Data = data.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const localPath = path.join(SCREENSHOTS_DIR, filename);
        fs.writeFileSync(localPath, buffer);

        if (ARTIFACT_DIR) {
          const artifactPath = path.join(ARTIFACT_DIR, filename);
          fs.writeFileSync(artifactPath, buffer);
        }

        console.log(`[SAVED] ${filename} (${buffer.length} bytes)`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', filename }));
      } catch (err) {
        console.error('[ERROR saving image]', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/log') {
    console.log('[BROWSER LOG]', parsedUrl.searchParams.get('msg'));
    res.end('ok');
    return;
  }

  if (pathname === '/error') {
    console.error('[BROWSER ERROR]', parsedUrl.searchParams.get('msg'));
    res.end('ok');
    return;
  }

  if (pathname === '/done') {
    console.log('[ALL SCREENSHOTS CAPTURED SUCCESSFULLY]');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('DONE');

    setTimeout(() => {
      if (chromeProc) {
        try { chromeProc.kill(); } catch (e) {}
      }
      server.close(() => {
        console.log('[SERVER CLOSED]');
        process.exit(0);
      });
    }, 500);
    return;
  }

  if (pathname === '/') pathname = '/capture.html';
  const filePath = path.join(ROOT_DIR, pathname);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Capture server running at http://localhost:${PORT}`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--window-size=960,540',
    `http://localhost:${PORT}/capture.html`
  ];

  console.log('Launching headless Chrome to capture frames...');
  chromeProc = spawn(chromePath, args, { stdio: 'inherit' });

  chromeProc.on('error', (err) => {
    console.error('Failed to launch Chrome:', err);
    process.exit(1);
  });
});

// Timeout safeguard (20 seconds)
setTimeout(() => {
  console.log('[TIMEOUT SAFEGUARD TRIGGERED]');
  if (chromeProc) try { chromeProc.kill(); } catch (e) {}
  server.close(() => process.exit(0));
}, 20000);
