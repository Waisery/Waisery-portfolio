import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useResource, useProfile } from '../context';
import { Button, TextLink, Status, ProjectCard, PostRow, Empty, Footer } from '../components';
import { canScrollWithin, createWheelIntent } from '../presentation';
import s from '../styles.module.css';
import p from './Home.module.css';

const chapters = ['Opening', 'Work', 'About', 'Journal', 'Contact'];

function usePresentation() {
  const root = useRef(null); const headings = useRef([]); const current = useRef(0);
  const locked = useRef(false); const timer = useRef(null); const focusNext = useRef(false);
  const [scene, setScene] = useState({ active: 0, previous: null, direction: 'forward', entering: false });
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  const navigate = useCallback((destination, focus = true) => {
    const next = Math.max(0, Math.min(chapters.length - 1, destination));
    if (next === current.current || locked.current) return;
    const previous = current.current;
    const oldPanel = root.current?.querySelector(`[data-scene="${previous}"]`);
    focusNext.current = focus || Boolean(oldPanel?.contains(document.activeElement));
    current.current = next; locked.current = true;
    setScene({ active: next, previous, direction: next > previous ? 'forward' : 'backward', entering: true });
    timer.current = setTimeout(() => {
      locked.current = false;
      setScene(value => ({ ...value, previous: null, entering: false }));
    }, reduced ? 160 : 820);
  }, [reduced]);
  useEffect(() => {
    if (focusNext.current) { headings.current[scene.active]?.focus({ preventScroll: true }); focusNext.current = false; }
  }, [scene.active]);
  useEffect(() => {
    document.body.classList.add(p.body);
    return () => { document.body.classList.remove(p.body); clearTimeout(timer.current); };
  }, []);
  useEffect(() => {
    const element = root.current; const intent = createWheelIntent(); let touch = null;
    const menuOpen = () => document.querySelector('[aria-controls="site-nav"][aria-expanded="true"]');
    const ignore = target => target?.closest('input,textarea,select,[contenteditable="true"],video,audio');
    const wheel = event => {
      if (event.ctrlKey || menuOpen() || ignore(event.target)) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      const pixels = delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
      if (canScrollWithin(event.target, element, Math.sign(delta))) {
        intent(pixels, performance.now(), true);
        return;
      }
      event.preventDefault();
      const direction = intent(pixels, performance.now(), locked.current);
      if (direction) navigate(current.current + direction, false);
    };
    const key = event => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || menuOpen() || ignore(event.target)) return;
      if (event.target.closest('header') || (event.key === ' ' && event.target.closest('button,a'))) return;
      let next;
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) next = current.current + (event.shiftKey ? -1 : 1);
      if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) next = current.current - 1;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = chapters.length - 1;
      if (next === undefined) return;
      const activePanel = element.querySelector(`[data-scene="${current.current}"]`);
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(event.key) && canScrollWithin(activePanel, element, Math.sign(next - current.current))) {
        event.preventDefault();
        const distance = event.key.startsWith('Arrow') ? 80 : activePanel.clientHeight * .8;
        activePanel.scrollBy({ top: Math.sign(next - current.current) * distance, behavior: reduced ? 'instant' : 'smooth' });
        return;
      }
      event.preventDefault(); if (!event.repeat) navigate(next);
    };
    const start = event => {
      if (ignore(event.target) || event.target.closest('button,a') || event.touches.length !== 1) { touch = null; return; }
      touch = { x: event.touches[0].clientX, y: event.touches[0].clientY, target: event.target, canReadForward: canScrollWithin(event.target, element, 1), canReadBackward: canScrollWithin(event.target, element, -1) };
    };
    const end = event => {
      if (!touch || menuOpen() || !event.changedTouches.length) return;
      const dx = touch.x - event.changedTouches[0].clientX; const dy = touch.y - event.changedTouches[0].clientY;
      const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      const reading = Math.abs(dy) >= Math.abs(dx) && (delta > 0 ? touch.canReadForward : touch.canReadBackward);
      if (!reading && Math.abs(delta) > 60 && !canScrollWithin(touch.target, element, Math.sign(delta))) navigate(current.current + Math.sign(delta), false);
      touch = null;
    };
    element.addEventListener('wheel', wheel, { passive: false });
    element.addEventListener('touchstart', start, { passive: true });
    element.addEventListener('touchend', end, { passive: true });
    document.addEventListener('keydown', key);
    return () => {
      element.removeEventListener('wheel', wheel); element.removeEventListener('touchstart', start);
      element.removeEventListener('touchend', end); document.removeEventListener('keydown', key);
    };
  }, [navigate, reduced]);
  return { root, headings, scene, navigate };
}

