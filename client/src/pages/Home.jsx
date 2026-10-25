import { useEffect, useRef } from 'react';
import { ArrowRight, ArrowDown, MoveDown } from 'lucide-react';
import { useResource, useProfile } from '../context';
import { Button, TextLink, Status, ProjectCard, PostRow, Empty } from '../components';
import s from '../styles.module.css';

function CelestialScene() {
  const stage = useRef(null); const veil = useRef(null);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame;
    const draw = () => {
      if (!stage.current || !veil.current) return;
      const progress = Math.min(1, Math.max(0, -stage.current.getBoundingClientRect().top / (window.innerHeight * 0.36)));
      veil.current.style.opacity = media.matches ? '1' : String(progress);
    };
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); };
    draw(); window.addEventListener('scroll', update, { passive: true }); media.addEventListener('change', update);
    return () => { window.removeEventListener('scroll', update); media.removeEventListener('change', update); cancelAnimationFrame(frame); };
  }, []);
  return <div ref={stage} className={s.sceneStage}><div className={s.sceneSticky}>
    <img className={s.sceneArt} src="/images/jade-horizon.webp" alt="" fetchPriority="high" />
    <img ref={veil} className={`${s.sceneArt} ${s.veilArt}`} src="/images/veil-of-light.webp" alt="" fetchPriority="high" />
    <div className={s.sceneReadability} />
    <div className={s.heroCopy}><h1>Between stillness<br />and possibility.</h1><p>A collection of projects, experiments,<br className={s.desktopBreak} /> and reflections.</p><div className={s.heroActions}><Button to="/projects">Explore the work <ArrowRight size={18} /></Button><Button to="/blog" secondary>Read the journal <ArrowRight size={18} /></Button></div></div>
    <a href="#selected-work" className={s.scrollCue}>A little further <MoveDown size={17} /></a>
    <span className={s.sceneCaption}>An exploration in light & form</span>
  </div></div>;
}
export default function Home() {
  const projects = useResource('/projects'); const posts = useResource('/blog');
  return <><CelestialScene /><section id="selected-work" className={`${s.section} ${s.homeWork}`}><div className={s.sectionHeading}><h2>Selected work</h2><TextLink to="/projects">View all work</TextLink></div><p className={s.sectionIntro}>Digital spaces with a considered point of view.</p><Status resource={projects}>{projects.data?.projects.length ? <div className={s.projectGrid}>{projects.data.projects.slice(0, 2).map(p => <ProjectCard key={p._id} project={p} />)}</div> : <Empty title="A new collection is taking shape" />}</Status></section>
    <section className={`${s.section} ${s.homeJournal}`}><div className={s.sectionHeading}><h2>Notes along the way</h2><TextLink to="/blog">Visit the journal</TextLink></div><p className={s.sectionIntro}>Thoughts on making, learning, and looking a little closer.</p><Status resource={posts}>{posts.data?.posts.length ? posts.data.posts.slice(0, 2).map(p => <PostRow key={p._id} post={p} />) : <Empty title="The first page is still unwritten" />}</Status></section>
    <section className={s.contactBanner}><div className={s.goldRule} /><h2>Every good idea begins<br />with a conversation.</h2><TextLink to="/contact">Let’s make a connection</TextLink></section></>;
}
export function About() {
  const resource = useProfile();
  return <div className={s.page}><Status resource={resource}>{resource.data && <div className={s.aboutGrid}><div><h1>A little about<br />{resource.data.profile.name}.</h1><p className={s.lead}>{resource.data.profile.about}</p><p className={s.sampleNote}>{resource.data.profile.aboutNote}</p><h2>Areas of exploration</h2><div className={s.skills}>{resource.data.profile.skills.map(skill => <span key={skill}>{skill}</span>)}</div><p className={s.sampleNote}>{resource.data.profile.skillsNote}</p><TextLink to="/contact">Start a conversation</TextLink></div><img src="/images/fieldnotes.webp" alt="An open sketchbook in a gold-lit Chinese pavilion" /></div>}</Status></div>;
}
