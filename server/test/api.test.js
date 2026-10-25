import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.DEMO_MODE = 'true';
process.env.MONGODB_URI = '';
process.env.JWT_SECRET = 'integration-test-secret-at-least-32-characters';
process.env.CLIENT_ORIGIN = 'https://waisery-portfolio.vercel.app/,http://localhost:5173';
process.env.MONGOMS_DOWNLOAD_DIR = fileURLToPath(new URL('../.data/binaries', import.meta.url));
process.env.MONGOMS_DOWNLOAD_IGNORE_MISSING_HEADER = 'true';
const { default: app } = await import('../src/app.js');
const { default: User } = await import('../src/models/User.js');
const { default: Project } = await import('../src/models/Project.js');
const { default: BlogPost } = await import('../src/models/BlogPost.js');
const { default: Comment } = await import('../src/models/Comment.js');
const { default: Message } = await import('../src/models/Message.js');
const { issueSession } = await import('../src/middleware/auth.js');
let mongo, admin, alice, bob, projectId, postId;
const bearer = user => `Bearer ${issueSession(user).token}`;
before(async () => {
  mongo = await MongoMemoryServer.create({ binary: { downloadDir: process.env.MONGOMS_DOWNLOAD_DIR } });
  await mongoose.connect(mongo.getUri(), { dbName: 'waisery-integration' });
  await Promise.all([User.init(), Project.init(), BlogPost.init(), Comment.init(), Message.init()]);
  [admin, alice, bob] = await User.create([
    { username: 'Admin', email: 'admin@example.com', password: 'AdminTest!2026', role: 'admin' },
    { username: 'Alice', email: 'alice@example.com', password: 'AliceTest!2026' },
    { username: 'Bob', email: 'bob@example.com', password: 'BobTest!2026' },
  ]);
});
after(async () => { await mongoose.disconnect(); if (mongo) await mongo.stop(); });