export default function HomePresentation() {
  const projects = useResource('/projects'); const posts = useResource('/blog'); const profile = useProfile();
  const { root, headings, scene, navigate } = usePresentation();
  const heading = index => ({ ref: element => { headings.current[index] = element; }, tabIndex: -1, id: `chapter-${index}` });
  const panel = index => ({
    hidden: index !== scene.active && index !== scene.previous,
    inert: index !== scene.active,
    'aria-hidden': index !== scene.active,
    'aria-labelledby': `chapter-${index}`,
    'data-scene': index,
    'data-state': index === scene.active ? scene.entering ? 'entering' : 'active' : 'leaving',
    'data-direction': scene.direction,
  });
  return <div ref={root} className={p.presentation} role="region" aria-roledescription="presentation" aria-label="Waisery portfolio chapters">
    <p className={p.srOnly} aria-live="polite" aria-atomic="true">Chapter {scene.active + 1} of {chapters.length}: {chapters[scene.active]}</p>
    <section {...panel(0)} className={p.slide}><div className={`${p.frame} ${p.opening}`}>
      <div className={p.hero}><h1 {...heading(0)}><span>Between stillness</span><span>and <em>possibility.</em></span></h1><p>A collection of projects, experiments, and reflections. A place to make, and to make meaning.</p><div className={p.heroActions}><Button to="/projects">Explore the work <ArrowRight size={18} /></Button><Button to="/blog" secondary>Read the journal <ArrowRight size={18} /></Button></div></div>
      <div className={p.art} aria-hidden="true"><img src="/images/jade-horizon.webp" alt="" fetchPriority="high" /><img src="/images/veil-of-light.webp" alt="" fetchPriority="high" /></div>
    </div></section>
    <section {...panel(1)} className={p.slide}><div className={p.frame}><div className={p.heading}><h2 {...heading(1)}>Selected work.</h2><TextLink to="/projects">View all work</TextLink></div><p className={p.intro}>Stories, images, and experiences, given a considered form.</p><Status resource={projects}>{projects.data?.projects.length ? <div className={p.work}>{projects.data.projects.slice(0, 2).map(project => <ProjectCard key={project._id} project={project} />)}</div> : <Empty title="A new collection is taking shape">Literature, art, and media will find their home here.</Empty>}</Status></div></section>
    <section {...panel(2)} className={p.slide}><div className={`${p.frame} ${p.about}`}><h2 {...heading(2)}>A little about the person behind the work.</h2><Status resource={profile}>{profile.data && <div><p>{profile.data.profile.about}</p><div className={s.skills}>{profile.data.profile.skills.map(skill => <span key={skill}>{skill}</span>)}</div><TextLink to="/about">More about me</TextLink></div>}</Status></div></section>
    <section {...panel(3)} className={p.slide}><div className={p.frame}><div className={p.heading}><h2 {...heading(3)}>Notes along the way.</h2><TextLink to="/blog">Visit the journal</TextLink></div><p className={p.intro}>Thoughts on making, learning, and the details that stay with us.</p><Status resource={posts}>{posts.data?.posts.length ? <div className={p.journal}>{posts.data.posts.slice(0, 2).map(post => <PostRow key={post._id} post={post} />)}</div> : <Empty title="The first page is still unwritten">A space for new writing and reflections.</Empty>}</Status></div></section>
    <section {...panel(4)} className={`${p.slide} ${p.closingSlide}`}><div className={p.frame}><div className={p.closing}><h2 {...heading(4)}>Every good idea begins with a conversation.</h2><p>A thought, a question, or a possibility worth exploring together.</p><TextLink to="/contact">Let’s make a connection</TextLink></div><Footer /></div></section>
    <div className={p.controls}><div className={p.progress}><strong>{String(scene.active + 1).padStart(2, '0')} / 05</strong><span>Scroll or use arrow keys</span></div><nav className={p.chapters} aria-label="Chapter navigation">{chapters.map((chapter, index) => <button key={chapter} type="button" aria-label={`Go to ${chapter}`} aria-current={scene.active === index ? 'step' : undefined} onClick={() => navigate(index)}><span className={p.chapterNumber}>{String(index + 1).padStart(2, '0')}</span><span className={p.chapterName}>{chapter}</span></button>)}</nav><div className={p.arrows}><button type="button" aria-label="Previous chapter" disabled={scene.active === 0} onClick={() => navigate(scene.active - 1)}><ArrowLeft size={19} /></button><button type="button" aria-label="Next chapter" disabled={scene.active === chapters.length - 1} onClick={() => navigate(scene.active + 1)}><ArrowRight size={19} /></button></div></div>
  </div>;
}
