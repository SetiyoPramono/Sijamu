'use client';

import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

const AuthContext = createContext(null);

export function AuthProvider({ children, initialUser }) {
  const [user, setUser] = useState(initialUser || null);
  const loading = false;

  // Sync state whenever Inertia successfully navigates to a new page
  useEffect(() => {
    // Also sync on initial mount just in case
    setUser(initialUser || null);
    
    // Listen to successful Inertia navigations to update user state dynamically
    const unsubscribe = router.on('success', (event) => {
      setUser(event.detail.page.props.auth?.user || null);
    });
    
    return () => unsubscribe();
  }, [initialUser]);

  /* ── Login ───────────────────────────────────────────────────── */
  const login = useCallback((nip, password) => {
    return new Promise((resolve, reject) => {
      router.post('/login', { nip, password }, {
        onSuccess: (page) => {
          // No need to setUser here manually as useEffect will catch it
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
      // No need to setUser manually as useEffect will catch it
    });
  }, []);

  /* ── Helpers ─────────────────────────────────────────────────── */
  const isRole = useCallback((...roles) => user && roles.includes(user.role), [user]);

  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes(permission);
    }
    return false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
