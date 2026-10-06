import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthSession } from '../src/data/authSession.js';
function environment() {
  const store = new Map(); const calls = [];
  const storage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value), removeItem: (key) => store.delete(key) };
  let error = false;
  const fetchImpl = async (url, options) => {
    calls.push([url, options]);
    if (url.includes('/logout')) { if (error) throw new Error('Network unavailable'); return Response.json({}); }
    const refresh = url.includes('refresh_token');
    return Response.json({ access_token: refresh ? 'access-new' : 'access-old', refresh_token: refresh ? 'refresh-new' : 'refresh-old', expires_in: refresh ? 3600 : 0 });
  };
  const create = () => createAuthSession({ base: 'https://my-project.example', key: 'anon-key', storage, fetchImpl });
  return { create, calls, store, failLogout: () => { error = true; } };
}
test('login persists only tokens, refresh rotates token, restore survives new instance', async () => {
  const env = environment(); const auth = env.create();
  await auth.login('user@example.com', 'password-do-not-save');
  assert.ok(env.store.size === 1);
  assert.doesNotMatch([...env.store.values()][0], /password-do-not-save/);
  const restored = env.create();
  assert.equal(restored.hasSession(), true);
  assert.equal(await restored.getAccessToken(), 'access-new');
  assert.equal(JSON.parse([...env.store.values()][0]).refresh_token, 'refresh-new');
  assert.deepEqual(JSON.parse(env.calls.at(-1)[1].body), { refresh_token: 'refresh-old' });
});
test('concurrent requests share one refresh, logout clears even when offline', async () => {
  const env = environment(); const auth = env.create();
  await auth.login('test@example.com', 'secret');
  assert.deepEqual(await Promise.all([auth.getAccessToken(), auth.getAccessToken()]), ['access-new', 'access-new']);
  assert.equal(env.calls.filter(([url]) => url.includes('refresh_token')).length, 1);
  env.failLogout();
  await assert.rejects(auth.logout());
  assert.equal(auth.hasSession(), false);
  assert.equal(env.store.size, 0);
});
test('invalid refresh token clears session without saving password', async () => {
  const env = environment(); const auth = env.create(); await auth.login('test@example.com', 'secret');
  const other = createAuthSession({
    base: 'https://my-project.example', key: 'anon-key',
    storage: { getItem: (key) => env.store.get(key), removeItem: (key) => env.store.delete(key), setItem: (key, value) => env.store.set(key, value) },
    fetchImpl: async () => new Response('invalid refresh token', { status: 400 }),
  });
  await assert.rejects(other.getAccessToken(), /Sesija je istekla/);
  assert.equal(other.hasSession(), false);
  assert.equal(env.store.size, 0);
});
