import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const origin = process.env.SMOKE_API_ORIGIN ?? 'http://127.0.0.1:5560';
const id = process.env.SMOKE_ID ?? randomUUID();
const email = `release-smoke-${id}@example.invalid`;
const username = `smoke-${id}`;
const password = randomUUID();

async function post(path, body) {
  return fetch(new URL(path, origin), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
}

// Health checks must work without credentials or redirects, including with a
// stale cookie, and must not issue a session or expose application internals.
for (const headers of [{}, { cookie: 'accessToken=invalid; refreshToken=invalid' }]) {
  const health = await fetch(new URL('/healthz', origin), {
    headers, redirect: 'manual', signal: AbortSignal.timeout(10000),
  });
  assert.equal(health.status, 200);
  assert.match(health.headers.get('content-type'), /^application\/json/);
  assert.equal(health.headers.get('cache-control'), 'no-store');
  assert.equal(health.headers.get('set-cookie'), null);
  assert.deepEqual(await health.json(), { status: 'ok' });
}
const head = await fetch(new URL('/healthz', origin), {
  method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(10000),
});
assert.equal(head.status, 200);
assert.equal(head.headers.get('cache-control'), 'no-store');
assert.equal(await head.text(), '');
console.log('Public GET/HEAD health checks passed');

assert.equal((await fetch(new URL('/api/users/me', origin))).status, 403);
const register = await post('/api/sessions/register', {
  email, username, password, firstName: 'Release', lastName: 'Smoke',
});
assert.equal(register.status, 200, 'test user registration');
assert.equal((await post('/api/sessions/create', { email, password: 'invalid' })).status, 401);
const login = await post('/api/sessions/create', { email, password });
assert.equal(login.status, 200, 'sign in with the test user');
const cookie = login.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
const me = await fetch(new URL('/api/users/me', origin), { headers: { cookie } });
assert.equal(me.status, 200);
const user = await me.json();
assert.equal(user.username, username);
const messages = await fetch(new URL(`/api/messages/${user.id}`, origin), { headers: { cookie } });
assert.equal(messages.status, 200);
assert.deepEqual(await messages.json(), []);
console.log('Registration, sign-in and messaging read passed');
