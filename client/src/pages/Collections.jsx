import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { useResource } from '../context';
import { PageHeading, Status, Empty, ProjectCard, PostRow, Artwork } from '../components';
import s from '../styles.module.css';

export function Projects() {
  const resource = useResource('/projects'); const [query, setQuery] = useState(''); const [category, setCategory] = useState('All work');
  const all = resource.data?.projects || [];
  const categories = ['All work', ...new Set(all.map(p => p.category))];
  const filtered = all.filter(p => (category === 'All work' || p.category === category) && `${p.title} ${p.description} ${p.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  return <div className={s.page}><PageHeading title="A collection of possibilities.">Digital experiences, visual explorations, and ideas made tangible.</PageHeading><div className={s.collectionTools}><div className={s.filterTabs} aria-label="Filter projects">{categories.map(c => <button type="button" key={c} aria-pressed={c === category} onClick={() => setCategory(c)}>{c}</button>)}</div><label className={s.search}><Search size={17} /><input aria-label="Search projects" placeholder="Find a project" value={query} onChange={e => setQuery(e.target.value)} /></label></div><Status resource={resource}>{filtered.length ? <div className={s.projectGrid}>{filtered.map(p => <ProjectCard key={p._id} project={p} />)}</div> : <Empty title={all.length ? 'No projects match your search' : 'The collection is growing'}>{all.length ? 'Try a different search or category.' : 'New work will appear here when it is published.'}</Empty>}</Status></div>;
}
export function Blog() {
  const resource = useResource('/blog'); const [query, setQuery] = useState('');
  const posts = (resource.data?.posts || []).filter(p => `${p.title} ${p.category} ${p.excerpt}`.toLowerCase().includes(query.toLowerCase()));
  return <div className={s.page}><PageHeading title="Notes along the way." aside={<label className={s.search}><Search size={17} /><input aria-label="Search articles" placeholder="Search the journal" value={query} onChange={e => setQuery(e.target.value)} /></label>}>Thoughts on making, learning, and the details that stay with us.</PageHeading><Status resource={resource}>{posts.length ? posts.map((p, i) => <PostRow key={p._id} post={p} featured={i === 0 && !query} />) : <Empty title={query ? 'No articles found' : 'The journal is waiting for its first story'}>{query ? 'Try searching for a different word.' : 'Check back for new writing.'}</Empty>}</Status></div>;
}
export function ProjectDetail() {
  const { id } = useParams(); const resource = useResource(`/projects/${id}`); const project = resource.data?.project;
  return <div className={s.page}><Link to="/projects" className={s.backLink}><ArrowLeft size={16} /> Back to work</Link><Status resource={resource}>{project && <article><PageHeading title={project.title}>{project.category}</PageHeading><Artwork className={s.detailArtwork} src={project.imageUrl} alt={`${project.title} project artwork`} eager /><div className={s.projectDetails}><div><h2>About this project</h2><p className={s.prose}>{project.description}</p>{project.sample && <p className={s.sampleNote}>This is a sample portfolio project. Its description and artwork are illustrative.</p>}</div><aside><h3>Built with</h3><div className={s.tags}>{project.tags.map(t => <span key={t}>{t}</span>)}</div>{project.repoUrl && <a className={s.externalLink} href={project.repoUrl} target="_blank" rel="noopener noreferrer"><Github size={17} /> View source <ExternalLink size={14} /></a>}{project.liveUrl && <a className={s.externalLink} href={project.liveUrl} target="_blank" rel="noopener noreferrer">Visit project <ExternalLink size={16} /></a>}</aside></div></article>}</Status></div>;
}
