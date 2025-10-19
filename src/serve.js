/**
 * Simple HTTP server to preview the built site
 */

import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');
const projectRoot = join(__dirname, '..');

const PORT = 3000;
const DIST_DIR = join(projectRoot, 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = createServer(async (req, res) => {
  try {
    let filePath = req.url === '/' ? '/index.html' : req.url;

    // Remove query string
    filePath = filePath.split('?')[0];

    const fullPath = join(DIST_DIR, filePath);
    const ext = extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';

    const content = await readFile(fullPath);

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);

    console.log(`✓ ${req.method} ${req.url} - 200`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      console.log(`✗ ${req.method} ${req.url} - 404`);
    } else {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h1>500 Internal Server Error</h1>');
      console.error(`✗ ${req.method} ${req.url} - 500:`, error.message);
    }
  }
});

server.listen(PORT, () => {
  console.log(`
🚀 Server running!

   Local: http://localhost:${PORT}

   Available pages:
   - http://localhost:${PORT}/
   - http://localhost:${PORT}/about.html
   - http://localhost:${PORT}/tasks.html
   - http://localhost:${PORT}/demo.html

   Press Ctrl+C to stop
`);
});
