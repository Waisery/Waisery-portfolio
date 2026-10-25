import { useEffect, useId, useState, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Menu, X, LoaderCircle, AlertCircle, Check, Feather } from 'lucide-react';
import { useAuth } from './context';
import s from './styles.module.css';

export function Button({ to, children, secondary = false, className = '', ...props }) {
  const cls = `${s.button} ${secondary ? s.secondary : ''} ${className}`;
  return to ? <Link to={to} className={cls} {...props}>{children}</Link> : <button className={cls} {...props}>{children}</button>;
}
export function TextLink({ to, children, ...props }) { return <Link to={to} className={s.textLink} {...props}>{children}<ArrowRight size={17} /></Link>; }
export function Header() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuButton = useRef(null);
  const [scrolled, setScrolled] = useState(window.scrollY > 20);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = event => { if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus(); } };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);
  useEffect(() => { const update = () => setScrolled(window.scrollY > 20); window.addEventListener('scroll', update, { passive: true }); return () => window.removeEventListener('scroll', update); }, []);
  return <><a href="#main" className={s.skip}>Skip to content</a><header className={`${s.header} ${scrolled || location.pathname !== '/' || open ? s.headerSolid : ''}`}>
    <Link to="/" className={s.wordmark} aria-label="Waisery home">Waisery<span className={s.brandDot} /></Link>
    <button ref={menuButton} type="button" className={s.menuButton} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    <nav id="site-nav" aria-label="Main navigation" className={`${s.nav} ${open ? s.navOpen : ''}`}>
      <NavLink to="/projects">Work</NavLink><NavLink to="/blog">Journal</NavLink><NavLink to="/about">About</NavLink><NavLink to="/contact">Contact</NavLink>
      <span className={s.navDivider} />
      {user ? <><NavLink to="/admin">Dashboard</NavLink><button type="button" onClick={() => { signOut(); setOpen(false); }}>Sign out</button></> : <><NavLink to="/login">Sign in <ArrowUpRight size={14} /></NavLink><NavLink className={s.registerLink} to="/register">Register</NavLink></>}
    </nav>
  </header></>;
}
export function Footer() {
  return <footer className={s.footer}><div><Link className={s.wordmark} to="/">Waisery</Link><p>A space for thoughtful work.</p></div><nav aria-label="Footer navigation"><Link to="/projects">Work</Link><Link to="/blog">Journal</Link><Link to="/contact">Get in touch <ArrowUpRight size={14} /></Link></nav><span className={s.copyright}>© {new Date().getFullYear()} Waisery</span></footer>;
}
export function Status({ resource, children }) {
  if (resource.loading) return <div role="status" className={s.status}><LoaderCircle className={s.spin} size={22} /><p>{resource.slow ? 'Still loading. The service may need a moment to respond.' : 'Loading...'}</p></div>;
  if (resource.error) return <div role="alert" className={s.status}><AlertCircle size={24} /><h3>Unable to load this content</h3><p>{resource.error.message}</p><Button secondary onClick={resource.reload}>Try again</Button></div>;
  return children;
}
export function Empty({ title = 'Nothing here yet', children }) { return <div className={s.empty}><Feather size={26} /><h3>{title}</h3><p>{children || 'Check back soon for something new.'}</p></div>; }
export function Notice({ error, success }) {
  if (!error && !success) return null;
  return <div className={`${s.notice} ${success ? s.success : ''}`} role={error ? 'alert' : 'status'}>{error ? <AlertCircle size={18} /> : <Check size={18} />}<div>{error?.message || error || success}{error?.fields && <ul>{Object.entries(error.fields).map(([key, value]) => <li key={key}>{key}: {value}</li>)}</ul>}</div></div>;
}
export function Field({ label, error, hint, as = 'input', ...props }) {
  const id = useId(); const Tag = as;
  return <div className={s.field}><label htmlFor={id}>{label}{props.required && <span aria-hidden="true"> *</span>}</label><Tag id={id} aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${id}-hint` : undefined} {...props} />{(error || hint) && <small id={`${id}-hint`} className={error ? s.fieldError : ''}>{error || hint}</small>}</div>;
}
export function Artwork({ src, alt, className = '', eager = false }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return src && !failed ? <img className={className} src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} /> : <div className={`${s.artFallback} ${className}`} role="img" aria-label={alt}><Feather size={36} /></div>;
}
export function ProjectCard({ project }) {
  return <article className={s.projectCard}><Link to={`/projects/${project._id}`} className={s.projectImage}><Artwork src={project.imageUrl} alt={`${project.title} project artwork`} /><span className={s.imageArrow}><ArrowUpRight size={23} /></span></Link><div className={s.projectTitle}><h3><Link to={`/projects/${project._id}`}>{project.title}</Link></h3><span>{project.category}</span></div><p>{project.description.split('. ')[0]}.</p><div className={s.tags}>{project.tags?.map(tag => <span key={tag}>{tag}</span>)}{project.sample && <span>Sample project</span>}</div></article>;
}
export const readingTime = content => `${Math.max(1, Math.ceil((content || '').split(/\s+/).length / 200))} min read`;
export const date = value => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export function PostRow({ post, featured = false }) {
  return <article className={`${s.postRow} ${featured ? s.postFeatured : ''}`}><Link to={`/blog/${post._id}`} className={s.postImage}><Artwork src={post.imageUrl} alt={`${post.title} article artwork`} /></Link><div><div className={s.meta}>{post.category}<span />{readingTime(post.content)}</div><h3><Link to={`/blog/${post._id}`}>{post.title}</Link></h3><p>{post.excerpt || post.content.slice(0, 160)}</p><div className={s.meta}>{post.author?.username} · {date(post.createdAt)}{post.sample ? ' · Sample article' : ''}</div></div><Link to={`/blog/${post._id}`} className={s.rowArrow} aria-label={`Read ${post.title}`}><ArrowUpRight /></Link></article>;
}
export function PageHeading({ title, children, aside }) { return <div className={s.pageHeading}><div><h1>{title}</h1>{children && <p>{children}</p>}</div>{aside}</div>; }
