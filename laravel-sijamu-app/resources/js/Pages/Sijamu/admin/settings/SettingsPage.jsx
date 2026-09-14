'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { ToastContainer, addToast } from '@/components/Toast';
import axios from 'axios';
import { usePage, router } from '@inertiajs/react';

const TABS = [
  { id: 'umum', label: 'Profil Institusi', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { id: 'notifikasi', label: 'Notifikasi & SMTP', icon: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0' },
  { id: 'mutu', label: 'Preferensi Mutu', icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' },
  { id: 'sistem', label: 'Keamanan & Sistem', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
];

export default function SettingsPage() {
  const { props } = usePage();
  const [activeTab, setActiveTab] = useState('umum');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Form states
  const [form, setForm] = useState({
    institution_name: '',
    institution_slogan: '',
    primary_color: '#057A55',
    institution_logo: '',
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_pass: '',
    smtp_encryption: 'tls',
    enable_email_notif: '1',
    wa_api_endpoint: '',
    wa_api_key: '',
    passing_grade_safe: '80',
    passing_grade_critical: '50',
    lpm_head_name: '',
    lpm_head_nip: '',
    max_upload_size_mb: '10',
    maintenance_mode: '0',
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Load data from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/admin/api/settings');
        setForm(prev => ({ ...prev, ...res.data }));
        if (res.data.institution_logo) {
          setLogoPreview(res.data.institution_logo);
        }
      } catch (err) {
        addToast('Gagal memuat pengaturan sistem.', 'danger');
      } finally {
        setInitialLoad(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post('/admin/api/settings', form);
      addToast('Pengaturan berhasil disimpan!', 'success');
      // Reload inertia to update shared props globally (e.g. app name, primary color)
      router.reload({ only: ['appSettings'] });
    } catch (err) {
      addToast('Gagal menyimpan pengaturan.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
      addToast('Format logo harus JPG, PNG, atau SVG.', 'warning');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast('Ukuran logo maksimal 2MB.', 'warning');
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await axios.post('/admin/api/settings/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLogoPreview(res.data.url);
      setForm(prev => ({ ...prev, institution_logo: res.data.url }));
      addToast('Logo berhasil diperbarui!', 'success');
      router.reload({ only: ['appSettings'] });
    } catch (err) {
      addToast('Gagal mengunggah logo.', 'danger');
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="app-shell" style={{ '--color-primary': form.primary_color || '#057A55' }}>
      <Sidebar />
      <ToastContainer />
      
      <main className="main-content bg-gray-50/50">
        <div className="page-wrapper max-w-6xl mx-auto">
          <Breadcrumb items={[
            { label: 'Beranda', href: '/dashboard' },
            { label: 'Administrasi', href: '#' },
            { label: 'Pengaturan Sistem', href: '/admin/settings' },
          ]} />

          <div className="page-header flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Pengaturan Sistem</h1>
              <p className="text-gray-500 text-sm mt-1">Konfigurasi dasar, personalisasi identitas, dan sistem SIJAMU 2.0</p>
            </div>
            <button 
              className="btn btn-primary shadow-md hover:shadow-lg transition-all" 
              onClick={handleSave} 
              disabled={loading || initialLoad}
            >
              {loading ? (
                <><span className="animate-spin mr-2">↻</span> Menyimpan...</>
              ) : 'Simpan Perubahan'}
            </button>
          </div>

          {initialLoad ? (
            <div className="animate-pulse space-y-6">
              <div className="h-64 bg-gray-200 rounded-xl"></div>
              <div className="h-40 bg-gray-200 rounded-xl"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
              
              {/* Sidebar Menu */}
              <div className="sticky top-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    className={`flex items-center gap-3 py-3.5 px-4 rounded-lg text-sm font-semibold cursor-pointer border-none text-left transition-all whitespace-nowrap lg:whitespace-normal ${
                      activeTab === tab.id 
                        ? 'bg-[var(--color-primary)] text-white shadow-md' 
                        : 'bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={activeTab === tab.id ? 'opacity-100' : 'opacity-70'}>
                      <path d={tab.icon}/>
                    </svg>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Main Form Content */}
              <div className="space-y-6">
                
                {/* ── TAB 1: Profil Institusi ── */}
                {activeTab === 'umum' && (
                  <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 animate-fadeIn">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Profil & Identitas Institusi</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
                      {/* Logo Upload */}
                      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-colors relative group">
                        <input 
                          type="file" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          accept="image/png, image/jpeg, image/svg+xml"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                        />
                        {uploadingLogo ? (
                          <div className="text-center">
                            <span className="animate-spin text-2xl text-[var(--color-primary)] block mb-2">↻</span>
                            <span className="text-sm font-semibold text-gray-500">Mengunggah...</span>
                          </div>
                        ) : logoPreview ? (
                          <div className="flex flex-col items-center">
                            <img src={logoPreview} alt="Logo" className="w-24 h-24 object-contain mb-3" />
                            <span className="text-xs font-semibold text-gray-500 group-hover:text-[var(--color-primary)] transition-colors">Klik untuk ubah logo</span>
                          </div>
                        ) : (
                          <div className="text-center flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            </div>
                            <p className="text-sm font-bold text-gray-700">Seret & lepas Logo</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG (maks. 2MB)</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Nama Institusi</label>
                          <input type="text" name="institution_name" className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" value={form.institution_name} onChange={handleChange} placeholder="Misal: Universitas PGRI Banyuwangi" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Slogan / Motto Mutu</label>
                          <input type="text" name="institution_slogan" className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" value={form.institution_slogan} onChange={handleChange} placeholder="Misal: Unggul dalam Mutu dan Inovasi" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Warna Tema Utama</label>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg shadow-sm border border-gray-200 overflow-hidden shrink-0">
                              <input type="color" name="primary_color" className="h-12 w-12 -m-1 cursor-pointer" value={form.primary_color} onChange={handleChange} />
                            </div>
                            <input type="text" name="primary_color" className="form-input w-full md:w-32 rounded-lg border-gray-300 shadow-sm font-mono text-sm uppercase" value={form.primary_color} onChange={handleChange} />
                            <span className="text-xs text-gray-500">Mempengaruhi seluruh warna UI aplikasi.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: Notifikasi & SMTP ── */}
                {activeTab === 'notifikasi' && (
                  <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 animate-fadeIn">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Gateway Notifikasi</h2>
                    
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-200">
                      <div>
                        <h3 className="font-bold text-gray-900">Aktifkan Notifikasi Email</h3>
                        <p className="text-sm text-gray-500">Kirim email otomatis untuk jadwal audit & deadline unggah.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="enable_email_notif" className="sr-only peer" checked={form.enable_email_notif === '1'} onChange={handleChange} />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">SMTP Host</label>
                        <input type="text" name="smtp_host" className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" value={form.smtp_host} onChange={handleChange} placeholder="smtp.mailtrap.io" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">SMTP Port</label>
                        <input type="text" name="smtp_port" className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" value={form.smtp_port} onChange={handleChange} placeholder="2525" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">SMTP Username</label>
                        <input type="text" name="smtp_user" className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" value={form.smtp_user} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">SMTP Password</label>
                        <input type="password" name="smtp_pass" className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" value={form.smtp_pass} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Enkripsi (TLS/SSL)</label>
                        <select name="smtp_encryption" className="form-select w-full rounded-lg border-gray-300 shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" value={form.smtp_encryption} onChange={handleChange}>
                          <option value="tls">TLS</option>
                          <option value="ssl">SSL</option>
                          <option value="">Tanpa Enkripsi</option>
                        </select>
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-3 border-t border-gray-100 pt-6">WhatsApp API (Opsional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Endpoint API</label>
                        <input type="text" name="wa_api_endpoint" className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" value={form.wa_api_endpoint} onChange={handleChange} placeholder="https://api.fonnte.com/send" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">API Key / Token</label>
                        <input type="password" name="wa_api_key" className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" value={form.wa_api_key} onChange={handleChange} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 3: Preferensi Mutu ── */}
                {activeTab === 'mutu' && (
                  <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 animate-fadeIn">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Aturan Standar Mutu</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Passing Grade - Status Aman (%)</label>
                        <p className="text-xs text-gray-500 mb-2">Batas minimal kelengkapan agar prodi berstatus hijau.</p>
                        <input type="number" name="passing_grade_safe" className="form-input w-full rounded-lg border-gray-300 shadow-sm text-emerald-600 font-bold focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" value={form.passing_grade_safe} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Passing Grade - Status Kritis (%)</label>
                        <p className="text-xs text-gray-500 mb-2">Batas maksimal di mana prodi akan berstatus merah.</p>
                        <input type="number" name="passing_grade_critical" className="form-input w-full rounded-lg border-gray-300 shadow-sm text-red-600 font-bold focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" value={form.passing_grade_critical} onChange={handleChange} />
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-4 border-t border-gray-100 pt-6">Pejabat Pengesah Laporan (Tanda Tangan)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nama Ketua LPM</label>
                        <input type="text" name="lpm_head_name" className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" value={form.lpm_head_name} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">NIP/NIDN</label>
                        <input type="text" name="lpm_head_nip" className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" value={form.lpm_head_nip} onChange={handleChange} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 4: Keamanan & Sistem ── */}
                {activeTab === 'sistem' && (
                  <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 animate-fadeIn">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Keamanan & Pemeliharaan</h2>
                    
                    <div className="mb-8">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Maksimal Ukuran File Dokumen (MB)</label>
                      <p className="text-xs text-gray-500 mb-2">Berlaku untuk dokumen mutu dan RPS.</p>
                      <input type="number" name="max_upload_size_mb" className="form-input w-full md:w-48 rounded-lg border-gray-300 shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" value={form.max_upload_size_mb} onChange={handleChange} />
                    </div>

                    <div className="mb-6 bg-red-50 p-4 rounded-lg flex items-center justify-between border border-red-100">
                      <div>
                        <h3 className="font-bold text-red-900">Mode Pemeliharaan (Maintenance Mode)</h3>
                        <p className="text-sm text-red-700 mt-1">Sistem hanya bisa diakses oleh akun Admin. Pengguna lain akan melihat halaman Maintenance.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" name="maintenance_mode" className="sr-only peer" checked={form.maintenance_mode === '1'} onChange={handleChange} />
                        <div className="w-11 h-6 bg-red-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-red-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
