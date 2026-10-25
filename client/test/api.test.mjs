import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { api } from '../src/api.js';
const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
afterEach(() => { globalThis.fetch = originalFetch; if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow; });

test('protected writes send the Bearer token and JSON body', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/projects'); assert.equal(options.headers.Authorization, 'Bearer test-token');
    assert.equal(options.headers['Content-Type'], 'application/json'); assert.deepEqual(JSON.parse(options.body), { title: 'A project' });
    return Response.json({ project: { title: 'A project' } }, { status: 201 });
  };
  const result = await api('/projects', { token: 'test-token', method: 'POST', body: { title: 'A project' } });
  assert.equal(result.project.title, 'A project');
});
test('successful deletion does not try to parse an empty response', async () => {
  globalThis.fetch = async () => new Response(null, { status: 204 });
  assert.equal(await api('/projects/id', { method: 'DELETE' }), null);
});
test('validation errors retain field details and HTTP status', async () => {
  globalThis.fetch = async () => Response.json({ error: { message: 'Check your email.', fields: { email: 'Invalid address.' } } }, { status: 400 });
  await assert.rejects(api('/contact'), error => error.status === 400 && error.fields.email === 'Invalid address.');
});
test('an expired request identifies its token so it cannot clear a newer session', async () => {
  let expiredToken;
  globalThis.window = { dispatchEvent(event) { expiredToken = event.detail.token; } };
  globalThis.fetch = async () => Response.json({ error: { message: 'Please sign in again.' } }, { status: 401 });
  await assert.rejects(api('/users/me', { token: 'old-token' }), error => error.status === 401);
  assert.equal(expiredToken, 'old-token');
});
test('network failures provide a recoverable message', async () => {
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(api('/profile'), /Unable to reach the service/);
});
test('non-JSON service errors do not expose a hosting-provider error page', async () => {
  globalThis.fetch = async () => new Response('<h1>Internal provider details</h1>', { status: 503 });
  await assert.rejects(api('/blog'), error => error.status === 503 && /temporarily unavailable/.test(error.message) && !error.message.includes('provider details'));
});
test('a stalled request times out instead of leaving the page loading forever', async () => {
  globalThis.fetch = (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true }));
  await assert.rejects(api('/projects', { timeoutMs: 15 }), /taking longer than expected/);
});
test('leaving a page cancels its request without reporting a network failure', async () => {
  const controller = new AbortController();
  globalThis.fetch = (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true }));
  const pending = api('/blog', { signal: controller.signal }); controller.abort();
  await assert.rejects(pending, error => error.name === 'AbortError');
});