test('health confirms real database connectivity and security headers', async () => {
  const res = await request(app).get('/api/health').expect(200);
  assert.equal(res.body.database, 'connected'); assert.ok(res.headers['x-content-type-options']); assert.equal(res.headers['x-powered-by'], undefined);
});
test('profile is served by the API with confirmed identity', async () => {
  const res = await request(app).get('/api/profile').expect(200); assert.equal(res.body.profile.name, 'Waisery'); assert.equal(res.body.demo, true);
});
test('the production frontend can read API data and preflight authenticated writes', async () => {
  const origin = 'https://waisery-portfolio.vercel.app';
  const res = await request(app).get('/api/profile').set('Origin', origin).expect(200);
  assert.equal(res.headers['access-control-allow-origin'], origin);
  const preflight = await request(app).options('/api/projects').set('Origin', origin).set('Access-Control-Request-Method', 'POST').set('Access-Control-Request-Headers', 'authorization,content-type').expect(204);
  assert.equal(preflight.headers['access-control-allow-origin'], origin);
  assert.match(preflight.headers['access-control-allow-headers'], /authorization/);
  const denied = await request(app).get('/api/profile').set('Origin', 'https://untrusted.example').expect(200);
  assert.equal(denied.headers['access-control-allow-origin'], undefined);
});
test('production includes the exact deployed frontend even with a stale extra origin', () => {
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', "const {config}=await import('./src/config.js'); console.log(JSON.stringify(config.origins));"], { cwd: fileURLToPath(new URL('..', import.meta.url)), env: { ...process.env, NODE_ENV: 'production', DEMO_MODE: 'false', MONGODB_URI: 'mongodb://localhost/test', CLIENT_ORIGIN: 'https://extra.example/path/,javascript:invalid' }, encoding: 'utf8' });
  assert.equal(result.status, 0); assert.deepEqual(JSON.parse(result.stdout), ['https://waisery-portfolio.vercel.app', 'https://extra.example']);
});
test('registration hashes passwords, issues a JWT and strips injected roles', async () => {
  const res = await request(app).post('/api/users/register').send({ username: 'Reader', email: 'reader@example.com', password: 'ReaderTest!2026', role: 'admin' }).expect(201);
  assert.equal(res.body.user.role, 'author'); assert.ok(res.body.token); assert.equal(res.body.user.password, undefined);
  const stored = await User.findOne({ email: 'reader@example.com' }).select('+password');
  assert.notEqual(stored.password, 'ReaderTest!2026'); assert.match(stored.password, /^\$2/); assert.equal(await stored.comparePassword('ReaderTest!2026'), true);
});
test('registration validates missing fields and bcrypt byte limit', async () => {
  const invalid = await request(app).post('/api/users/register').send({ username: '', email: 'bad', password: 'a' }).expect(400);
  assert.ok(invalid.body.error.fields.email); assert.ok(invalid.body.error.fields.password);
  await request(app).post('/api/users/register').send({ username: 'LongPassword', email: 'long@example.com', password: '界'.repeat(30) }).expect(400);
});
test('duplicate identities return a safe conflict response', async () => {
  const res = await request(app).post('/api/users/register').send({ username: 'Other', email: 'alice@example.com', password: 'ValidPass123' }).expect(409);
  assert.match(res.body.error.message, /already in use/);
});
test('login accepts the correct password and rejects incorrect credentials', async () => {
  const res = await request(app).post('/api/users/login').send({ email: 'ALICE@example.com', password: 'AliceTest!2026' }).expect(200);
  assert.equal(res.body.user.username, 'Alice'); assert.equal(res.body.password, undefined);
  await request(app).post('/api/users/login').send({ email: 'alice@example.com', password: 'incorrect' }).expect(401);
});
test('authentication rejects missing, invalid and tampered tokens', async () => {
  await request(app).get('/api/users/me').expect(401);
  await request(app).get('/api/users/me').set('Authorization', 'Bearer invalid').expect(401);
  const token = issueSession(alice).token;
  await request(app).get('/api/users/me').set('Authorization', `Bearer ${token.slice(0, -5)}wrong`).expect(401);
  const res = await request(app).get('/api/users/me').set('Authorization', bearer(alice)).expect(200); assert.equal(res.body.user._id, String(alice._id));
});
test('only administrators can create portfolio projects and ownership comes from the session', async () => {
  const payload = { title: 'Test project', description: 'A complete project description.', imageUrl: '/images/stillwater.webp', tags: ['React'], user: String(bob._id) };
  await request(app).post('/api/projects').send(payload).expect(401);
  await request(app).post('/api/projects').set('Authorization', bearer(alice)).send(payload).expect(403);
  const res = await request(app).post('/api/projects').set('Authorization', bearer(admin)).send(payload).expect(201);
  projectId = res.body.project._id; assert.equal(res.body.project.user, String(admin._id));
});
test('project reads populate the owner and project edits are admin-only', async () => {
  const list = await request(app).get('/api/projects').expect(200); assert.equal(list.body.projects[0].user.username, 'Admin');
  await request(app).get(`/api/projects/${projectId}`).expect(200);
  await request(app).put(`/api/projects/${projectId}`).set('Authorization', bearer(alice)).send({ title: 'Other', description: 'Some description' }).expect(403);
  const res = await request(app).put(`/api/projects/${projectId}`).set('Authorization', bearer(admin)).send({ title: 'Revised project', description: 'A revised complete project description.' }).expect(200);
  assert.equal(res.body.project.title, 'Revised project');
});
test('unsafe URLs and invalid identifiers produce consistent JSON errors', async () => {
  await request(app).post('/api/projects').set('Authorization', bearer(admin)).send({ title: 'Unsafe', description: 'A complete description.', liveUrl: 'javascript:alert(1)' }).expect(400);
  const bad = await request(app).get('/api/projects/not-an-id').expect(400); assert.ok(bad.body.error.message);
  await request(app).get('/api/projects/000000000000000000000000').expect(404);
});
test('an authenticated author can create and update an article', async () => {
  const payload = { title: 'A test article', content: 'A meaningful body of writing, with more than twenty characters.', author: String(bob._id) };
  await request(app).post('/api/blog').send(payload).expect(401);
  const res = await request(app).post('/api/blog').set('Authorization', bearer(alice)).send(payload).expect(201);
  postId = res.body.post._id; assert.equal(res.body.post.author, String(alice._id));
  const updated = await request(app).put(`/api/blog/${postId}`).set('Authorization', bearer(alice)).send({ ...payload, title: 'A revised test article' }).expect(200);
  assert.equal(updated.body.post.title, 'A revised test article');
});
test('other authors and administrators cannot modify another author’s article', async () => {
  for (const user of [bob, admin]) {
    await request(app).put(`/api/blog/${postId}`).set('Authorization', bearer(user)).send({ title: 'Hijacked', content: 'A long enough body for this unauthorized update.' }).expect(403);
    await request(app).delete(`/api/blog/${postId}`).set('Authorization', bearer(user)).expect(403);
  }
});
test('comments require a user and existing post, persist and populate author usernames', async () => {
  await request(app).post(`/api/blog/${postId}/comments`).send({ body: 'A thought' }).expect(401);
  await request(app).post('/api/blog/000000000000000000000000/comments').set('Authorization', bearer(bob)).send({ body: 'A thought' }).expect(404);
  await request(app).post(`/api/blog/${postId}/comments`).set('Authorization', bearer(bob)).send({ body: '   ' }).expect(400);
  const res = await request(app).post(`/api/blog/${postId}/comments`).set('Authorization', bearer(bob)).send({ body: 'A useful thought.' }).expect(201);
  assert.equal(res.body.comment.author.username, 'Bob');
  const detail = await request(app).get(`/api/blog/${postId}`).expect(200); assert.equal(detail.body.post.author.username, 'Alice'); assert.equal(detail.body.post.comments.length, 1);
  const list = await request(app).get(`/api/blog/${postId}/comments`).expect(200); assert.equal(list.body.comments[0].body, 'A useful thought.');
  const blog = await request(app).get('/api/blog').expect(200); assert.equal(blog.body.posts[0].author.username, 'Alice');
});
test('contact submissions validate and persist, while the inbox is administrator-only', async () => {
  await request(app).post('/api/contact').send({ name: 'A', email: 'bad', message: '' }).expect(400);
  const res = await request(app).post('/api/contact').send({ name: 'Visitor', email: 'visitor@example.com', message: 'I would like to discuss a new idea.' }).expect(201);
  assert.equal(res.body.email, undefined); assert.equal(await Message.countDocuments(), 1);
  await request(app).get('/api/messages').expect(401); await request(app).get('/api/messages').set('Authorization', bearer(alice)).expect(403);
  const inbox = await request(app).get('/api/messages').set('Authorization', bearer(admin)).expect(200);
  const messageId = inbox.body.messages[0]._id;
  const marked = await request(app).patch(`/api/messages/${messageId}`).set('Authorization', bearer(admin)).send({ read: true }).expect(200); assert.equal(marked.body.message.read, true);
});
test('central error handling covers malformed JSON, unknown routes and oversized payloads', async () => {
  const malformed = await request(app).post('/api/contact').set('Content-Type', 'application/json').send('{bad').expect(400); assert.match(malformed.body.error.message, /valid JSON/);
  await request(app).post('/api/contact').send({ message: 'a'.repeat(110000) }).expect(413);
  const missing = await request(app).get('/api/unknown').expect(404); assert.ok(missing.body.error.message);
});
test('deleting a post removes its comments, and project deletion is persisted', async () => {
  await request(app).delete(`/api/blog/${postId}`).set('Authorization', bearer(alice)).expect(204); assert.equal(await Comment.countDocuments({ post: postId }), 0);
  await request(app).get(`/api/blog/${postId}`).expect(404);
  await request(app).delete(`/api/projects/${projectId}`).set('Authorization', bearer(admin)).expect(204); assert.equal(await Project.countDocuments(), 0);
});
test('literature remains readable after project creation and editing', async () => {
  const payload = { title: 'A literary work', description: 'A complete literary project description.', mediaType: 'text', content: 'First line\nSecond line\n\nAnother stanza.', contentNote: 'English translation.', category: 'Literature' };
  const created = await request(app).post('/api/projects').set('Authorization', bearer(admin)).send(payload).expect(201);
  const path = `/api/projects/${created.body.project._id}`;
  const read = await request(app).get(path).expect(200);
  assert.equal(read.body.project.content, payload.content);
  assert.equal(read.body.project.mediaType, 'text');
  const updated = await request(app).put(path).set('Authorization', bearer(admin)).send({ ...payload, content: `${payload.content}\n\nFinal stanza.` }).expect(200);
  assert.match(updated.body.project.content, /Final stanza/);
});

