#!/usr/bin/env node
// Gate: validuje src/data/promises.json voči src/data/promises.schema.json (JSON Schema 2020-12).
// Non-zero exit pri akejkoľvek chybe (chýbajúci súbor, nevalidný JSON, porušenie schémy).
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '..', 'src', 'data');
const schemaPath = join(dataDir, 'promises.schema.json');
const dataPath = join(dataDir, 'promises.json');

async function readJson(path, label) {
  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch (err) {
    console.error(`✗ Nepodarilo sa načítať ${label} (${path}): ${err.message}`);
    process.exit(1);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error(`✗ ${label} nie je validný JSON (${path}): ${err.message}`);
    process.exit(1);
  }
}

const schema = await readJson(schemaPath, 'schéma sľubníka');
const data = await readJson(dataPath, 'dáta sľubníka');

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

let validate;
try {
  validate = ajv.compile(schema);
} catch (err) {
  console.error(`✗ Schéma sa nedá skompilovať: ${err.message}`);
  process.exit(1);
}

if (!validate(data)) {
  console.error('✗ promises.json NIE JE validný voči schéme:');
  for (const e of validate.errors ?? []) {
    console.error(`  • ${e.instancePath || '(root)'} ${e.message}`);
  }
  process.exit(1);
}

console.log('✓ promises.json je validný voči promises.schema.json');
