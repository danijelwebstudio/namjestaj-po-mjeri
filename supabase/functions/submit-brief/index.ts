import { validatePayload, verifySignature } from '../_shared/validate.js';
import { safeMime, TOTAL_LIMIT, extension } from '../_shared/fileRules.js';

const url = Deno.env.get('SUPABASE_URL')!;
const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const origins = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map((value) => value.trim());
const headers = { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' };
async function backend(path: string, options: RequestInit = {}) {
  const response = await fetch(url + path, { ...options, headers: { ...headers, ...options.headers } });
  if (!response.ok) throw new Error('Server trenutno ne može sačuvati upit. Pokušajte ponovo.');
  return response.status === 204 ? null : response.json().catch(() => null);
}
async function sha(value: ArrayBuffer | string) {
  const digest = await crypto.subtle.digest('SHA-256', typeof value === 'string' ? new TextEncoder().encode(value) : value);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
async function boundedForm(req: Request) {
  const reader = req.body?.getReader();
  if (!reader) throw new Error('Prazan zahtjev.');
  const chunks: BlobPart[] = []; let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > TOTAL_LIMIT + 100000) { await reader.cancel(); throw new Error('Zahtjev je prevelik. Prilozi zajedno mogu imati do 40 MB.'); }
    chunks.push(value.slice().buffer as ArrayBuffer);
  }
  return new Response(new Blob(chunks), { headers: { 'Content-Type': req.headers.get('Content-Type') || '' } }).formData();
}
Deno.serve(async (req: Request) => {
  const origin = req.headers.get('Origin') || '';
  const cors = { 'Access-Control-Allow-Origin': origins.includes(origin) ? origin : '', 'Access-Control-Allow-Headers': 'apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', Vary: 'Origin' };
  const reply = (body: object, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  if (!origin || !origins.includes(origin)) return reply({ error: 'Porijeklo zahtjeva nije dozvoljeno.' }, 403);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return reply({ error: 'Metoda nije dozvoljena.' }, 405);
  const uploaded: string[] = []; let reserved = ''; let committed = false; let commitAttempted = false;
  try {
    const form = await boundedForm(req);
    const raw = form.get('payload');
    if (typeof raw !== 'string' || raw.length > 60000) return reply({ error: 'Neispravni podaci formulara.' }, 400);
    const payload = JSON.parse(raw);
    const files: { kind: string; file: File }[] = [];
    for (const [kind, value] of form.entries()) {
      if (kind === 'payload') continue;
      if (!(value instanceof File) || !['photo','plan'].includes(kind) || value.name.length > 180) return reply({ error: 'Neispravan prilog.' }, 400);
      files.push({ kind, file: value });
    }
    const data = validatePayload(payload, files);
    const captchaSecret = Deno.env.get('TURNSTILE_SECRET_KEY');
    if (!captchaSecret || !payload.token) return reply({ error: 'Zaštita od spama nije podešena ili provjera nije završena.' }, 400);
    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret: captchaSecret, response: payload.token }) });
    const verification = await check.json();
    if (!verification.success || verification.action !== 'brief' || verification.hostname !== new URL(origin).hostname) return reply({ error: 'Provjera je istekla. Ponovite provjeru i pokušajte opet.' }, 400);
    const hashes = [];
    for (const item of files) { await verifySignature(item.file); hashes.push(await sha(await item.file.arrayBuffer())); }
    const manifestHash = await sha(JSON.stringify({ data, files: files.map((item, index) => ({ kind: item.kind, name: item.file.name, size: item.file.size, hash: hashes[index] })) }));
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ipHash = await sha(`${captchaSecret}:${ip}`);
    const state = await backend('/rest/v1/rpc/reserve_brief', { method: 'POST', body: JSON.stringify({ request_id: payload.id, request_ip: ipHash, request_hash: manifestHash }) });
    const reference = `PM-${payload.id.slice(0, 8).toUpperCase()}`;
    if (state === 'complete') return reply({ id: payload.id, reference });
    if (state === 'processing') return reply({ error: 'Ovaj upit se već obrađuje. Sačekajte minut pa pokušajte ponovo.' }, 409);
    if (state === 'limited') return reply({ error: 'Previše upita sa ove mreže. Pokušajte kasnije.' }, 429);
    if (state !== 'reserved') return reply({ error: 'Izmijenjeni podaci koriste raniji broj slanja. Sačuvajte unos i učitajte ga prije novog pokušaja.' }, 409);
    reserved = payload.id;
    const records = [];
    for (const item of files) {
      const path = `${payload.id}/${crypto.randomUUID()}.${extension(item.file.name)}`;
      // Register path first: if the response is lost, cleanup still removes a potentially saved object.
      uploaded.push(path);
      const response = await fetch(`${url}/storage/v1/object/brief-files/${path}`, { method: 'POST', headers: { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': safeMime(item.file.name), 'x-upsert': 'false' }, body: item.file });
      if (!response.ok) throw new Error(`Prilog nije sačuvan: ${item.file.name}. Pokušajte ponovo.`);
      records.push({ path, name: item.file.name, size: item.file.size, kind: item.kind });
    }
    commitAttempted = true;
    await backend('/rest/v1/rpc/complete_brief', { method: 'POST', body: JSON.stringify({ request_id: payload.id, request_data: data, request_files: records, request_reference: reference }) });
    committed = true;
    return reply({ id: payload.id, reference }, 201);
  } catch (error) {
    // A lost commit response must NEVER delete files from a successfully received lead.
    if (reserved && commitAttempted) {
      try {
        const rows = await backend(`/rest/v1/leads?id=eq.${reserved}&select=id,reference`);
        if (rows?.length) { committed = true; return reply(rows[0]); }
      } catch { return reply({ error: 'Čekamo potvrdu servera. Ponovite isti zahtjev kasnije; nemojte mijenjati podatke.' }, 503); }
    }
    if (reserved && !committed) {
      try {
        if (uploaded.length) await backend('/storage/v1/object/brief-files', { method: 'DELETE', body: JSON.stringify({ prefixes: uploaded }) });
        await backend(`/rest/v1/brief_requests?id=eq.${reserved}`, { method: 'PATCH', body: JSON.stringify({ state: 'failed' }) });
      } catch { /* Keep reservation locked if cleanup fails; operator can inspect and safely retry. */ }
    }
    return reply({ error: error instanceof Error && !(error instanceof SyntaxError) ? error.message : 'Neispravan zahtjev.' }, 400);
  }
});
