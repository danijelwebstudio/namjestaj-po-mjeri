import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as client from '../src/brief/fileRules.js';
import * as server from '../supabase/functions/_shared/fileRules.js';
test('front end and Edge Function enforce identical upload policy', () => {
  assert.equal(readFileSync(new URL('../src/brief/fileRules.js', import.meta.url), 'utf8'), readFileSync(new URL('../supabase/functions/_shared/fileRules.js', import.meta.url), 'utf8'));
  assert.deepEqual(client.PHOTO_EXTENSIONS, server.PHOTO_EXTENSIONS);
  assert.deepEqual(client.PLAN_EXTENSIONS, server.PLAN_EXTENSIONS);
  assert.equal(client.TOTAL_LIMIT, server.TOTAL_LIMIT);
});
test('Edge Function imports no modules from frontend src tree', () => {
  for (const file of ['../supabase/functions/_shared/validate.js', '../supabase/functions/submit-brief/index.ts']) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /from\s*['"][^'"]*\/src\//);
  }
});
