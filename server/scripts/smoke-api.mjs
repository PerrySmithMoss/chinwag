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
