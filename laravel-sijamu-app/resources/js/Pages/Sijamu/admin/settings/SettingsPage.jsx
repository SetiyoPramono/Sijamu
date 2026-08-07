'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { ToastContainer, addToast } from '@/components/Toast';
import styles from './SettingsPage.module.css';

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

          <div className={styles.settingsLayout}>
            {/* Sidebar Menu */}
            <div className={styles.settingsMenu}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`${styles.menuItem} ${activeTab === tab.id ? styles.menuItemActive : ''}`}
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
            <div className={`card ${styles.settingsContent}`}>
              
              {activeTab === 'umum' && (
                <>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Pengaturan Umum</h2>
                    <p className={styles.sectionDesc}>Informasi institusi dan parameter tahun akademik berjalan.</p>
                  </div>
                  
                  <div className={styles.formGrid}>
                    <div className={`form-group ${styles.fullWidth}`}>
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
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Notifikasi & Pemberitahuan</h2>
                    <p className={styles.sectionDesc}>Atur bagaimana sistem mengirimkan pemberitahuan kepada pengguna.</p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div className={styles.settingItem}>
                      <div className={styles.settingItemInfo}>
                        <h3>Notifikasi Email</h3>
                        <p>Kirim pemberitahuan status dokumen dan hasil evaluasi via email institusi.</p>
                      </div>
                      <label className={styles.toggleSwitch}>
                        <input type="checkbox" className={styles.toggleInput} checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.settingItem}>
                      <div className={styles.settingItemInfo}>
                        <h3>Notifikasi WhatsApp</h3>
                        <p>Kirim pesan pengingat ke nomor WhatsApp pengguna yang terdaftar.</p>
                      </div>
                      <label className={styles.toggleSwitch}>
                        <input type="checkbox" className={styles.toggleInput} checked={waNotif} onChange={(e) => setWaNotif(e.target.checked)} />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'sistem' && (
                <>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Sistem & Backup</h2>
                    <p className={styles.sectionDesc}>Manajemen penyimpanan dan cadangan basis data.</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div className={styles.settingItem}>
                      <div className={styles.settingItemInfo}>
                        <h3>Backup Otomatis</h3>
                        <p>Sistem akan membuat cadangan data setiap minggu secara otomatis.</p>
                      </div>
                      <label className={styles.toggleSwitch}>
                        <input type="checkbox" className={styles.toggleInput} checked={autoBackup} onChange={(e) => setAutoBackup(e.target.checked)} />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.settingItem}>
                      <div className={styles.settingItemInfo}>
                        <h3>Mode Pemeliharaan (Maintenance)</h3>
                        <p>Hanya Administrator yang dapat login. Berguna saat update sistem.</p>
                      </div>
                      <label className={styles.toggleSwitch}>
                        <input type="checkbox" className={styles.toggleInput} />
                        <span className={styles.toggleSlider}></span>
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
