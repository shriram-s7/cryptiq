// C02 bootstrap only. C03 replaces this entry point with the React/Vite shell.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const page = await readFile(new URL('./index.html', import.meta.url));
const server = createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }
  const pathname = new URL(request.url, 'http://127.0.0.1:5173').pathname;
  if (pathname !== '/') {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Page not found');
    return;
  }
  response.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(request.method === 'HEAD' ? undefined : page);
});
server.on('error', (error) => {
  console.error(`Core web startup failed: ${error.message}`);
  process.exitCode = 1;
});
server.listen(5173, '127.0.0.1', () => console.log('Core web: http://127.0.0.1:5173'));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close());
}
