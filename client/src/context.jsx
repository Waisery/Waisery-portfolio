import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api';
const AuthContext = createContext(null);
const ProfileContext = createContext(null);
function savedSession() { try { return JSON.parse(sessionStorage.getItem('waisery-session')) || null; } catch { return null; } }
export function Providers({ children }) {
  const [session, setSession] = useState(savedSession);
  const [checking, setChecking] = useState(Boolean(session?.token));
  const [expired, setExpired] = useState(false);
  const signOut = useCallback(() => { sessionStorage.removeItem('waisery-session'); setSession(null); }, []);
  const signIn = data => { sessionStorage.setItem('waisery-session', JSON.stringify(data)); setExpired(false); setSession(data); };
  useEffect(() => {
    const onExpire = () => { signOut(); setExpired(true); };
    window.addEventListener('session-expired', onExpire);
    return () => window.removeEventListener('session-expired', onExpire);
  }, [signOut]);
  useEffect(() => {
    if (!session?.token) { setChecking(false); return; }
    let active = true;
    api('/users/me', { token: session.token }).then(data => {
      if (active) setSession(current => current ? { ...current, user: data.user } : current);
    }).catch(error => { if (active && error.status === 401) signOut(); }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [session?.token, signOut]);
  const resource = useResource('/profile');
  return <AuthContext.Provider value={{ user: session?.user, token: session?.token, checking, signIn, signOut, expired }}><ProfileContext.Provider value={resource}>{children}</ProfileContext.Provider></AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
export const useProfile = () => useContext(ProfileContext);
export function useResource(path, token) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion(v => v + 1), []);
  useEffect(() => {
    if (!path) { setState({ data: null, loading: false, error: null }); return; }
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });
    api(path, { token, signal: controller.signal }).then(data => setState({ data, loading: false, error: null })).catch(error => {
      if (error.name !== 'AbortError') setState({ data: null, loading: false, error });
    });
    return () => controller.abort();
  }, [path, token, version]);
  return { ...state, reload };
}