test('media projects persist playable URLs and reject unsafe or incomplete sources', async () => {
  const payload = { title: 'A video work', description: 'A complete moving-image description.', mediaType: 'video', mediaUrl: '/media/film.mp4', category: 'Media' };
  const result = await request(app).post('/api/projects').set('Authorization', bearer(admin)).send(payload).expect(201);
  assert.equal(result.body.project.mediaUrl, payload.mediaUrl);
  for (const mediaUrl of ['', 'javascript:alert(1)', '/media/../private.wav']) {
    await request(app).post('/api/projects').set('Authorization', bearer(admin)).send({ ...payload, mediaUrl }).expect(400);
  }
  await request(app).post('/api/projects').set('Authorization', bearer(admin)).send({ ...payload, mediaType: 'audio', mediaUrl: '/media/listening.mp3' }).expect(201);
  await request(app).post('/api/projects').set('Authorization', bearer(admin)).send({ ...payload, mediaType: 'text', content: '' }).expect(400);
});

test('all six approved works have valid content and existing web assets', async () => {
  const { schemas } = await import('../src/middleware/validate.js');
  const works = JSON.parse(await readFile(new URL('../src/content/works.json', import.meta.url), 'utf8'));
  assert.equal(works.length, 6);
  assert.equal(new Set(works.map(work => work.sourceKey)).size, 6);
  assert.deepEqual([...new Set(works.map(work => work.category))].sort(), ['Art', 'Literature', 'Media']);
  for (const { contentFile, sourceKey, ...work } of works) {
    if (contentFile) work.content = await readFile(new URL(`../src/content/${contentFile}`, import.meta.url), 'utf8');
    const valid = schemas.project.parse(work);
    assert.equal(valid.sample, false);
    assert.doesNotMatch([valid.title, valid.description, valid.content].join(' '), /\p{Script=Han}/u);
    for (const path of [valid.imageUrl, valid.mediaUrl].filter(Boolean)) {
      const info = await stat(new URL(`../../client/public${path}`, import.meta.url));
      assert.ok(info.isFile() && info.size > 0, `Missing asset for ${sourceKey}`);
    }
  }
});

test('production refuses demo mode and missing or weak secrets', () => {
  const cwd = fileURLToPath(new URL('..', import.meta.url));
  for (const overrides of [{ DEMO_MODE: 'true' }, { DEMO_MODE: 'false', MONGODB_URI: '' }, { DEMO_MODE: 'false', MONGODB_URI: 'mongodb://localhost/test', JWT_SECRET: 'weak' }]) {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', "await import('./src/config.js')"], { cwd, env: { ...process.env, NODE_ENV: 'production', ...overrides }, encoding: 'utf8' });
    assert.notEqual(result.status, 0); assert.match(result.stderr, /Demo mode|MONGODB_URI|JWT_SECRET/);
  }
});
