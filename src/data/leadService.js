import { createAuthSession } from './authSession.js';
import { localStore } from './localStore.js';
import { safeMime } from '../brief/fileRules.js';
export const live = import.meta.env.VITE_DATA_MODE === 'supabase';
const base = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
export const privacyUrl = import.meta.env.VITE_PRIVACY_URL || '';
export const statuses = { new: 'Novi upit', contacted: 'Kontaktiran', measuring: 'Zakazano mjerenje', quoted: 'Ponuda poslata', accepted: 'Prihvaćeno', declined: 'Odbijeno' };
function sessionStorage() { try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; } }
const auth = createAuthSession({ base, key, storage: sessionStorage() });
function configured() {
  if (!base.startsWith('https://') || !key) throw new Error('Nedostaje podešavanje Supabasea. Pogledajte uputstvo u paketu.');
}
async function api(path, options = {}, authenticated = true) {
  configured();
  const request = async (forceRefresh = false) => fetch(`${base}${path}`, {
    ...options,
    headers: {
      apikey: key,
      ...(authenticated ? { Authorization: `Bearer ${await auth.getAccessToken(forceRefresh)}` } : {}),
      'Content-Type': 'application/json', ...options.headers,
    },
  });
  let response = await request();
  if (authenticated && response.status === 401) response = await request(true);
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) { auth.clear(); throw new Error('Sesija je istekla. Prijavite se ponovo.'); }
    throw new Error(response.status === 403 ? 'Nalog nema dozvolu za ovu radnju.' : 'Zahtjev nije uspio. Provjerite vezu i dozvole naloga.');
  }
  return result;
}
async function verifyStaff() {
  const staff = await api('/rest/v1/staff?select=user_id');
  if (!staff?.length) throw new Error('Ovaj nalog nema pristup sandučetu firme.');
}
export async function login(email, password) {
  configured();
  await auth.login(email, password);
  try { await verifyStaff(); } catch (error) { auth.clear(); throw error; }
}
export async function restoreLogin() {
  if (!live || !auth.hasSession()) return false;
  // Re-check membership on every reload; local storage is not proof of authorization.
  try { await verifyStaff(); return true; }
  catch (error) {
    if (/Sesija je istekla|Prijavite se ponovo|nema pristup|nema dozvolu/.test(error.message)) auth.clear();
    throw error;
  }
}
export async function logout() { await auth.logout(); }
export async function submitLead({ id, data, files, token, onProgress }) {
  const reference = `PM-${id.slice(0, 8).toUpperCase()}`;
  if (!live) {
    const existing = await localStore('leads', 'get', id);
    if (!existing) await localStore('leads', 'put', { id, reference, data, files, created_at: new Date().toISOString(), status: 'new', internal_note: '', demo: true });
    onProgress(100);
    return { id, reference, demo: true };
  }
  configured();
  if (!siteKey || !privacyUrl) throw new Error('Pravo slanje nije podešeno: nedostaju zaštita od spama ili link politike privatnosti.');
  const form = new FormData();
  form.append('payload', JSON.stringify({ id, data, token, consent: true }));
  files.forEach((item) => form.append(item.kind, item.file, item.file.name));
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${base}/functions/v1/submit-brief`);
    xhr.setRequestHeader('apikey', key);
    xhr.timeout = 180000;
    xhr.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.min(95, Math.round(event.loaded / event.total * 95))); };
    xhr.onerror = xhr.ontimeout = () => reject(new Error('Veza je prekinuta ili je slanje isteklo. Podaci su ostali ovdje; pokušajte ponovo.'));
    xhr.onload = () => {
      let result;
      try { result = JSON.parse(xhr.responseText); } catch { reject(new Error('Server nije vratio potvrdu. Pokušajte ponovo.')); return; }
      if (xhr.status < 200 || xhr.status >= 300) { reject(new Error(result.error || 'Slanje nije uspjelo.')); return; }
      onProgress(100); resolve(result);
    };
    xhr.send(form);
  });
}
export async function listLeads() {
  if (!live) return (await localStore('leads', 'getAll')).sort((a, b) => b.created_at.localeCompare(a.created_at));
  return api('/rest/v1/leads?select=*&order=created_at.desc&limit=200');
}
export async function updateLead(id, status, internal_note) {
  if (!Object.hasOwn(statuses, status)) throw new Error('Nepoznat status.');
  if (!live) {
    const lead = await localStore('leads', 'get', id);
    if (!lead) throw new Error('Upit nije pronađen.');
    await localStore('leads', 'put', { ...lead, status, internal_note }); return;
  }
  const changed = await api(`/rest/v1/leads?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status, internal_note }) });
  if (!changed?.length) throw new Error('Upit nije izmijenjen. Provjerite da nalog i dalje ima pristup.');
}
export async function getAttachmentURL(item) {
  if (!live) return { url: URL.createObjectURL(new Blob([item.file], { type: safeMime(item.file.name) })), local: true };
  const result = await api(`/storage/v1/object/sign/brief-files/${item.path}`, { method: 'POST', body: JSON.stringify({ expiresIn: 300 }) });
  return { url: `${base}/storage/v1${result.signedURL}`, local: false };
}
