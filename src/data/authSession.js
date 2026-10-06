/** Minimal GoTrue password/refresh session adapter. Never stores passwords. */
export function createAuthSession({ base, key, storage, fetchImpl = (...args) => fetch(...args) }) {
  const storageKey = `pm-inbox-session:${base}`;
  const read = () => { try { return storage?.getItem(storageKey); } catch { return null; } };
  const write = (value) => { try { if (value) storage?.setItem(storageKey, JSON.stringify(value)); else storage?.removeItem(storageKey); } catch { /* Browsers can block storage; in-memory session still works. */ } };
  let session = null;
  try {
    const value = JSON.parse(read() || 'null');
    if (typeof value?.access_token === 'string' && typeof value?.refresh_token === 'string' && Number.isFinite(value.expires_at)) session = value;
  } catch { write(null); }
  let inflight = null;
  function clear() { session = null; write(null); }
  function save(value) {
    if (!value?.access_token || !value?.refresh_token || !Number.isFinite(value.expires_in)) throw new Error('Server nije vratio valjanu sesiju.');
    session = { access_token: value.access_token, refresh_token: value.refresh_token, expires_at: Math.floor(Date.now() / 1000) + value.expires_in };
    write(session);
  }
  async function tokenRequest(grant, body) {
    const response = await fetchImpl(`${base}/auth/v1/token?grant_type=${grant}`, { method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) {
      const err = new Error(grant === 'password' ? 'Pogrešan email ili lozinka, ili prijava nije dostupna.' : 'Sesiju nije moguće obnoviti.');
      err.status = response.status;
      throw err;
    }
    return response.json();
  }
  async function login(email, password) { clear(); save(await tokenRequest('password', { email, password })); }
  async function refresh() {
    if (inflight) return inflight;
    if (!session?.refresh_token) throw new Error('Prijavite se ponovo.');
    const refreshToken = session.refresh_token;
    inflight = (async () => {
      try { save(await tokenRequest('refresh_token', { refresh_token: refreshToken })); }
      catch (error) {
        if ([400, 401, 403].includes(error.status)) { clear(); throw new Error('Sesija je istekla. Prijavite se ponovo.'); }
        throw error; // Network/server failure must not discard a valid refresh token.
      }
    })();
    try { await inflight; } finally { inflight = null; }
  }
  async function getAccessToken(forceRefresh = false) {
    if (!session) throw new Error('Prijavite se ponovo.');
    if (forceRefresh || session.expires_at <= Date.now() / 1000 + 60) await refresh();
    return session.access_token;
  }
  async function logout() {
    const token = session?.access_token;
    clear(); // Always log out locally, even when remote network is unavailable.
    if (token) await fetchImpl(`${base}/auth/v1/logout`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${token}` } });
  }
  return { login, getAccessToken, clear, logout, hasSession: () => !!session };
}
