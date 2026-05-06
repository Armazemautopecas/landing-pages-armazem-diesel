#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import Ajv from 'ajv';

const LANDING_BASE_DIR = new URL('../app/injecao-diesel/', import.meta.url).pathname;
const SCHEMA_PATH = new URL('../data/config.schema.json', import.meta.url).pathname;

async function main() {
  const schema = JSON.parse(await readFile(SCHEMA_PATH, 'utf8'));
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

    const ok = validate(cfg);
    if (!ok) {
      console.error(`✗ ${slug}/config.json:`);
      for (const err of validate.errors) {
        console.error(`    ${err.instancePath || '/'} ${err.message}`);
      }
      failures++;
    } else {
      console.log(`✓ ${slug}/config.json`);
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
