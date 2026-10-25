import { ArrowRight } from 'lucide-react';
import { useProfile } from '../context';
import { TextLink, Status } from '../components';
import HomePresentation from './HomePresentation';
import s from '../styles.module.css';
export default HomePresentation;
export function About() {
  const resource = useProfile();
  return <div className={s.page}><Status resource={resource}>{resource.data && <div className={s.aboutGrid}><div><h1>A little about<br />{resource.data.profile.fullName || resource.data.profile.name}.</h1><p className={s.lead}>{resource.data.profile.about}</p>{resource.data.profile.aboutNote && <p className={s.sampleNote}>{resource.data.profile.aboutNote}</p>}<h2>Areas of exploration</h2><div className={s.skills}>{resource.data.profile.skills.map(skill => <span key={skill}>{skill}</span>)}</div>{resource.data.profile.skillsNote && <p className={s.sampleNote}>{resource.data.profile.skillsNote}</p>}<TextLink to="/contact">Start a conversation</TextLink>{resource.data.profile.githubUrl && <a className={s.externalLink} href={resource.data.profile.githubUrl} target="_blank" rel="noopener noreferrer">Explore my GitHub <ArrowRight size={16} /></a>}</div><img src="/images/fieldnotes.webp" alt="An open sketchbook in a gold-lit Chinese pavilion" /></div>}</Status></div>;
}
