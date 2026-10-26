import { ArrowRight } from 'lucide-react';
import { useProfile } from '../context';
import { Artwork, Button, Status } from '../components';
import HomePresentation from './HomePresentation';
import s from '../styles.module.css';
import about from './About.module.css';
export default HomePresentation;
export function About() {
  const resource = useProfile();
  const profile = resource.data?.profile;
  return <div className={`${s.page} ${about.page}`}>
    <Status resource={resource}>{profile && <article aria-labelledby="about-title">
      <div className={about.opening}>
        <div className={about.introduction}>
          <h1 id="about-title">A little about{' '}<span>{profile.fullName || profile.name}.</span></h1>
          <p className={about.biography}>{profile.about}</p>
          {profile.aboutNote && <p className={about.note}>{profile.aboutNote}</p>}
          <div className={about.actions}>
            <Button to="/contact">Start a conversation <ArrowRight size={17} /></Button>
            {profile.githubUrl && <a className={about.github} href={profile.githubUrl} target="_blank" rel="noopener noreferrer">Explore my GitHub <ArrowRight size={16} /></a>}
          </div>
        </div>
        <figure className={about.artwork}>
          <Artwork src="/images/about-courtyard-v1.webp" alt="A quiet wooden writing desk beside a lattice window overlooking a bamboo courtyard" eager />
          <figcaption>AI-generated study of a quiet courtyard.</figcaption>
        </figure>
      </div>
      <section className={about.exploration} aria-labelledby="exploration-title">
        <div>
          <h2 id="exploration-title">Areas of exploration</h2>
          {profile.skillsNote && <p className={about.explorationNote}>{profile.skillsNote}</p>}
        </div>
        <ul className={about.skills}>{profile.skills.map(skill => <li key={skill}>{skill}</li>)}</ul>
      </section>
    </article>}</Status>
  </div>;
}
