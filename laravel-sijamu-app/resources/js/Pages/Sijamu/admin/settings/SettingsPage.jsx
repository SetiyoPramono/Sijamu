'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { ToastContainer, addToast } from '@/components/Toast';

const TABS = [
  { id: 'umum', label: 'Pengaturan Umum', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { id: 'notifikasi', label: 'Notifikasi & Email', icon: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0' },
  { id: 'sistem', label: 'Sistem & Backup', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('umum');
  const [loading, setLoading] = useState(false);

  // Form states
  const [instNama, setInstNama] = useState('Universitas PGRI Banyuwangi');
  const [tahunAkademik, setTahunAkademik] = useState('2026/2027');
  const [emailNotif, setEmailNotif] = useState(true);
  const [waNotif, setWaNotif] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast('Pengaturan berhasil disimpan!', 'success');
    }, 800);
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <ToastContainer />
      
      <main className="main-content">
        <div className="page-wrapper">
          <Breadcrumb items={[
            { label: 'Beranda', href: '/dashboard' },
            { label: 'Administrasi', href: '#' },
            { label: 'Pengaturan', href: '/admin/settings' },
          ]} />

          <div className="page-header flex items-center justify-between">
            <div>
              <h1 className="page-title">Pengaturan Sistem</h1>
              <p className="page-subtitle">Konfigurasi dasar aplikasi SIJAMU 2.0</p>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleSave} 
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-start">
            {/* Sidebar Menu */}
            <div className="static md:sticky md:top-4 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`flex items-center gap-3 py-3 px-4 rounded-md text-sm font-semibold cursor-pointer border-none text-left transition-all whitespace-nowrap md:whitespace-normal ${
                    activeTab === tab.id 
                      ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]' 
                      : 'bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={tab.icon}/>
                  </svg>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="card flex flex-col gap-6">
              
              {activeTab === 'umum' && (
                <>
                  <div className="mb-4 pb-3 border-b border-[var(--color-border)]">
                    <h2 className="text-xl font-bold text-[var(--color-text)]">Pengaturan Umum</h2>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">Informasi institusi dan parameter tahun akademik berjalan.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="form-group col-span-1 md:col-span-2">
                      <label className="form-label">Nama Institusi</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={instNama} 
                        onChange={(e) => setInstNama(e.target.value)} 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Tahun Akademik Aktif</label>
                      <select 
                        className="form-select" 
                        value={tahunAkademik} 
                        onChange={(e) => setTahunAkademik(e.target.value)}
                      >
                        <option value="2026/2027">2026/2027</option>
                        <option value="2025/2026">2025/2026</option>
                        <option value="2024/2025">2024/2025</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Batas Waktu Unggah Dokumen</label>
                      <input type="date" className="form-input" defaultValue="2026-12-31" />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'notifikasi' && (
                <>
                  <div className="mb-4 pb-3 border-b border-[var(--color-border)]">
                    <h2 className="text-xl font-bold text-[var(--color-text)]">Notifikasi & Pemberitahuan</h2>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">Atur bagaimana sistem mengirimkan pemberitahuan kepada pengguna.</p>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-[var(--color-text)] mb-0.5">Notifikasi Email</h3>
                        <p className="text-xs text-[var(--color-text-muted)]">Kirim pemberitahuan status dokumen dan hasil evaluasi via email institusi.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" className="sr-only peer" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} />
                        <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                      </label>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-[var(--color-text)] mb-0.5">Notifikasi WhatsApp</h3>
                        <p className="text-xs text-[var(--color-text-muted)]">Kirim pesan pengingat ke nomor WhatsApp pengguna yang terdaftar.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" className="sr-only peer" checked={waNotif} onChange={(e) => setWaNotif(e.target.checked)} />
                        <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'sistem' && (
                <>
                  <div className="mb-4 pb-3 border-b border-[var(--color-border)]">
                    <h2 className="text-xl font-bold text-[var(--color-text)]">Sistem & Backup</h2>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">Manajemen penyimpanan dan cadangan basis data.</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-[var(--color-text)] mb-0.5">Backup Otomatis</h3>
                        <p className="text-xs text-[var(--color-text-muted)]">Sistem akan membuat cadangan data setiap minggu secara otomatis.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" className="sr-only peer" checked={autoBackup} onChange={(e) => setAutoBackup(e.target.checked)} />
                        <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                      </label>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-[var(--color-text)] mb-0.5">Mode Pemeliharaan (Maintenance)</h3>
                        <p className="text-xs text-[var(--color-text-muted)]">Hanya Administrator yang dapat login. Berguna saat update sistem.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                      </label>
                    </div>

                    <div className="mt-4">
                      <button className="btn btn-outline" onClick={() => addToast('Proses pencadangan data dimulai...', 'info')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Unduh Backup Database Sekarang
                      </button>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
