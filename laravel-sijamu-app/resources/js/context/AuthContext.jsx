'use client';

import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

const AuthContext = createContext(null);

export function AuthProvider({ children, initialUser }) {
  const [user, setUser] = useState(initialUser || null);
  const loading = false;

  // Sync state if initialUser changes from Inertia navigation
  useEffect(() => {
    setUser(initialUser || null);
  }, [initialUser]);

  /* ── Login ───────────────────────────────────────────────────── */
  const login = useCallback((nip, password) => {
    return new Promise((resolve, reject) => {
      router.post('/login', { nip, password }, {
        onSuccess: (page) => {
          setUser(page.props.auth.user);
          resolve(page.props.auth.user);
        },
        onError: (errors) => {
          reject(new Error(errors.nip || 'NIP atau kata sandi salah. Periksa kembali data Anda.'));
        }
      });
    });
  }, []);

  /* ── Logout ─────────────────────────────────────────────────── */
  const logout = useCallback(() => {
    router.post('/logout', {}, {
      onSuccess: () => {
        setUser(null);
      }
    });
  }, []);

  /* ── Helpers ─────────────────────────────────────────────────── */
  const isRole = useCallback((...roles) => user && roles.includes(user.role), [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
