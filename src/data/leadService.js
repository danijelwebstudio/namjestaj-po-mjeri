import { localStore } from './localStore.js';
import { safeMime } from '../brief/fileRules.js';
export const live = import.meta.env.VITE_DATA_MODE === 'supabase';
const base = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
export const privacyUrl = import.meta.env.VITE_PRIVACY_URL || '';
export const statuses = { new: 'Novi upit', contacted: 'Kontaktiran', measuring: 'Zakazano mjerenje', quoted: 'Ponuda poslata', accepted: 'Prihvaćeno', declined: 'Odbijeno' };
let session = null;
function configured() {
  if (!base.startsWith('https://') || !key) throw new Error('Nedostaje podešavanje Supabasea. Pogledajte uputstvo u paketu.');
}
async function api(path, options = {}, authenticated = true) {
  configured();
  if (authenticated && !session) throw new Error('Prijavite se ponovo.');
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { apikey: key, ...(authenticated ? { Authorization: `Bearer ${session.access_token}` } : {}), 'Content-Type': 'application/json', ...options.headers },
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(response.status === 401 ? 'Sesija je istekla. Odjavite se i prijavite ponovo.' : 'Zahtjev nije uspio. Provjerite vezu i dozvole naloga.');
  return result;
}
export async function login(email, password) {
  const result = await api('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) }, false);
  session = result;
  try {
    const staff = await api('/rest/v1/staff?select=user_id');
    if (!staff?.length) throw new Error('Ovaj nalog nema pristup sandučetu firme.');
  } catch (error) { session = null; throw error; }
}
export async function logout() {
  try { if (session) await api('/auth/v1/logout', { method: 'POST' }); } finally { session = null; }
}
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
