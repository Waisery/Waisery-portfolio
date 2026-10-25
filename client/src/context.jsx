import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api';
const AuthContext = createContext(null);
const ProfileContext = createContext(null);
function savedSession() {
  try {
    const value = JSON.parse(sessionStorage.getItem('waisery-session'));
    return typeof value?.token === 'string' && typeof value?.user?._id === 'string' && typeof value?.user?.username === 'string' && ['author', 'admin'].includes(value?.user?.role) ? value : null;
  } catch { return null; }
}
function storeSession(value) { try { if (value) sessionStorage.setItem('waisery-session', JSON.stringify(value)); else sessionStorage.removeItem('waisery-session'); } catch { /* The current session can still run without browser storage. */ } }
export function Providers({ children }) {
  const [session, setSession] = useState(savedSession);
  const [checking, setChecking] = useState(Boolean(session?.token));
  const [verified, setVerified] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [sessionVersion, setSessionVersion] = useState(0);
  const retrySession = useCallback(() => setSessionVersion(v => v + 1), []);
  const [expired, setExpired] = useState(false);
  const signOut = useCallback(() => { storeSession(null); setSession(null); setVerified(false); setAuthError(null); }, []);
  const signIn = data => { storeSession(data); setExpired(false); setAuthError(null); setVerified(true); setChecking(false); setSession(data); };
  useEffect(() => {
    const onExpire = event => { if (event.detail?.token !== session?.token) return; signOut(); setExpired(true); };
    window.addEventListener('session-expired', onExpire);
    return () => window.removeEventListener('session-expired', onExpire);
  }, [signOut, session?.token]);
  useEffect(() => {
    if (!session?.token) { setChecking(false); return; }
    let active = true;
    const controller = new AbortController();
    setChecking(true); setAuthError(null);
    api('/users/me', { token: session.token, signal: controller.signal }).then(data => {
      if (active) { setSession(current => current ? { ...current, user: data.user } : current); setVerified(true); }
    }).catch(error => { if (!active) return; if (error.status === 401) signOut(); else { setVerified(false); setAuthError(error); } }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; controller.abort(); };
  }, [session?.token, signOut, sessionVersion]);
  const resource = useResource('/profile');
  return <AuthContext.Provider value={{ user: verified ? session?.user : null, token: session?.token, checking, authError, retrySession, signIn, signOut, expired }}><ProfileContext.Provider value={resource}>{children}</ProfileContext.Provider></AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
export const useProfile = () => useContext(ProfileContext);
export function useResource(path, token) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [version, setVersion] = useState(0);
  const [slow, setSlow] = useState(false);
  const reload = useCallback(() => setVersion(v => v + 1), []);
  useEffect(() => {
    if (!path) { setState({ data: null, loading: false, error: null }); return; }
    const controller = new AbortController();
    setSlow(false);
    const slowTimer = setTimeout(() => setSlow(true), 8000);
    setState({ data: null, loading: true, error: null });
    api(path, { token, signal: controller.signal }).then(data => setState({ data, loading: false, error: null })).catch(error => {
      if (error.name !== 'AbortError') setState({ data: null, loading: false, error });
    }).finally(() => clearTimeout(slowTimer));
    return () => { clearTimeout(slowTimer); controller.abort(); };
  }, [path, token, version]);
  return { ...state, slow, reload };
}
