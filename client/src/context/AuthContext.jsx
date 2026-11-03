import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth.js';

const AuthContext = createContext(null);
const signedOut = { user: null, team: null, registration: null };

export const homePathFor = (user) => (user.role === 'admin' ? '/admin' : '/team');

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(signedOut);
  const [loading, setLoading] = useState(true);

  // Re-reads the signed-in account. Call this after changing team or payment data.
  const refresh = useCallback(async () => {
    try {
      const data = await authApi.me();
      setAccount(data);
      return data;
    } catch {
      setAccount(signedOut);
      return signedOut;
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (credentials) => {
    await authApi.login(credentials);
    try {
      const data = await authApi.me();
      setAccount(data);
      return data.user;
    } catch (error) {
      error.userMessage = 'Your login worked, but we could not load your account. Please try again.';
      throw error;
    }
  }, []);

  const register = useCallback(async (details) => {
    const data = await authApi.register(details);
    setAccount(data);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setAccount(signedOut);
  }, []);

  const value = useMemo(() => ({ ...account, loading, login, register, logout, refresh }), [account, loading, login, register, logout, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
