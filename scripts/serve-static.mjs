#!/usr/bin/env node
/**
 * Test-only static server that mimics how Vercel serves dist/ with our
 * vercel.json: exact files, then <path>/index.html, trailing slash -> 308,
 * case-sensitive lookup, exact-path redirects, 404.html with status 404,
 * headers from vercel.json.
 *
 * Usage: node scripts/serve-static.mjs [--port 4174]
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const portIndex = process.argv.indexOf('--port');
const port = portIndex > 0 ? Number(process.argv[portIndex + 1]) : 4174;
const config = JSON.parse(readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const headers = Object.fromEntries(
  (config.headers?.[0]?.headers ?? []).map((h) => [h.key, h.value])
);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
};

/** Case-sensitive existence check, even on case-insensitive file systems. */
function existsExact(file) {
  if (!file.startsWith(dist) || !existsSync(file)) return false;
  const parts = path.relative(dist, file).split(path.sep);
  let dir = dist;
  for (const part of parts) {
    if (!readdirSync(dir).includes(part)) return false;
    dir = path.join(dir, part);
  }
  return true;
}

function send(res, status, file, extra = {}) {
  res.writeHead(status, {
    ...headers,
    'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream',
    ...extra,
  });
  res.end(readFileSync(file));
}

createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);

  if (
    config.trailingSlash === false &&
    pathname.length > 1 &&
    pathname.endsWith('/')
  ) {
    res.writeHead(308, { ...headers, Location: pathname.slice(0, -1) });
    return res.end();
  }

  const redirect = config.redirects?.find((r) => r.source === pathname);
  if (redirect) {
    res.writeHead(redirect.permanent ? 308 : 307, {
      ...headers,
      Location: redirect.destination,
    });
    return res.end();
  }

  const direct = path.join(dist, pathname);
  if (existsExact(direct) && statSync(direct).isFile())
    return send(res, 200, direct);

  const index = path.join(dist, pathname, 'index.html');
  if (existsExact(index)) return send(res, 200, index);

  return send(res, 404, path.join(dist, '404.html'));
}).listen(port, () => console.log(`static server on http://localhost:${port}`));
