import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react';
import { useAuth, useResource } from '../context';
import { api } from '../api';
import { Status, Artwork, Field, Button, Notice, date, readingTime } from '../components';
import s from '../styles.module.css';

export default function BlogDetail() {
  const { id } = useParams(); const resource = useResource(`/blog/${id}`); const { user, token } = useAuth(); const location = useLocation();
  const [body, setBody] = useState(''); const [error, setError] = useState(null); const [busy, setBusy] = useState(false); const [success, setSuccess] = useState('');
  const post = resource.data?.post;
  async function comment(e) {
    e.preventDefault(); setError(null); setSuccess(''); setBusy(true);
    try { await api(`/blog/${id}/comments`, { token, method: 'POST', body: { body } }); setBody(''); setSuccess('Your comment has been published.'); resource.reload(); }
    catch (err) { setError(err); } finally { setBusy(false); }
  }
  return <div className={s.page}><Link className={s.backLink} to="/blog"><ArrowLeft size={16} /> Back to the journal</Link><Status resource={resource}>{post && <><article className={s.article}><header><div className={s.meta}>{post.category}<span />{readingTime(post.content)}</div><h1>{post.title}</h1><p className={s.articleExcerpt}>{post.excerpt}</p><div className={s.meta}>By {post.author.username} · {date(post.createdAt)}</div></header>{post.imageUrl && <Artwork className={s.articleImage} src={post.imageUrl} alt={`${post.title} article artwork`} eager />}<div className={s.articleBody}>{post.content.split(/\n\s*\n/).map((block, i) => block.length < 80 && !block.includes('. ') ? <h2 key={i}>{block}</h2> : <p key={i}>{block}</p>)}{post.sample && <p className={s.sampleNote}>Sample article · Edit this content in the dashboard to share your own perspective.</p>}</div></article>
    <section className={s.comments}><h2>Join the conversation <span>{post.comments.length}</span></h2>{post.comments.length ? <ol className={s.commentList}>{post.comments.map(c => <li key={c._id}><span className={s.avatar}>{c.author.username.slice(0, 1).toUpperCase()}</span><div><div className={s.commentByline}><strong>{c.author.username}</strong><time dateTime={c.createdAt}>{date(c.createdAt)}</time></div><p>{c.body}</p></div></li>)}</ol> : <p className={s.muted}>A fresh conversation. Be the first to leave a thought.</p>}<Notice error={error} success={success} />{user ? <form onSubmit={comment} className={s.commentForm}><Field label="Your comment" as="textarea" rows={4} value={body} onChange={e => setBody(e.target.value)} maxLength={2000} required error={error?.fields?.body} placeholder="What’s on your mind?" /><Button disabled={busy}>{busy ? 'Publishing...' : 'Publish comment'}<ArrowRight size={17} /></Button></form> : <p className={s.signInPrompt}><MessageSquare size={19} /><Link to="/login" state={{ from: location.pathname }}>Sign in</Link> to share a thought.</p>}</section></>}</Status></div>;
}
