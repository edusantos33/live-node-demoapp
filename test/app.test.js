const assert = require('node:assert/strict');
const test = require('node:test');
const app = require('../src/index');

async function request(path, options = {}) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  try {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, options);
    const text = await response.text();
    return { response, text };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('health endpoint returns ok', async () => {
  const { response, text } = await request('/api/health');
  assert.equal(response.status, 200);
  const body = JSON.parse(text);
  assert.equal(body.status, 'ok');
});

test('home page renders', async () => {
  const { response, text } = await request('/');
  assert.equal(response.status, 200);
  assert.match(text, /Demo para live de DevSecOps/);
});

test('api version returns JSON', async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/version`);
  const body = await response.json();
  await new Promise((resolve) => server.close(resolve));
  assert.equal(response.status, 200);
  assert.equal(body.version, '1.0.0');
});
