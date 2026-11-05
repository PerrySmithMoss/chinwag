import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const origin = new URL(process.env.SMOKE_API_ORIGIN);
assert.equal(origin.hostname, '127.0.0.1', 'account tests require a local disposable server');

async function request(path, { method = 'GET', cookie, body } = {}) {
  const headers = {};
  if (cookie) headers.cookie = cookie;
  if (body !== undefined) headers['content-type'] = 'application/json';
  return fetch(new URL(path, origin), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
}

async function account(fields = {}) {
  const username = randomUUID();
  const email = `${username}@example.invalid`;
  const password = randomUUID();
  const signup = await request('/api/sessions/register', {
    method: 'POST',
    body: { username, email, password, firstName: 'Test', lastName: 'Account', ...fields },
  });
  assert.equal(signup.status, 200);
  const cookie = signup.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
  const profile = await request('/api/users/me', { cookie });
  assert.equal(profile.status, 200);
  return { ...(await profile.json()), cookie, email, password };
}

const owner = await account();
const other = await account({ id: 1234567 });

const path = `/api/users/${owner.id}`;
assert.equal((await request(path, { method: 'DELETE' })).status, 403, 'anonymous deletion');
assert.notEqual(other.id, 1234567, 'registration must generate its own account ID');
assert.equal((await request(path, { method: 'DELETE', cookie: other.cookie })).status, 403, 'cross-account deletion');
assert.equal((await request(`${path}suffix`, { method: 'DELETE', cookie: owner.cookie })).status, 400, 'malformed ID');

const body = { firstName: 'Updated' };
assert.equal((await request(path, { method: 'PATCH', body })).status, 403, 'anonymous edit');
assert.equal((await request(path, { method: 'PATCH', cookie: other.cookie, body })).status, 403, 'cross-account edit');
for (const fields of [{ id: 1234567 }, { password: 'unhashed' }, { email: 'elsewhere@example.invalid' }, { sender: { deleteMany: {} } }]) {
  const response = await request(path, { method: 'PATCH', cookie: owner.cookie, body: fields });
  assert.equal(response.status, 400, 'only profile fields may be edited');
}

const edited = await request(path, { method: 'PATCH', cookie: owner.cookie, body });
assert.equal(edited.status, 201);
assert.equal((await edited.json()).firstName, body.firstName);

const deletion = await request(path, { method: 'DELETE', cookie: owner.cookie });
assert.equal(deletion.status, 201, 'owner may delete their own account');
assert.equal((await request(path, { method: 'DELETE', cookie: owner.cookie })).status, 400, 'already deleted');
for (const [user, status] of [[owner, 401], [other, 200]]) {
  const login = await request('/api/sessions/create', { method: 'POST', body: { email: user.email, password: user.password } });
  assert.equal(login.status, status, 'only the requested owner account was removed');
}
console.log('Account ownership, profile fields, and self-deletion checks passed');
