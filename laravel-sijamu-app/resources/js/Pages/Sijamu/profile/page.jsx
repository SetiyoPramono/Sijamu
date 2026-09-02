'use client';

import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { ToastContainer, addToast } from '@/components/Toast';
import { User, Mail, Lock, Shield, CreditCard, Save } from 'lucide-react';

export default function ProfilePage({ user }) {
  const { flash } = usePage().props;

  // React to flash messages
  React.useEffect(() => {
    if (flash?.message) {
      addToast(flash.message, 'success');
    }
  }, [flash]);

  // Form for Identity
  const identityForm = useForm({
    name: user.name || '',
    email: user.email || '',
  });

  const submitIdentity = (e) => {
    e.preventDefault();
    identityForm.patch('/profile', {
      preserveScroll: true,
      onSuccess: () => {
        // Flash handled by useEffect
      },
    });
  };

  // Form for Password
  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const submitPassword = (e) => {
    e.preventDefault();
    passwordForm.patch('/profile/password', {
      preserveScroll: true,
      onSuccess: () => {
        passwordForm.reset();
      },
    });
  };

  const roleLabel = {
    'admin': 'Administrator',
    'auditor': 'Auditor / Asesor',
    'dekan': 'Dekan / Pimpinan',
    'koprodi': 'Koordinator Prodi',
    'taskforce': 'Staf / Task Force',
    'dosen': 'Dosen / Pengajar'
  }[user.role] || user.role;

  return (
    <div className="app-shell flex h-screen bg-slate-50 font-sans">
      <Sidebar />
      <ToastContainer />
      
      <main className="main-content flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto">
          <Breadcrumb 
            items={[
              { label: 'Beranda', href: '/dashboard' },
              { label: 'Profil Pengguna', href: '/profile' }
            ]} 
          />
          
          <div className="mb-8 mt-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Profil Pengguna</h1>
            <p className="text-slate-500 mt-1">Kelola informasi pribadi dan keamanan akun Anda.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sisi Kiri: Info Read-only & Summary */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 text-center">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg shadow-blue-500/30 uppercase">
                  {user.name.split(' ').slice(-1)[0][0]}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                <p className="text-sm font-medium text-blue-600 bg-blue-50 py-1 px-3 rounded-full inline-block mt-2">{roleLabel}</p>
              </div>

              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-4">Informasi Akademik</h3>
                
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5"><CreditCard size={14}/> NIP / NIDN</span>
                  <span className="font-semibold text-slate-800">{user.identity_number || '-'}</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5"><Shield size={14}/> Program Studi</span>
                  <span className="font-semibold text-slate-800">{user.prodi || 'Semua / Tidak Spesifik'}</span>
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200/50 rounded-xl text-xs text-amber-700 flex gap-2 items-start">
                  <Shield size={16} className="shrink-0 mt-0.5" />
                  <p>Informasi NIP dan Prodi hanya dapat diubah oleh Administrator sistem untuk menjaga integritas data.</p>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Form Update */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Form Identitas */}
              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-lg font-bold text-slate-900">Informasi Pribadi</h3>
                  <p className="text-sm text-slate-500">Perbarui nama lengkap dan alamat email institusi Anda.</p>
                </div>
                <div className="p-8">
                  <form onSubmit={submitIdentity} className="space-y-5">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-sm font-semibold text-slate-700">Nama Lengkap & Gelar</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                          <User size={18} strokeWidth={2.5} />
                        </div>
                        <input
                          id="name"
                          type="text"
                          value={identityForm.data.name}
                          onChange={e => identityForm.setData('name', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                        />
                      </div>
                      {identityForm.errors.name && <p className="text-sm text-red-600 mt-1 font-medium">{identityForm.errors.name}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Institusi</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                          <Mail size={18} strokeWidth={2.5} />
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={identityForm.data.email}
                          onChange={e => identityForm.setData('email', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                        />
                      </div>
                      {identityForm.errors.email && <p className="text-sm text-red-600 mt-1 font-medium">{identityForm.errors.email}</p>}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={identityForm.processing || !identityForm.isDirty}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save size={16} strokeWidth={2.5} />
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Form Password */}
              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-lg font-bold text-slate-900">Keamanan Akun</h3>
                  <p className="text-sm text-slate-500">Pastikan akun Anda menggunakan kata sandi yang panjang dan acak agar tetap aman.</p>
                </div>
                <div className="p-8">
                  <form onSubmit={submitPassword} className="space-y-5">
                    <div className="space-y-1.5">
                      <label htmlFor="current_password" className="text-sm font-semibold text-slate-700">Kata Sandi Saat Ini</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                          <Lock size={18} strokeWidth={2.5} />
                        </div>
                        <input
                          id="current_password"
                          type="password"
                          value={passwordForm.data.current_password}
                          onChange={e => passwordForm.setData('current_password', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                        />
                      </div>
                      {passwordForm.errors.current_password && <p className="text-sm text-red-600 mt-1 font-medium">{passwordForm.errors.current_password}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="password" className="text-sm font-semibold text-slate-700">Kata Sandi Baru</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                          <Lock size={18} strokeWidth={2.5} />
                        </div>
                        <input
                          id="password"
                          type="password"
                          value={passwordForm.data.password}
                          onChange={e => passwordForm.setData('password', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                        />
                      </div>
                      {passwordForm.errors.password && <p className="text-sm text-red-600 mt-1 font-medium">{passwordForm.errors.password}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="password_confirmation" className="text-sm font-semibold text-slate-700">Konfirmasi Kata Sandi Baru</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                          <Lock size={18} strokeWidth={2.5} />
                        </div>
                        <input
                          id="password_confirmation"
                          type="password"
                          value={passwordForm.data.password_confirmation}
                          onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                        />
                      </div>
                      {passwordForm.errors.password_confirmation && <p className="text-sm text-red-600 mt-1 font-medium">{passwordForm.errors.password_confirmation}</p>}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={passwordForm.processing}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save size={16} strokeWidth={2.5} />
                        Perbarui Sandi
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
