import { useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { getToken, setToken as saveToken, removeToken, getUser, setUser as saveUser, removeUser } from '../utils/auth';
import { authApi } from '../api';
import { AuthContext } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(getUser());
  const [token, setTokenState] = useState<string | null>(getToken());
  const [loading, setLoading] = useState(() => !!getToken());

  useEffect(() => {
    if (!getToken()) return;
    authApi.getProfile()
      .then((profile) => {
        setUserState(profile);
        saveUser(profile);
      })
      .catch(() => {
        removeToken();
        removeUser();
        setTokenState(null);
        setUserState(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await authApi.login({ username, password });
    saveToken(result.access_token);
    saveUser(result.user);
    setTokenState(result.access_token);
    setUserState(result.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      removeToken();
      removeUser();
      setTokenState(null);
      setUserState(null);
    }
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUserState(updatedUser);
    saveUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
