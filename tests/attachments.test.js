import test from 'node:test';
import assert from 'node:assert/strict';
import { checkFiles, safeMime, TOTAL_LIMIT } from '../src/brief/fileRules.js';
import { emptyBrief } from '../src/brief/briefLogic.js';
import { validatePayload, verifySignature } from '../supabase/functions/_shared/validate.js';
test('attachment counts, individual and aggregate sizes, prohibited formats', () => {
  const photo = { kind: 'photo', file: { name: 'space.jpg', size: 1024 } };
  assert.equal(checkFiles(Array(8).fill(photo)), '');
  assert.match(checkFiles(Array(9).fill(photo)), /8/);
  assert.match(checkFiles([{ kind: 'photo', name: 'script.svg', size: 100 }]), /Nepodržan/);
  assert.match(checkFiles([{ kind: 'photo', name: 'space.jpg', size: 11 * 1024 ** 2 }]), /10 MB/);
  assert.match(checkFiles(Array(3).fill({ kind: 'plan', name: 'plan.pdf', size: TOTAL_LIMIT / 2 })), /40 MB/);
  assert.equal(safeMime('untrusted.dxf'), 'application/octet-stream');
});
const valid = { id: '12345678-1234-4234-8234-123456789abc', consent: true, data: { ...emptyBrief, projectType: 'kitchen', location: 'Novi Sad', propertyType: 'Stan', budget: 'undecided', timeline: 'Kasnije', name: 'Demo', phone: '060123456' } };
test('server validates untrusted payload independently', () => {
  assert.equal(validatePayload(valid, []).name, 'Demo');
  assert.throws(() => validatePayload({ ...valid, consent: false }, []));
  assert.throws(() => validatePayload({ ...valid, data: { ...valid.data, name: '' } }, []));
  assert.throws(() => validatePayload({ ...valid, data: { ...valid.data, services: ['x'.repeat(200)] } }, []));
  assert.deepEqual(validatePayload({ ...valid, data: { ...valid.data, services: ['made-up', 'delivery'] } }, []).services, ['delivery']);
});
test('PDF and image signatures must match extensions', async () => {
  await verifySignature(new File(['%PDF-1.4\n'], 'plan.pdf'));
  await assert.rejects(verifySignature(new File(['<html>evil</html>'], 'plan.pdf')));
  await assert.rejects(verifySignature(new File(['not a photo'], 'space.jpg')));
});
