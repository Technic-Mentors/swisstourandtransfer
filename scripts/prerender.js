/**
 * Prerender the built site to static HTML so crawlers get real markup.
 *
 *   npm run build:seo      # vite build, then this script
 *
 * It serves dist/, asks the API which slugs exist, visits every route in
 * headless Chrome and writes the rendered HTML back into dist/. Browsers
 * still boot React as normal; search engines get the content without
 * executing JavaScript.
 *
 * The backend must be running, because the route list comes from the database.
 */
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sirv from 'sirv';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');
const PORT = 4178;

const STATIC_ROUTES = [
  '/',
  '/vehicles',
  '/services',
  '/about',
  '/gallery',
  '/reviews',
  '/contact',
  '/book',
  '/offers',
  '/privacy',
  '/terms',
  '/impressum',
];

/** Read the API base URL out of src/config.js so this follows the MODE switch. */
async function readApiBase() {
  const source = await readFile(join(ROOT, 'src', 'config.js'), 'utf8');

  const mode = source.match(/const MODE\s*=\s*'([^']+)'/)?.[1] || 'local';
  const urls = {};
  const block = source.match(/const URLS\s*=\s*\{([\s\S]*?)\}/)?.[1] || '';
  for (const [, key, value] of block.matchAll(/(\w+)\s*:\s*'([^']+)'/g)) urls[key] = value;

  const base = urls[mode];
  if (!base) throw new Error(`Could not read the API URL for MODE "${mode}" from src/config.js`);
  return base;
}

async function collectRoutes(apiBase) {
  const routes = new Set(STATIC_ROUTES);

  const sources = [
    ['/api/vehicles', 'vehicles', (item) => `/vehicles/${item.slug}`],
    ['/api/categories', 'categories', (item) => `/vehicles/category/${item.slug}`],
    ['/api/services', 'services', (item) => `/services/${item.slug}`],
    ['/api/cities', 'cities', (item) => `/chauffeur-service/${item.slug}`],
  ];

  for (const [path, key, toRoute] of sources) {
    const response = await fetch(`${apiBase}${path}`);
    if (!response.ok) throw new Error(`${path} returned ${response.status}`);
    const data = await response.json();
    for (const item of data[key] || []) routes.add(toRoute(item));
  }

  return [...routes];
}

/** Static file server with SPA fallback, so every route serves index.html. */
function serveDist() {
  const assets = sirv(DIST, { dev: true, etag: false });

  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      assets(req, res, async () => {
        res.setHeader('Content-Type', 'text/html');
        res.end(await readFile(join(DIST, 'index.html'), 'utf8'));
      });
    });
    server.listen(PORT, () => resolvePromise(server));
  });
}

async function run() {
  const apiBase = await readApiBase();
  console.log(`[prerender] API: ${apiBase}`);

  let routes;
  try {
    routes = await collectRoutes(apiBase);
  } catch (err) {
    console.error(`\n[prerender] Could not reach the API at ${apiBase}`);
    console.error(`[prerender] ${err.message}`);
    console.error('[prerender] Start the backend first, then run this again.\n');
    process.exit(1);
  }

  console.log(`[prerender] ${routes.length} routes to render`);

  const server = await serveDist();
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

  let ok = 0;
  const failed = [];

  for (const route of routes) {
    const page = await browser.newPage();
    try {
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: 'networkidle0',
        timeout: 45000,
      });

      // Give react-helmet a tick to write the head tags.
      await new Promise((r) => setTimeout(r, 250));

      const html = await page.evaluate(() => `<!doctype html>\n${document.documentElement.outerHTML}`);

      const outDir = route === '/' ? DIST : join(DIST, route);
      await mkdir(outDir, { recursive: true });
      await writeFile(join(outDir, 'index.html'), html, 'utf8');

      const title = await page.title();
      console.log(`  ✓ ${route.padEnd(42)} ${title.slice(0, 54)}`);
      ok += 1;
    } catch (err) {
      console.log(`  ✗ ${route.padEnd(42)} ${err.message.slice(0, 54)}`);
      failed.push(route);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();

  console.log(`\n[prerender] ${ok}/${routes.length} routes written to dist/`);
  if (failed.length) {
    console.log(`[prerender] failed: ${failed.join(', ')}`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
