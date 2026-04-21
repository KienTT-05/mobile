import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';
import { setUnauthorizedHandler } from '@/api/apiClient';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('student');

  useEffect(() => { restoreSession(); }, []);
  useEffect(() => { setUnauthorizedHandler(logout); }, []);

  const restoreSession = async () => {
    try {
      const savedToken = await SecureStore.getItemAsync('token');
      const savedUser  = await SecureStore.getItemAsync('user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {} finally { setLoading(false); }
  };

  const login = async (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setViewMode('student');
    await SecureStore.setItemAsync('token', authToken);
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setViewMode('student');
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
    } catch {}
  };

  const toggleViewMode = () =>
    setViewMode(prev => prev === 'student' ? 'lecturer' : 'student');

  const isLoggedIn = !!token;
  const isLecturer = viewMode === 'lecturer';

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isLoggedIn, isLecturer, viewMode, toggleViewMode, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}