import { useEffect } from 'react';
import { Routes, Route, useLocation, useParams, Navigate } from 'react-router-dom';
import { Header, Footer, Button, Status } from './components';
import { useAuth } from './context';
import Home, { About } from './pages/Home';
import { Projects, Blog, ProjectDetail } from './pages/Collections';
import BlogDetail from './pages/BlogDetail';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import s from './styles.module.css';
function Protected({ children }) {
  const { user, checking, authError, retrySession } = useAuth(); const location = useLocation();
  if (checking) return <div className={s.page} role="status">Loading your workspace...</div>;
  if (authError) return <div className={s.page}><Status resource={{ error: authError, reload: retrySession }} /></div>;
  return user ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
function RecordRoute({ component: Component }) {
  const { id } = useParams();
  return <Component key={id} />;
}
export default function App() {
  const location = useLocation();
  useEffect(() => { if (!location.hash) window.scrollTo(0, 0); const titles = { '/': 'Portfolio & Journal', '/projects': 'Selected Work', '/blog': 'Journal', '/about': 'About', '/contact': 'Contact', '/login': 'Sign In', '/register': 'Create Account', '/admin': 'Workspace' }; document.title = `${titles[location.pathname] || 'Explore'} — Waisery`; }, [location.pathname, location.hash]);
  return <><Header /><main id="main" tabIndex={-1}><Routes><Route path="/" element={<Home />} /><Route path="/about" element={<About />} /><Route path="/projects" element={<Projects />} /><Route path="/projects/:id" element={<RecordRoute component={ProjectDetail} />} /><Route path="/blog" element={<Blog />} /><Route path="/blog/:id" element={<RecordRoute component={BlogDetail} />} /><Route path="/contact" element={<Contact />} /><Route path="/login" element={<Auth key="login" />} /><Route path="/register" element={<Auth key="register" register />} /><Route path="/admin" element={<Protected><Dashboard /></Protected>} /><Route path="*" element={<div className={`${s.page} ${s.notFound}`}><h1>A path not yet taken.</h1><p>This page could not be found.</p><Button to="/">Return home</Button></div>} /></Routes></main>{location.pathname !== '/' && <Footer />}</>;
}
