import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyBrief } from '../src/brief/briefLogic.js';
let handler;
globalThis.Deno = { env: { get: (key) => ({ SUPABASE_URL: 'https://server.example', SUPABASE_SERVICE_ROLE_KEY: 'test-only', ALLOWED_ORIGINS: 'https://site.example', TURNSTILE_SECRET_KEY: 'test-only' })[key] }, serve: (fn) => { handler = fn; } };
await import('../supabase/functions/submit-brief/index.ts');
const payload = { id: '12345678-1234-4234-8234-123456789abc', consent: true, token: 'test-token', data: { ...emptyBrief, projectType: 'kitchen', location: 'Novi Sad', propertyType: 'Stan', name: 'Test', phone: '060123456', budget: 'undecided', timeline: 'Kasnije' } };
function request(origin = 'https://site.example') {
  const form = new FormData(); form.append('payload', JSON.stringify(payload)); form.append('plan', new File(['%PDF-1.4\n%%EOF'], 'plan.pdf'));
  return new Request('https://server.example/functions/v1/submit-brief', { method: 'POST', headers: { Origin: origin }, body: form });
}
function mock({ reserve = 'reserved', uploadFail = false, commitLost = false } = {}) {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push([String(url), options]);
    if (url.includes('siteverify')) return Response.json({ success: true, hostname: 'site.example', action: 'brief' });
    if (url.includes('reserve_brief')) return Response.json(reserve);
    if (url.includes('/object/brief-files/') && options.method === 'POST') return uploadFail ? new Response('', { status: 503 }) : Response.json({});
    if (url.includes('complete_brief')) { if (commitLost) throw new Error('Response lost'); return new Response(null, { status: 204 }); }
    if (url.includes('/leads?')) return Response.json([{ id: payload.id, reference: 'PM-12345678' }]);
    return Response.json({});
  };
  return calls;
}
test('public endpoint blocks other origins and commits only after files upload', async () => {
  const calls = mock();
  assert.equal((await handler(request('https://other.example'))).status, 403);
  assert.equal(calls.length, 0);
  const response = await handler(request()); assert.equal(response.status, 201);
  assert.equal((await response.json()).reference, 'PM-12345678');
  const upload = calls.findIndex(([url]) => url.includes('/object/brief-files/'));
  const commit = calls.findIndex(([url]) => url.includes('complete_brief'));
  assert.ok(upload >= 0 && commit > upload);
});
test('duplicate retry returns existing receipt without another upload', async () => {
  const calls = mock({ reserve: 'complete' });
  assert.equal((await handler(request())).status, 200);
  assert.ok(!calls.some(([url]) => url.includes('/object/brief-files/')));
});
test('failed attachment prevents success and triggers cleanup', async () => {
  const calls = mock({ uploadFail: true });
  assert.equal((await handler(request())).status, 400);
  assert.ok(!calls.some(([url]) => url.includes('complete_brief')));
  assert.ok(calls.some(([url, options]) => url.includes('/object/brief-files') && options.method === 'DELETE'));
});
test('lost commit response checks saved lead and does not delete its attachments', async () => {
  const calls = mock({ commitLost: true });
  assert.equal((await handler(request())).status, 200);
  assert.ok(!calls.some(([, options]) => options.method === 'DELETE'));
});
