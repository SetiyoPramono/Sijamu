'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './LoginPage.module.css';

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
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();

  const [form, setForm]       = useState({ nip: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPass, setShowPass] = useState(false);

  // Jika sudah login → redirect
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(roleRedirect(user.role));
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
      router.replace(redirect && redirect.startsWith('/') ? redirect : roleRedirect(loggedUser.role));
    } catch (err) {
      setError(err.message ?? 'Login gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* Left panel — branding */}
      <div className={styles.leftPanel}>
        <div className={styles.brandingContent}>
          <div className={styles.brandIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <h1 className={styles.brandTitle}>SIJAMU 2.0</h1>
          <p className={styles.brandSubtitle}>Sistem Penjaminan Mutu Internal</p>
          <p className={styles.brandUniv}>Universitas PGRI Banyuwangi</p>

          <div className={styles.featureList}>
            {[
              { icon: '🎯', text: 'Evaluasi dokumen split-screen' },
              { icon: '📊', text: 'Dashboard visual traffic light' },
              { icon: '📁', text: 'Upload terstruktur & terpandu' },
              { icon: '♿', text: 'Ramah segala usia & aksesibel' },
            ].map((f, i) => (
              <div key={i} className={styles.featureItem}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.brandingFooter}>
          <p>© 2026 UNIPGRI Banyuwangi · v2.0.0</p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className={styles.rightPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Selamat Datang</h2>
            <p className={styles.formSubtitle}>Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* NIP / Email */}
            <div className="form-group">
              <label htmlFor="nip" className="form-label">
                NIP / Email Institusi
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  id="nip"
                  name="nip"
                  type="text"
                  className={`form-input ${styles.inputWithIcon}`}
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
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className={`form-input ${styles.inputWithIcon} ${styles.inputWithIconRight}`}
                  placeholder="Masukkan kata sandi Anda"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  aria-required="true"
                />
                <button
                  type="button"
                  className={styles.inputIconRight}
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
            <div className={styles.roleInfoSection}>
              <p className={styles.roleInfoTitle}>Akses berdasarkan akun terdaftar:</p>
              <div className={styles.roleGrid}>
                {roles.map((r) => (
                  <div key={r.value} className={styles.roleCard}>
                    <span className={styles.roleLabel}>{r.label}</span>
                    <span className={styles.roleDesc}>{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className={styles.errorBox} role="alert">
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
              className={`btn btn-primary btn-lg ${styles.submitBtn}`}
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

          <p className={styles.helpText}>
            Lupa kata sandi? Hubungi{' '}
            <a href="mailto:admin@unipgri-banyuwangi.ac.id" className={styles.helpLink}>
              Administrator Sistem
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
