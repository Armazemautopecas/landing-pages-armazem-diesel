import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = 'https://landing-pages-armazem-diesel.vercel.app';
const LANDING_BASE = 'injecao-diesel';

// Descobre LPs olhando subdirs de app/injecao-diesel/ que contêm config.json
// (convenção do projeto desde a reorg). Próxima LP nasce auto-listada — sem
// editar sitemap.
function findLandingSlugs() {
  const baseDir = join(process.cwd(), 'app', LANDING_BASE);
  const entries = readdirSync(baseDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .filter((e) => !e.name.startsWith('_') && e.name !== 'api')
    .filter((e) => existsSync(join(baseDir, e.name, 'config.json')))
    .map((e) => e.name)
    .sort();
}

export default function sitemap() {
  const now = new Date();
  return findLandingSlugs().map((slug) => ({
    url: `${SITE_URL}/${LANDING_BASE}/${slug}/`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.9,
  }));
}
