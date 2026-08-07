'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';

/* ── Types (JSDoc) ──────────────────────────────────────────────
  User: { id, name, nip, role, prodi, email }
  role: 'admin' | 'dekan' | 'koprodi' | 'taskforce' | 'auditor'
──────────────────────────────────────────────────────────────── */

const AuthContext = createContext(null);

/* ── Mock users — ganti dengan API call nyata ────────────────── */
const MOCK_USERS = [
  { id: 1, name: 'Dr. Ahmad Fauzi, M.Kom',  nip: '197001012000031001', password: 'admin123',    role: 'admin',     prodi: null,                    email: 'ahmad@unipgri.ac.id' },
  { id: 2, name: 'Prof. Dr. Siti Rahayu',   nip: '196805152001122001', password: 'dekan123',    role: 'dekan',     prodi: null,                    email: 'siti@unipgri.ac.id'  },
  { id: 3, name: 'Dr. Budi Santoso, M.T',   nip: '198003102005011002', password: 'koprodi123',  role: 'koprodi',   prodi: 'Teknik Informatika',    email: 'budi@unipgri.ac.id'  },
  { id: 4, name: 'Rina Wulandari, S.Kom',   nip: '199201052019032001', password: 'taskforce123',role: 'taskforce', prodi: 'Teknik Informatika',    email: 'rina@unipgri.ac.id'  },
  { id: 5, name: 'Dr. Wati Nurhayati, M.M', nip: '197712282004012002', password: 'auditor123',  role: 'auditor',   prodi: 'Pendidikan Matematika', email: 'wati@unipgri.ac.id'  },
];

const TOKEN_KEY  = 'sijamu_token';
const USER_KEY   = 'sijamu_user';
const SESSION_MS = 8 * 60 * 60 * 1000; // 8 jam

export function AuthProvider({ children }) {
  // router is imported from @inertiajs/react
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true saat cek session awal

  /* ── Restore session dari localStorage ──────────────────────── */
  useEffect(() => {
    try {
      const raw       = localStorage.getItem(USER_KEY);
      const tokenMeta = localStorage.getItem(TOKEN_KEY);
      if (raw && tokenMeta) {
        const { expiry } = JSON.parse(tokenMeta);
        if (Date.now() < expiry) {
          setUser(JSON.parse(raw));
        } else {
          // Token kadaluarsa
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(TOKEN_KEY);
        }
      }
    } catch {
      // Storage corrupt — clear
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Login ───────────────────────────────────────────────────── */
  const login = useCallback(async (nip, password) => {
    /*
     * TODO: Ganti blok ini dengan API call nyata:
     *   const res = await fetch('/api/auth/login', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify({ nip, password }),
     *   });
     *   if (!res.ok) throw new Error('NIP atau kata sandi salah.');
     *   const { user, token } = await res.json();
     */

    // Mock: simulasi network delay
    await new Promise(r => setTimeout(r, 900));

    const found = MOCK_USERS.find(u => u.nip === nip && u.password === password);
    if (!found) throw new Error('NIP atau kata sandi salah. Periksa kembali data Anda.');

    const { password: _pw, ...safeUser } = found;
    const tokenMeta = { value: `mock_${Date.now()}`, expiry: Date.now() + SESSION_MS };

    localStorage.setItem(USER_KEY,   JSON.stringify(safeUser));
    localStorage.setItem(TOKEN_KEY,  JSON.stringify(tokenMeta));
    setUser(safeUser);

    return safeUser;
  }, []);

  /* ── Logout ─────────────────────────────────────────────────── */
  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    router.visit('/');
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
