import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { on } from 'node:events';

const origin = new URL(process.env.SMOKE_API_ORIGIN);
assert.equal(origin.hostname, '127.0.0.1', 'chat tests require a local disposable server');

function request(path, { method = 'GET', cookie, body, browserOrigin } = {}) {
  const headers = {};
  if (cookie) headers.cookie = cookie;
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (browserOrigin) headers.origin = browserOrigin;
  return fetch(new URL(path, origin), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
}

async function account() {
  const username = randomUUID();
  const signup = await request('/api/sessions/register', {
    method: 'POST',
    body: { username, email: `${username}@example.invalid`, password: randomUUID(),
      firstName: 'Chat', lastName: 'Fixture' },
  });
  assert.equal(signup.status, 200);
  const cookie = signup.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
  const profile = await request('/api/users/me', { cookie });
  assert.equal(profile.status, 200);
  return { ...(await profile.json()), cookie };
}

async function ticket(account) {
  const response = await request('/api/sessions/socket-ticket', { method: 'POST', cookie: account.cookie });
  assert.equal(response.status, 200);
  return (await response.json()).ticket;
}

const sockets = [];
async function connect(auth, accepted) {
  const url = new URL('/socket.io/?EIO=4&transport=websocket', origin);
  url.protocol = 'ws:';
  const socket = new WebSocket(url);
  sockets.push(socket);
  const packets = on(socket, 'message', { signal: AbortSignal.timeout(15_000), close: ['close'] });

  async function readPacket() {
    for (;;) {
      const { value, done } = await packets.next();
      assert.equal(done, false, 'unexpected socket close');
      const [{ data }] = value;
      if (data === '2') socket.send('3');
      else return data;
    }
  }

  assert.match(await readPacket(), /^0/);
  socket.send('40' + JSON.stringify(auth));
  assert.match(await readPacket(), accepted ? /^40/ : /^44/);

  return {
    send: (event, ...args) => socket.send('42' + JSON.stringify([event, ...args])),
    async receive(event) {
      const packet = await readPacket();
      assert.match(packet, /^42/);
      const [name, body] = JSON.parse(packet.slice(2));
      assert.equal(name, event);
      return body;
    },
  };
}

try {
  const [alice, bob, outsider] = await Promise.all([account(), account(), account()]);
  const thread = `/api/messages/${alice.id}/${bob.id}`;
  const conversations = `/api/messages/${alice.id}`;
  assert.equal((await request(thread)).status, 403);
  assert.equal((await request(conversations, outsider)).status, 403);
  assert.equal((await request(thread, outsider)).status, 403);
  assert.equal((await request(`${thread}?cursor=invalid`, alice)).status, 400);
  assert.equal((await request('/api/sessions/socket-ticket', { method: 'POST' })).status, 403);
  assert.equal((await request('/api/sessions/socket-ticket', {
    method: 'POST', cookie: alice.cookie, browserOrigin: 'https://untrusted.example',
  })).status, 403);
  const refreshCookie = alice.cookie.split('; ').find(value => value.startsWith('refreshToken='));
  const accessCookie = alice.cookie.split('; ').find(value => value.startsWith('accessToken='));
  assert.equal((await request('/api/users/me', { cookie: refreshCookie })).status, 200);
  assert.equal((await request('/api/users/me', { cookie: refreshCookie.replace('refreshToken=', 'accessToken=') })).status, 403);
  const logout = await request('/api/sessions', { method: 'DELETE', cookie: alice.cookie });
  assert.ok(logout.headers.getSetCookie().every(value => /Expires=Thu, 01 Jan 1970/.test(value)));
  assert.equal(logout.headers.getSetCookie().length, 2);

  await connect({}, false);
  await connect({ ticket: accessCookie.split('=')[1] }, false);
  const [sender, receiver, stranger] = await Promise.all(
    [alice, bob, outsider].map(async account => connect({ ticket: await ticket(account) }, true))
  );

  stranger.send('join-user-room', bob.id);
  stranger.send('join-room', 'target', bob.id, alice.id);
  assert.equal((await stranger.receive('error')).message, 'Invalid conversation');
  stranger.send('send-message', 'target', alice.id, bob.id, 'forged');
  assert.equal((await stranger.receive('error')).message, 'Invalid message');
  sender.send('send-message', 'target', alice.id, bob.id, 'private message');
  const [sent, received] = await Promise.all([
    sender.receive('receive-message'), receiver.receive('receive-message'),
  ]);
  assert.deepEqual(sent, received);
  assert.equal(received.message, 'private message');
  assert.equal(received.senderId, alice.id);
  stranger.send('join-room', 'target', outsider.id, outsider.id);
  assert.deepEqual(await stranger.receive('room-messages'), [], 'an outsider must receive only their own history');

  const history = await request(thread, bob);
  assert.equal(history.status, 200);
  assert.deepEqual((await history.json()).map(message => message.id), [received.id]);
  const inbox = await request(conversations, alice);
  assert.equal(inbox.status, 200);
  assert.equal((await inbox.json())[0].receiver.username, bob.username);

  const avatar = await request(`/api/images/signature?avatarId=user-${bob.id}`, alice);
  assert.equal(avatar.status, 200);
  const { publicId } = await avatar.json();
  assert.equal(publicId, `chinwag/avatars/user-${alice.id}`);
  const version = 1;
  const signature = createHash('sha1').update(`public_id=${publicId}&version=${version}fixture`).digest('hex');
  const upload = {
    public_id: publicId, version, signature,
    image_url: `https://res.cloudinary.com/fixture/image/upload/v${version}/${publicId}.png`,
  };
  assert.equal((await request(`/api/users/avatar/${bob.id}`, {
    method: 'POST', cookie: alice.cookie, body: upload,
  })).status, 403);
  assert.equal((await request(`/api/users/avatar/${alice.id}`, {
    method: 'POST', cookie: alice.cookie, body: { ...upload, image_url: 'https://untrusted.example/avatar.png' },
  })).status, 400);
  assert.equal((await request(`/api/users/avatar/${alice.id}`, {
    method: 'POST', cookie: alice.cookie, body: upload,
  })).status, 200);
  console.log('Private history, authenticated sockets, session cookies, and avatar ownership passed');
} finally {
  for (const socket of sockets) socket.close();
}
