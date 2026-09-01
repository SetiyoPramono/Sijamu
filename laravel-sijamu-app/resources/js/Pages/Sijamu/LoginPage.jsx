'use client';

import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Lock, User, CheckCircle2, LogIn } from 'lucide-react';

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
    <div className="min-h-screen w-full flex bg-[#f8fafc] relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="flex w-full min-h-screen z-10 relative">
        
        {/* Left Side: Branding (Desktop Only) */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 lg:p-20 relative">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                 <path d="M6 12v5c3 3 9 3 12 0v-5"/>
               </svg>
             </div>
             <span className="text-2xl font-extrabold tracking-tight text-slate-900">SIJAMU 2.0</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
              Sistem Penjaminan Mutu Internal
            </h1>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Platform evaluasi mutu yang terintegrasi, transparan, dan efisien untuk Universitas PGRI Banyuwangi.
            </p>

            <div className="space-y-4">
              {[
                'Evaluasi dokumen split-screen',
                'Dashboard visual traffic light',
                'Upload terstruktur & terpandu',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-slate-700">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <CheckCircle2 size={14} strokeWidth={3} />
                  </div>
                  <span className="font-medium text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm font-medium text-slate-400">
            © 2026 UNIPGRI Banyuwangi · v2.0.0
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10 transition-all">
            
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">SIJAMU 2.0</span>
            </div>

            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Selamat Datang</h2>
              <p className="text-sm text-slate-500 mt-2 font-medium">Masuk menggunakan NIP atau Email Institusi</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              
              {/* NIP Input */}
              <div className="space-y-1.5">
                <label htmlFor="nip" className="text-sm font-semibold text-slate-700">
                  NIP / Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <User size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="nip"
                    name="nip"
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                    placeholder="Masukkan NIP atau Email"
                    value={form.nip}
                    onChange={handleChange}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                    Kata Sandi
                  </label>
                  <a href="mailto:admin@unipgri-banyuwangi.ac.id" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    Lupa sandi?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="flex items-center gap-2 p-3.5 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p>{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full relative flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 overflow-hidden mt-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memproses...</span>
                  </div>
                ) : (
                  <>
                    <span>Masuk ke Sistem</span>
                    <LogIn size={18} strokeWidth={2.5} className="opacity-80" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

