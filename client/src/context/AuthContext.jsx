import { createContext, useCallback, useEffect, useState } from 'react';
import { axiosClient } from '../api/axiosClient.js';
import { API_ENDPOINTS } from '../api/apiEndpoints.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('hh_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await axiosClient.get(API_ENDPOINTS.AUTH.ME);
      setUser(data.data.user);
    } catch {
      localStorage.removeItem('hh_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  // Listen for 401 events dispatched by the axios interceptor
  useEffect(() => {
    function handleSessionExpired() {
      setUser(null);
    }
    window.addEventListener('hh:session-expired', handleSessionExpired);
    return () => window.removeEventListener('hh:session-expired', handleSessionExpired);
  }, []);

  const login = useCallback(async (identifier, password) => {
    const { data } = await axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, { identifier, password });
    localStorage.setItem('hh_token', data.data.token);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      // Best-effort: revokes the session server-side so the token can't be
      // replayed after logout. Local state is still cleared below even if
      // this fails (e.g. the token already expired, or the network is down)
      // so the user is never stuck "logged in" on their own device.
      await axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Ignored — see comment above.
    } finally {
      localStorage.removeItem('hh_token');
      setUser(null);
    }
  }, []);

  const value = { user, isLoading, login, logout, refreshUser: loadCurrentUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
