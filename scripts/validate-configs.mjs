#!/usr/bin/env node
import { readFile, readdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import Ajv from 'ajv';

const ROOT = new URL('../', import.meta.url).pathname;
const LANDING_BASE_DIR = join(ROOT, 'app/injecao-diesel/');
const PUBLIC_DIR = join(ROOT, 'public');
const SCHEMA_PATH = join(ROOT, 'data/config.schema.json');
const OEMS_PATH = join(ROOT, 'data/oems.json');

async function fileExists(absPath) {
  try { await access(absPath); return true; } catch { return false; }
}

// Resolve um path do config (relativo ou absoluto começando com /) pra um caminho absoluto em disco dentro de public/.
// - Absoluto (`/injecao-diesel/pecas/X.webp`)  → public/injecao-diesel/pecas/X.webp
// - Relativo (`assets/hero-static.png`)         → public/<canonical_path>/<path>
function resolvePublicPath(cfg, p) {
  if (typeof p !== 'string' || !p) return null;
  if (p.startsWith('/')) return join(PUBLIC_DIR, p.slice(1));
  const base = (cfg.seo?.canonical_path || '').replace(/^\/+|\/+$/g, '');
  return join(PUBLIC_DIR, base, p);
}

async function checkPhotos(cfg) {
  const issues = [];
  const targets = [];

  if (cfg.hero?.foto_static) targets.push(['hero.foto_static', cfg.hero.foto_static]);
  if (cfg.hero?.foto_dust) targets.push(['hero.foto_dust', cfg.hero.foto_dust]);
  if (cfg.peca?.foto_default) targets.push(['peca.foto_default', cfg.peca.foto_default]);
  if (cfg.seo?.og_image) targets.push(['seo.og_image', cfg.seo.og_image]);

  for (const [oem, p] of Object.entries(cfg.peca?.fotos_por_oem || {})) {
    targets.push([`peca.fotos_por_oem.${oem}`, p]);
  }
  for (const [marca, p] of Object.entries(cfg.peca?.foto_por_marca || {})) {
    targets.push([`peca.foto_por_marca.${marca}`, p]);
  }

  for (const [field, p] of targets) {
    const abs = resolvePublicPath(cfg, p);
    if (!abs) { issues.push(`${field}: path inválido (${JSON.stringify(p)})`); continue; }
    const ok = await fileExists(abs);
    if (!ok) issues.push(`${field}: arquivo não existe em public/ → ${p}`);
  }

  return issues;
}

function checkOemsEntry(slug, cfg, oems) {
  const issues = [];
  const cat = cfg.categoria;
  const key = cfg.veiculo_key;
  if (!oems[cat]) {
    issues.push(`data/oems.json sem categoria "${cat}"`);
    return issues;
  }
  const entry = oems[cat][key];
  if (!entry) {
    issues.push(`data/oems.json[${cat}] sem chave "${key}" (slug=${slug})`);
    return issues;
  }
  if (!entry.veiculo?.marca || !entry.veiculo?.modelo) {
    issues.push(`data/oems.json[${cat}].${key}.veiculo precisa de marca + modelo`);
  }
  const variants = entry.variants_por_ano || {};
  const anos = Object.keys(variants);
  if (anos.length === 0) {
    issues.push(`data/oems.json[${cat}].${key}.variants_por_ano está vazio`);
    return issues;
  }
  for (const ano of anos) {
    const arr = variants[ano];
    if (!Array.isArray(arr) || arr.length === 0) {
      issues.push(`data/oems.json[${cat}].${key}.variants_por_ano["${ano}"] vazio`);
      continue;
    }
    for (const [i, v] of arr.entries()) {
      if (!v.motor || !v.oem) {
        issues.push(`data/oems.json[${cat}].${key}.variants_por_ano["${ano}"][${i}] sem motor ou oem`);
      }
    }
  }
  return issues;
}

async function main() {
  const schema = JSON.parse(await readFile(SCHEMA_PATH, 'utf8'));
  const oems = JSON.parse(await readFile(OEMS_PATH, 'utf8'));
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  const entries = await readdir(LANDING_BASE_DIR, { withFileTypes: true });
  const lps = entries
    .filter((e) => e.isDirectory() && !e.name.startsWith('_') && e.name !== 'api')
    .map((e) => e.name);

  let failures = 0;

  for (const slug of lps) {
    const cfgPath = join(LANDING_BASE_DIR, slug, 'config.json');
    let cfg;
    try {
      cfg = JSON.parse(await readFile(cfgPath, 'utf8'));
    } catch (e) {
      console.error(`✗ ${slug}: config.json inválido como JSON — ${e.message}`);
      failures++;
      continue;
    }

    const errs = [];

    if (!validate(cfg)) {
      for (const err of validate.errors) {
        errs.push(`schema: ${err.instancePath || '/'} ${err.message}`);
      }
    }

    errs.push(...(await checkPhotos(cfg)));
    errs.push(...checkOemsEntry(slug, cfg, oems));

    if (errs.length === 0) {
      console.log(`✓ ${slug}/config.json`);
    } else {
      console.error(`✗ ${slug}/config.json:`);
      for (const e of errs) console.error(`    ${e}`);
      failures++;
    }
  }

  if (failures > 0) {
    console.error(`\nvalidate-configs: ${failures} LP(s) com config inválido`);
    process.exit(1);
  }
  console.log(`\nvalidate-configs: OK (${lps.length} LP${lps.length > 1 ? 's' : ''})`);
}

main().catch((e) => {
  console.error('validate-configs: erro inesperado —', e.message);
  process.exit(2);
});
