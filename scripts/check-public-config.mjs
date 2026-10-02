const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_TURNSTILE_SITE_KEY', 'VITE_PRIVACY_URL'];
for (const name of required) {
  if (!process.env[name]?.trim()) throw new Error(`Nedostaje GitHub Actions variable: ${name}`);
}
for (const name of ['VITE_SUPABASE_URL', 'VITE_PRIVACY_URL']) {
  const url = new URL(process.env[name]);
  if (url.protocol !== 'https:' || ['localhost', '127.0.0.1'].includes(url.hostname)) {
    throw new Error(`${name} mora biti javna HTTPS adresa.`);
  }
}
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!key.startsWith('sb_publishable_')) {
  let role;
  try { role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role; } catch {}
  if (role !== 'anon') throw new Error('Koristi javni publishable ili anon ključ, nikada secret/service_role.');
}
console.log('Javna podešavanja su popunjena.');
