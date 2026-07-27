const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, 'dist');
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/') u = '/index.html';
  let p = path.join(root, u);
  
  if (!p.startsWith(root)) {
    res.writeHead(403);
    return res.end('forbidden');
  }
  
  fs.stat(p, (e, s) => {
    if (e || !s.isFile()) p = path.join(root, '404.html');
    fs.readFile(p, (err, b) => {
      if (err) {
        res.writeHead(404);
        return res.end('not found');
      }
      res.writeHead(200, {
        'content-type': types[path.extname(p)] || 'application/octet-stream',
        'Cache-Control': 'no-store'
      });
      res.end(b);
    });
  });
}).listen(4177, '127.0.0.1', () => {
  console.log('RealityGenius dist: http://127.0.0.1:4177');
});
