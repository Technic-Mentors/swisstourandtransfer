import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { admin as adminResource } from '../api/resources';
import { clearSession, getStoredAdmin, getToken, onUnauthorized, setSession } from '../api/client';

const AuthContext = createContext(null);

/**
 * Admin auth state.
 *
 * The JWT lives in sessionStorage and travels as an Authorization header -
 * no cookies. On mount the stored token is verified against the API, so a
 * token that expired while the tab was closed never produces a broken panel.
 */
export function AuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => (getToken() ? getStoredAdmin() : null));
  const [loading, setLoading] = useState(() => Boolean(getToken()));
  const [sessionMessage, setSessionMessage] = useState('');

  const logout = useCallback((message = '') => {
    clearSession();
    setAdminUser(null);
    setSessionMessage(message);
  }, []);

  // Any 401 anywhere in the app lands here.
  useEffect(
    () =>
      onUnauthorized((code) => {
        setAdminUser(null);
        setSessionMessage(
          code === 'token_expired'
            ? 'Your session expired. Please sign in again.'
            : 'Please sign in to continue.',
        );
      }),
    [],
  );

  // Verify a token restored from sessionStorage before trusting it.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    adminResource
      .me()
      .then((data) => {
        if (active && data?.admin) setAdminUser(data.admin);
      })
      .catch(() => {
        // onUnauthorized already cleared the session for a 401; for a network
        // error we also drop to the login screen rather than guess.
        if (active) {
          clearSession();
          setAdminUser(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  /**
   * Replace the signed-in admin after a profile edit. The token is unchanged -
   * only the stored details are refreshed, so the sidebar and navbar update
   * without a reload.
   */
  const updateAdmin = useCallback((next) => {
    if (!next) return;
    setSession(getToken(), next);
    setAdminUser(next);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await adminResource.login(email, password);
    setSession(data.token, data.admin);
    setAdminUser(data.admin);
    setSessionMessage('');
    return data.admin;
  }, []);

  const value = useMemo(
    () => ({
      admin: adminUser,
      isAuthenticated: Boolean(adminUser),
      loading,
      sessionMessage,
      login,
      logout,
      updateAdmin,
      clearSessionMessage: () => setSessionMessage(''),
    }),
    [adminUser, loading, sessionMessage, login, logout, updateAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
