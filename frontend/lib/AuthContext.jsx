'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // On first load, if a token is saved, ask the API who it belongs to.
  useEffect(() => {
    const token = localStorage.getItem('scholario_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('scholario_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('scholario_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(name, email, password, role) {
    // Registration no longer logs the person in - the account exists but
    // is unverified until they enter the code sent to their email.
    const res = await api.post('/auth/register', { name, email, password, role });
    return res.data; // { success, message, email }
  }

  // Used by the verify-email page: once a code is confirmed, the backend
  // returns a real token + user, so we can log them in immediately.
  function setSession(token, userObj) {
    localStorage.setItem('scholario_token', token);
    setUser(userObj);
  }

  function logout() {
    localStorage.removeItem('scholario_token');
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}
