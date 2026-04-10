const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? Number(process.env.PORT) : (process.env.PANEL_PORT ? Number(process.env.PANEL_PORT) : 5173);
const ROOT = path.join(__dirname, 'panel-build');

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=UTF-8';
    case '.js': return 'application/javascript; charset=UTF-8';
    case '.css': return 'text/css; charset=UTF-8';
    case '.json': return 'application/json; charset=UTF-8';
    case '.png': return 'image/png';
    case '.jpg': case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    case '.webp': return 'image/webp';
    case '.woff2': return 'font/woff2';
    default: return 'application/octet-stream';
  }
}

const server = http.createServer((req, res) => {
  try {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(ROOT, reqPath);
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(400);
      return res.end('Bad request');
    }
    let stat;
    try { stat = fs.statSync(filePath); } catch (e) { stat = null; }
    let finalPath = filePath;
    if (!stat) {
      // fallback to index.html for SPA routing
      finalPath = path.join(ROOT, 'index.html');
      try { stat = fs.statSync(finalPath); } catch (e) { stat = null; }
      if (!stat) {
        res.writeHead(404);
        return res.end('Not found');
      }
    }
    const stream = fs.createReadStream(finalPath);
    res.writeHead(200, { 'Content-Type': contentType(finalPath) });
    stream.pipe(res);
  } catch (err) {
    res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(PORT, () => {
  console.log(`Panel static server running on http://localhost:${PORT}`);
});
