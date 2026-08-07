'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { ToastContainer, addToast } from '@/components/Toast';
import styles from './ReportsPage.module.css';

const reportTypes = [
  {
    id: 1,
    title: 'Laporan Evaluasi Diri (LED)',
    desc: 'Rekapitulasi lengkap borang dan evaluasi diri per program studi.',
    format: 'PDF / Word',
    lastGenerated: '5 Agustus 2026',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Laporan Kinerja Program Studi (LKPS)',
    desc: 'Data kuantitatif indikator kinerja utama dan tambahan prodi.',
    format: 'Excel',
    lastGenerated: '3 Agustus 2026',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Rekap Kelengkapan Dokumen',
    desc: 'Status ketersediaan dokumen fisik maupun digital seluruh standar.',
    format: 'PDF',
    lastGenerated: 'Hari ini',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Laporan Temuan Audit',
    desc: 'Catatan rekomendasi dan ketidaksesuaian dari tim auditor internal.',
    format: 'PDF / Excel',
    lastGenerated: 'Bulan lalu',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  }
];

export default function ReportsPage() {
  const [selectedProdi, setSelectedProdi] = useState('Semua Prodi');
  const [selectedTahun, setSelectedTahun] = useState('2026');

  const handleDownload = (title) => {
    addToast(`Menyiapkan unduhan untuk ${title}...`, 'info');
    setTimeout(() => {
      addToast(`Unduhan ${title} berhasil dimulai.`, 'success');
    }, 1500);
  };

  const handleGenerate = (title) => {
    addToast(`Menghasilkan laporan baru untuk ${title}...`, 'info');
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <ToastContainer />
      
      <main className="main-content">
        <div className="page-wrapper">
          <Breadcrumb items={[
            { label: 'Beranda', href: '/dashboard' },
            { label: 'Laporan', href: '/reports' },
          ]} />

          <div className="page-header flex items-center justify-between">
            <div>
              <h1 className="page-title">Pusat Laporan</h1>
              <p className="page-subtitle">Unduh dan hasilkan laporan akreditasi & penjaminan mutu secara otomatis</p>
            </div>
          </div>

          <div className={`card ${styles.filterSection}`}>
            <div className="form-group" style={{ flex: 1, minWidth: '250px' }}>
              <label className="form-label">Program Studi</label>
              <select 
                className="form-select" 
                value={selectedProdi} 
                onChange={(e) => setSelectedProdi(e.target.value)}
              >
                <option value="Semua Prodi">Semua Program Studi</option>
                <option value="Teknik Informatika">Teknik Informatika</option>
                <option value="Pendidikan Matematika">Pendidikan Matematika</option>
                <option value="Manajemen">Manajemen</option>
                <option value="Pendidikan Bahasa Inggris">Pendidikan Bahasa Inggris</option>
              </select>
            </div>
            <div className="form-group" style={{ width: '150px' }}>
              <label className="form-label">Tahun Akademik</label>
              <select 
                className="form-select" 
                value={selectedTahun} 
                onChange={(e) => setSelectedTahun(e.target.value)}
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>

          <div className={styles.reportsGrid}>
            {reportTypes.map(report => (
              <div key={report.id} className={styles.reportCard}>
                <div className={styles.reportHeader}>
                  <div className={styles.reportIcon} aria-hidden="true">
                    {report.icon}
                  </div>
                  <div>
                    <h2 className={styles.reportTitle}>{report.title}</h2>
                  </div>
                </div>
                <p className={styles.reportDesc}>{report.desc}</p>
                
                <div className={styles.reportMeta} style={{marginTop: 'var(--space-4)'}}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Format Ekspor</span>
                    <span className={styles.metaValue}>{report.format}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Dibuat Terakhir</span>
                    <span className={styles.metaValue}>{report.lastGenerated}</span>
                  </div>
                </div>

                <div className={styles.reportActions}>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                    onClick={() => handleDownload(report.title)}
                  >
                    Unduh Terbaru
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => handleGenerate(report.title)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"/>
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tabel Riwayat Laporan */}
          <div className={`card ${styles.historyTable}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title" style={{marginBottom: 0}}>Riwayat Pembuatan Laporan</h2>
              <button className="btn btn-ghost btn-sm">Lihat Semua</button>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Nama Laporan</th>
                    <th>Program Studi</th>
                    <th>Dibuat Oleh</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Hari ini, 10:45</td>
                    <td>Rekap Kelengkapan Dokumen</td>
                    <td>Teknik Informatika</td>
                    <td>Dewi Lestari, S.Kom</td>
                    <td><span className="badge badge-success">Selesai</span></td>
                  </tr>
                  <tr>
                    <td>5 Ags 2026, 09:12</td>
                    <td>Laporan Evaluasi Diri (LED)</td>
                    <td>Pendidikan Matematika</td>
                    <td>Prof. Siti Rahayu, M.Pd</td>
                    <td><span className="badge badge-success">Selesai</span></td>
                  </tr>
                  <tr>
                    <td>3 Ags 2026, 14:30</td>
                    <td>Laporan Kinerja Program Studi (LKPS)</td>
                    <td>Semua Prodi</td>
                    <td>Sistem (Otomatis)</td>
                    <td><span className="badge badge-success">Selesai</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
