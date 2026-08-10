'use client';

import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useAuth } from '@/context/AuthContext';

/** Tampilan kartu peran — hanya sebagai panduan visual, bukan filter login */
const roles = [
  { value: 'admin',     label: 'Administrator',       desc: 'Mengelola pengguna, RPS, dan konfigurasi sistem' },
  { value: 'auditor',   label: 'Auditor / Asesor',    desc: 'Melakukan evaluasi dan penilaian dokumen mutu' },
  { value: 'dekan',     label: 'Dekan / Pimpinan',    desc: 'Memantau laporan dan rekap status mutu' },
  { value: 'koprodi',   label: 'Koordinator Prodi',   desc: 'Mengelola kelengkapan dokumen prodi' },
  { value: 'taskforce', label: 'Staf / Task Force',   desc: 'Mengunggah dokumen bukti akreditasi' },
];

/** Redirect tujuan berdasarkan role user */
function roleRedirect(role) {
  switch (role) {
    case 'auditor':   return '/auditor';
    case 'taskforce': return '/upload';
    case 'koprodi':   return '/upload';
    default:          return '/dashboard';
  }
}

export default function LoginPage() {
  // router is imported from @inertiajs/react
  const searchParams = new URLSearchParams(window.location.search);
  const { login, user, loading: authLoading } = useAuth();

  const [form, setForm]       = useState({ nip: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPass, setShowPass] = useState(false);

  // Jika sudah login → redirect
  useEffect(() => {
    if (!authLoading && user) {
      router.visit(roleRedirect(user.role));
    }
  }, [authLoading, user, router]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nip.trim() || !form.password) {
      setError('Silakan isi NIP dan kata sandi Anda.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const loggedUser = await login(form.nip.trim(), form.password);

      // Simpan session cookie agar middleware bisa membacanya
      document.cookie = `sijamu_session=${encodeURIComponent(JSON.stringify({ role: loggedUser.role, id: loggedUser.id }))}; path=/; max-age=${8 * 3600}; SameSite=Strict`;

      const redirect = searchParams.get('redirect');
      router.visit(redirect && redirect.startsWith('/') ? redirect : roleRedirect(loggedUser.role));
    } catch (err) {
      setError(err.message ?? 'Login gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      {/* Left panel — branding */}
      <div className="w-[420px] shrink-0 bg-gradient-to-br from-[#0F2554] via-[#1A56DB] to-[#2563EB] flex flex-col p-8 relative overflow-hidden max-lg:hidden">
        {/* Decorator circles */}
        <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-white/5 rounded-full" />
        <div className="absolute -bottom-[60px] -left-[60px] w-[240px] h-[240px] bg-white/5 rounded-full" />
        
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <div className="w-20 h-20 bg-white/15 rounded-2xl flex items-center justify-center mb-5 backdrop-blur-md border border-white/20">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <h1 className="text-[42px] font-extrabold text-white tracking-tight leading-[1.1] mb-2">SIJAMU 2.0</h1>
          <p className="text-lg text-white/85 font-medium mb-1">Sistem Penjaminan Mutu Internal</p>
          <p className="text-sm text-white/65 mb-8">Universitas PGRI Banyuwangi</p>

          <div className="flex flex-col gap-3">
            {[
              { icon: '🎯', text: 'Evaluasi dokumen split-screen' },
              { icon: '📊', text: 'Dashboard visual traffic light' },
              { icon: '📁', text: 'Upload terstruktur & terpandu' },
              { icon: '♿', text: 'Ramah segala usia & aksesibel' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-base text-white/90 py-3 px-4 bg-white/10 rounded-lg border border-white/10 backdrop-blur-sm">
                <span className="text-[20px] shrink-0">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-xs text-white/45">
          <p>© 2026 UNIPGRI Banyuwangi · v2.0.0</p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8 max-sm:p-4 max-sm:items-start max-sm:pt-10">
        <div className="w-full max-w-[520px] bg-white rounded-2xl shadow-2xl p-10 max-sm:p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-[var(--color-text)] tracking-tight">Selamat Datang</h2>
            <p className="text-base text-[var(--color-text-muted)] mt-2">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {/* NIP / Email */}
            <div className="form-group">
              <label htmlFor="nip" className="form-label">
                NIP / Email Institusi
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-[14px] text-[var(--color-text-light)] pointer-events-none flex items-center" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  id="nip"
                  name="nip"
                  type="text"
                  className="form-input pl-[44px]"
                  placeholder="Masukkan NIP atau email Anda"
                  value={form.nip}
                  onChange={handleChange}
                  autoComplete="username"
                  aria-required="true"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Kata Sandi
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-[14px] text-[var(--color-text-light)] pointer-events-none flex items-center" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input pl-[44px] pr-[44px]"
                  placeholder="Masukkan kata sandi Anda"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  aria-required="true"
                />
                <button
                  type="button"
                  className="absolute right-[12px] bg-transparent border-none cursor-pointer p-1 text-[var(--color-text-light)] flex items-center rounded-md transition-colors hover:text-[var(--color-text)]"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Role info — informatif, bukan input */}
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Akses berdasarkan akun terdaftar:</p>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-2">
                {roles.map((r) => (
                  <div key={r.value} className="flex flex-col gap-[3px] py-3 px-4 border border-[var(--color-border)] rounded-md bg-[var(--color-bg)]">
                    <span className="text-xs font-bold text-[var(--color-text)]">{r.label}</span>
                    <span className="text-[11px] text-[var(--color-text-muted)] leading-[1.4]">{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 py-3 px-4 bg-[var(--color-danger-light)] border border-red-300 rounded-md text-[var(--color-danger)] text-sm font-medium" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-lg w-full mt-2"
              disabled={loading}
              aria-live="polite"
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm" aria-hidden="true" />
                  Sedang masuk...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Masuk ke Sistem
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-[var(--color-text-muted)] text-center mt-5">
            Lupa kata sandi? Hubungi{' '}
            <a href="mailto:admin@unipgri-banyuwangi.ac.id" className="text-[var(--color-primary)] font-semibold underline hover:text-[var(--color-primary-dark)]">
              Administrator Sistem
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

