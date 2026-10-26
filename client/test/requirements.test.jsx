import { describe, test, expect, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import App from '../src/App';
import { Providers } from '../src/context';
import { ProjectCard } from '../src/components';

const author = { _id: 'author-a', username: 'Author A', email: 'author@example.com', role: 'author' };
const admin = { _id: 'admin-a', username: 'Owner', email: 'owner@example.com', role: 'admin' };
const other = { _id: 'author-b', username: 'Author B', role: 'author' };
const profile = { name: 'Waisery', email: 'portfolio@example.com', about: 'A developer exploring considered interfaces.', skills: ['React'] };
const project = { _id: 'work-a', title: 'Original work', description: 'A complete project description.', category: 'Media', tags: [], imageUrl: '', user: admin, sample: false, mediaType: 'image' };
const article = (id = 'post-a', owner = author) => ({ _id: id, title: id === 'post-a' ? 'First article' : 'Second article', content: 'A first paragraph about the work.\n\nA second paragraph that develops the thought.', excerpt: 'An article introduction.', category: 'Reflections', author: owner, comments: [], createdAt: '2026-10-26T00:00:00.000Z' });
const json = (value, status = 200) => Response.json(value, { status });

function serve(handler = () => undefined, user = author) {
  const fetch = vi.fn(async (url, options = {}) => {
    const path = String(url).replace(/^.*\/api/, '');
    const request = { path, method: options.method || 'GET', body: options.body ? JSON.parse(options.body) : undefined, options };
    const result = await handler(request);
    if (result !== undefined) return result;
    if (path === '/profile') return json({ profile, demo: false });
    if (path === '/users/me') return json({ user });
    if (path === '/projects') return json({ projects: [project] });
    if (path === '/blog') return json({ posts: [article()] });
    if (path.startsWith('/blog/')) return json({ post: article(path.split('/')[2]) });
    if (path === '/messages') return json({ messages: [] });
    throw new Error(`Unexpected test request: ${request.method} ${path}`);
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
}
function NavigationProbe() {
  const navigate = useNavigate();
  return <><button onClick={() => navigate('/blog/post-b')}>Visit second article</button><button onClick={() => navigate('/projects/work-b')}>Visit second project</button><button onClick={() => navigate('/projects')}>Leave presentation</button></>;
}
function mount(path, user, extras = false) {
  if (user) sessionStorage.setItem('waisery-session', JSON.stringify({ token: 'verified-test-token', user }));
  return render(<MemoryRouter initialEntries={[path]}><Providers><App />{extras && <NavigationProbe />}</Providers></MemoryRouter>);
}
function fill(label, value) { fireEvent.change(screen.getByLabelText(label, { exact: false, selector: 'input,textarea,select' }), { target: { value } }); }
function submit(text) { fireEvent.submit(screen.getByRole('button', { name: text, exact: true }).closest('form')); }
function writes(fetch, path, method) { return fetch.mock.calls.filter(([url, options]) => url === `/api${path}` && options.method === method); }

describe('specification client workflows with an isolated test API', () => {
  test('anonymous visitors cannot open the protected dashboard', async () => {
    const fetch = serve(); mount('/admin');
    await screen.findByRole('heading', { name: 'Welcome back.' });
    expect(screen.queryByRole('heading', { name: 'Your workspace.' })).toBeNull();
    expect(fetch.mock.calls.some(([, options]) => options.headers?.Authorization)).toBe(false);
  });

  test('registration sends controlled fields and enters an author-only workspace', async () => {
    const fetch = serve(request => request.path === '/users/register' ? json({ user: author, token: 'new-author-token' }, 201) : undefined);
    mount('/register');
    fill('Username', author.username); fill('Email address', author.email); fill('Password', 'ValidAuthor!2026'); submit('Create account');
    await screen.findByRole('heading', { name: 'Your workspace.' });
    const registration = writes(fetch, '/users/register', 'POST');
    expect(JSON.parse(registration[0][1].body)).toEqual({ username: author.username, email: author.email, password: 'ValidAuthor!2026' });
    expect(screen.queryByRole('tab', { name: 'Projects' })).toBeNull();
    expect(screen.queryByRole('tab', { name: 'Inbox' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeTruthy();
  });

  test('login returns to an article, comments use the JWT, and sign-out removes the form', async () => {
    const post = article();
    const fetch = serve(request => {
      if (request.path === '/users/login') return json({ user: author, token: 'comment-token' });
      if (request.path === '/blog/post-a/comments' && request.method === 'POST') {
        post.comments.push({ _id: 'comment-a', body: request.body.body, author, createdAt: '2026-10-26T00:00:00Z' });
        return json({ comment: post.comments[0] }, 201);
      }
      if (request.path === '/blog/post-a') return json({ post });
    });
    mount({ pathname: '/login', state: { from: '/blog/post-a' } });
    fill('Email address', author.email); fill('Password', 'ValidAuthor!2026'); submit('Sign in');
    await screen.findByRole('heading', { name: 'First article' });
    fill('Your comment', 'A meaningful response.'); submit('Publish comment');
    await screen.findByText('Your comment has been published.');
    expect(screen.getByText('A meaningful response.')).toBeTruthy();
    expect(writes(fetch, '/blog/post-a/comments', 'POST')[0][1].headers.Authorization).toBe('Bearer comment-token');
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.queryByLabelText('Your comment')).toBeNull());
  });

  test('contact failures preserve controlled fields and a successful retry clears them', async () => {
    let attempts = 0;
    const fetch = serve(request => request.path === '/contact' ? ++attempts === 1 ? json({ error: { message: 'Check the email.', fields: { email: 'This address is unavailable.' } } }, 400) : json({ message: 'Saved.' }, 201) : undefined);
    mount('/contact');
    fill('Your name', 'A visitor'); fill('Email address', 'visitor@example.com'); fill('Your message', 'A considered message for the portfolio.'); submit('Send message');
    await screen.findByText('This address is unavailable.', { selector: 'small' });
    expect(screen.getByLabelText('Your name', { exact: false }).value).toBe('A visitor');
    fill('Email address', 'another@example.com'); submit('Send message');
    await screen.findByRole('heading', { name: 'A note, well received.' });
    expect(writes(fetch, '/contact', 'POST')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Send another message' }));
    expect(screen.getByLabelText('Your name', { exact: false }).value).toBe('');
  });

  test('administrator project create/edit/delete calls include the token and preserve media fields', async () => {
    let projects = [{ ...project }];
    const fetch = serve(request => {
      if (request.path === '/projects' && request.method === 'GET') return json({ projects });
      if (request.path === '/projects' && request.method === 'POST') { projects.push({ ...request.body, _id: 'film-a', user: admin }); return json({ project: projects.at(-1) }, 201); }
      if (request.path === '/projects/film-a' && request.method === 'PUT') { projects[1] = { ...projects[1], ...request.body }; return json({ project: projects[1] }); }
      if (request.path === '/projects/film-a' && request.method === 'DELETE') { projects = projects.filter(value => value._id !== 'film-a'); return new Response(null, { status: 204 }); }
    }, admin);
    mount('/admin', admin);
    fireEvent.click(await screen.findByRole('tab', { name: 'Projects' }));
    await screen.findByRole('heading', { name: 'Original work' });
    fireEvent.click(screen.getByRole('button', { name: 'New project' }));
    fill('Title', 'New film'); fill('Category', 'Media'); fill('Description', 'A complete new film description.'); fill('Work format', 'video'); fill('Media URL', '/media/film.mp4'); submit('Publish project');
    await screen.findByRole('heading', { name: 'New film' });
    fireEvent.click(screen.getByRole('button', { name: 'Edit New film' }));
    expect(screen.getByLabelText('Media URL', { exact: false }).value).toBe('/media/film.mp4');
    fill('Title', 'Revised film'); submit('Save changes');
    await screen.findByRole('heading', { name: 'Revised film' });
    fireEvent.click(screen.getByRole('button', { name: 'Delete Revised film' }));
    expect(writes(fetch, '/projects/film-a', 'DELETE')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Keep it' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete Revised film' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete permanently' }));
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Revised film' })).toBeNull());
    for (const [path, method] of [['/projects', 'POST'], ['/projects/film-a', 'PUT'], ['/projects/film-a', 'DELETE']]) expect(writes(fetch, path, method)[0][1].headers.Authorization).toBe('Bearer verified-test-token');
  });

  test('an administrator manages their own writing without controls for another author', async () => {
    let posts = [article('post-a', other)];
    const fetch = serve(request => {
      if (request.path === '/blog' && request.method === 'GET') return json({ posts });
      if (request.path === '/blog' && request.method === 'POST') { posts.push({ ...request.body, _id: 'own-post', author: admin }); return json({ post: posts.at(-1) }, 201); }
      if (request.path === '/blog/own-post' && request.method === 'PUT') { posts[1] = { ...posts[1], ...request.body }; return json({ post: posts[1] }); }
      if (request.path === '/blog/own-post' && request.method === 'DELETE') { posts = posts.filter(post => post._id !== 'own-post'); return new Response(null, { status: 204 }); }
    }, admin);
    mount('/admin', admin); await screen.findByRole('heading', { name: 'Your writing' });
    expect(screen.queryByRole('button', { name: 'Edit First article' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'New article' }));
    fill('Title', 'My own article'); fill('Article content', 'A full article with enough detail to meet validation.'); submit('Publish article');
    await screen.findByRole('heading', { name: 'My own article' });
    fireEvent.click(screen.getByRole('button', { name: 'Edit My own article' })); fill('Title', 'My revised article'); submit('Save changes');
    await screen.findByRole('heading', { name: 'My revised article' });
    fireEvent.click(screen.getByRole('button', { name: 'Delete My revised article' })); fireEvent.click(screen.getByRole('button', { name: 'Delete permanently' }));
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'My revised article' })).toBeNull());
    for (const [path, method] of [['/blog', 'POST'], ['/blog/own-post', 'PUT'], ['/blog/own-post', 'DELETE']]) expect(writes(fetch, path, method)[0][1].headers.Authorization).toBe('Bearer verified-test-token');
  });

  test('changing an article cannot carry a comment draft into another article', async () => {
    serve(); mount('/blog/post-a', author, true);
    await screen.findByRole('heading', { name: 'First article' });
    await screen.findByLabelText('Your comment', { exact: false }); fill('Your comment', 'A draft intended only for the first article.');
    fireEvent.click(screen.getByRole('button', { name: 'Visit second article' }));
    await screen.findByRole('heading', { name: 'Second article' });
    expect(screen.getByLabelText('Your comment', { exact: false }).value).toBe('');
  });

  test('restored sessions trust the server role and can retry verification after an outage', async () => {
    let attempts = 0;
    serve(request => {
      if (request.path === '/users/me') { if (++attempts === 1) throw new TypeError('Offline'); return json({ user: author }); }
    });
    mount('/admin', { ...author, role: 'admin' });
    await screen.findByRole('heading', { name: 'Unable to load this content' });
    expect(screen.queryByRole('tab', { name: 'Projects' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByRole('heading', { name: 'Your workspace.' });
    expect(screen.queryByRole('tab', { name: 'Projects' })).toBeNull();
    expect(screen.queryByRole('tab', { name: 'Inbox' })).toBeNull();
  });

  test('project summaries do not add a second period to stored content', () => {
    render(<MemoryRouter><ProjectCard project={project} /></MemoryRouter>);
    expect(screen.getByText('A complete project description.')).toBeTruthy();
    expect(screen.queryByText('A complete project description..')).toBeNull();
  });

  test('literary details retain separate paragraphs and native media is never autoplayed', async () => {
    serve(request => request.path === '/projects/work-a' ? json({ project: { ...project, mediaType: 'text', title: 'A literary work', content: 'First stanza\nSecond line\n\nAnother stanza', tags: ['Poetry'] } }) : request.path === '/projects/work-b' ? json({ project: { ...project, _id: 'work-b', title: 'A film', mediaType: 'video', mediaUrl: '/media/film.mp4' } }) : undefined);
    mount('/projects/work-a', undefined, true);
    const literature = await screen.findByRole('region', { name: 'A literary work full text' });
    expect(literature.querySelectorAll('p')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Visit second project' }));
    const video = await screen.findByLabelText('A film video');
    expect(video.controls).toBe(true); expect(video.autoplay).toBe(false); expect(video.getAttribute('src')).toBe('/media/film.mp4');
  });

  test('homepage chapters expose only the active scene and release document scrolling on exit', async () => {
    serve(); mount('/', undefined, true);
    await screen.findByRole('heading', { name: 'Between stillness and possibility.' });
    vi.useFakeTimers();
    fireEvent.click(screen.getByRole('button', { name: 'Next chapter' }));
    expect(screen.getByRole('heading', { name: 'Selected work.' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Go to Work' }).getAttribute('aria-current')).toBe('step');
    expect(document.querySelectorAll('[data-scene][aria-hidden="false"]')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Next chapter' }));
    expect(screen.getByRole('heading', { name: 'Selected work.' })).toBeTruthy();
    await act(() => vi.advanceTimersByTimeAsync(850));
    fireEvent.keyDown(document.body, { key: 'ArrowRight' });
    expect(screen.getByRole('heading', { name: 'A little about the person behind the work.' })).toBeTruthy();
    await act(() => vi.advanceTimersByTimeAsync(850));
    fireEvent.click(screen.getByRole('button', { name: 'Go to Contact' }));
    expect(screen.getByRole('navigation', { name: 'Footer navigation' })).toBeTruthy();
    expect(screen.getByRole('banner')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Leave presentation' }));
    expect(document.body.classList.length).toBe(0);
  });
});
