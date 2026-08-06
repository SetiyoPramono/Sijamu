// Halaman Executive Dashboard — route: /dashboard
// CSS ada di: DashboardPage.module.css
'use client';

import { useEffect, useRef, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { ToastContainer, addToast } from '@/components/Toast';
import styles from './DashboardPage.module.css';

const trafficData = [
  { prodi: 'Teknik Informatika',        status: 'success', label: 'Aman',       kelengkapan: 92, missing: 2,  auditor: 'Dr. Ahmad F.' },
  { prodi: 'Pendidikan Matematika',     status: 'success', label: 'Aman',       kelengkapan: 88, missing: 3,  auditor: 'Prof. Siti R.' },
  { prodi: 'Manajemen',                 status: 'warning', label: 'Perlu Perhatian', kelengkapan: 61, missing: 12, auditor: 'Dr. Budi S.' },
  { prodi: 'Pendidikan Bahasa Inggris', status: 'warning', label: 'Perlu Perhatian', kelengkapan: 55, missing: 14, auditor: '-' },
  { prodi: 'Akuntansi',                 status: 'danger',  label: 'Kritis',     kelengkapan: 28, missing: 22, auditor: '-' },
  { prodi: 'Pendidikan IPA',            status: 'danger',  label: 'Kritis',     kelengkapan: 15, missing: 27, auditor: '-' },
  { prodi: 'Hukum',                     status: 'success', label: 'Aman',       kelengkapan: 95, missing: 1,  auditor: 'Dr. Wati N.' },
];

const statCards = [
  { label: 'Total Prodi Diaudit', value: '7',  sub: 'dari 7 prodi aktif',  color: 'primary', icon: '🏫' },
  { label: 'Dokumen Lengkap',     value: '2',  sub: 'prodi status Aman',   color: 'success', icon: '✅' },
  { label: 'Perlu Perhatian',     value: '2',  sub: 'prodi status Kuning', color: 'warning', icon: '⚠️' },
  { label: 'Status Kritis',       value: '2',  sub: 'prodi segera ditindak', color: 'danger', icon: '🚨' },
];

export default function DashboardPage() {
  const canvasRef = useRef(null);
  const [chartLoaded, setChartLoaded] = useState(false);
  const chartRef = useRef(null);

  const totalDocs = trafficData.reduce((s, p) => s + p.kelengkapan, 0);
  const avgKelengkapan = Math.round(totalDocs / trafficData.length);
  const totalMissing = trafficData.reduce((s, p) => s + p.missing, 0);

  useEffect(() => {
    let chart;
    const initChart = async () => {
      const { Chart, ArcElement, DoughnutController, Tooltip, Legend } = await import('chart.js');
      Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

      if (canvasRef.current) {
        if (chartRef.current) chartRef.current.destroy();

        chart = new Chart(canvasRef.current, {
          type: 'doughnut',
          data: {
            labels: ['Aman (Hijau)', 'Perlu Perhatian (Kuning)', 'Kritis (Merah)'],
            datasets: [{
              data: [3, 2, 2],
              backgroundColor: ['#057A55', '#C27803', '#C81E1E'],
              borderWidth: 0,
              hoverOffset: 8,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  font: { size: 14, family: 'Inter', weight: '600' },
                  padding: 20,
                  usePointStyle: true,
                  pointStyleWidth: 12,
                },
              },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` ${ctx.label}: ${ctx.raw} prodi`,
                },
              },
            },
          },
        });
        chartRef.current = chart;
        setChartLoaded(true);
      }
    };
    initChart();
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />
      <ToastContainer />

      <main className="main-content">
        <div className="page-wrapper">
          <Breadcrumb items={[
            { label: 'Beranda', href: '/dashboard' },
            { label: 'Executive Dashboard', href: '/dashboard' },
          ]} />

          <div className="page-header flex items-center justify-between">
            <div>
              <h1 className="page-title">Executive Dashboard</h1>
              <p className="page-subtitle">Rekap status mutu seluruh program studi — Periode Agustus 2026</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => addToast('Laporan PDF sedang digenerate...', 'info')}
              aria-label="Unduh laporan PDF"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Unduh Laporan
            </button>
          </div>

          {/* Stat Cards */}
          <div className={styles.statGrid}>
            {statCards.map((s, i) => (
              <div key={i} className={`${styles.statCard} ${styles[`stat-${s.color}`]}`}>
                <div className={styles.statEmoji} aria-hidden="true">{s.icon}</div>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statSub}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div className={styles.dashRow}>
            {/* Donut Chart */}
            <div className={`card ${styles.chartCard}`}>
              <h2 className="card-title">Status Kelengkapan Mutu</h2>
              <div className={styles.chartCenter}>
                <div className={styles.chartWrap}>
                  <canvas ref={canvasRef} aria-label="Grafik donat status kelengkapan mutu" role="img" />
                  <div className={styles.chartOverlay}>
                    <div className={styles.chartPct}>{avgKelengkapan}%</div>
                    <div className={styles.chartPctLabel}>Rata-rata<br/>Kelengkapan</div>
                  </div>
                </div>
              </div>
              <div className={styles.chartSummary}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryDot} style={{background:'#C81E1E'}} />
                  <span><strong>{totalMissing}</strong> Indikator Kurang Dokumen</span>
                </div>
              </div>
            </div>

            {/* Progress by Prodi */}
            <div className={`card ${styles.progressCard}`}>
              <h2 className="card-title">Kelengkapan per Program Studi</h2>
              <div className={styles.progressList}>
                {trafficData.map((p, i) => (
                  <div key={i} className={styles.progressItem}>
                    <div className={styles.progressHeader}>
                      <span className={styles.progressProdi}>{p.prodi}</span>
                      <span className={`badge badge-${p.status}`}>{p.kelengkapan}%</span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${p.kelengkapan}%`,
                          background: p.status === 'success' ? 'linear-gradient(90deg,#057A55,#10B981)'
                            : p.status === 'warning' ? 'linear-gradient(90deg,#C27803,#F59E0B)'
                            : 'linear-gradient(90deg,#C81E1E,#EF4444)',
                        }}
                        role="progressbar"
                        aria-valuenow={p.kelengkapan}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${p.prodi}: ${p.kelengkapan}%`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Traffic Light Table */}
          <div className={`card mt-6`}>
            <div className={styles.tableHeader}>
              <h2 className="card-title" style={{marginBottom:0}}>Traffic Light — Status Mutu Prodi</h2>
              <div className={styles.legend}>
                <span className={`badge badge-success`}>● Aman</span>
                <span className={`badge badge-warning`}>● Perlu Perhatian</span>
                <span className={`badge badge-danger`}>● Kritis</span>
              </div>
            </div>
            <div className="table-wrapper mt-4">
              <table className="data-table" aria-label="Tabel traffic light status mutu program studi">
                <thead>
                  <tr>
                    <th scope="col">No</th>
                    <th scope="col">Program Studi</th>
                    <th scope="col">Status Mutu</th>
                    <th scope="col">Kelengkapan</th>
                    <th scope="col">Indikator Kurang</th>
                    <th scope="col">Auditor</th>
                    <th scope="col">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {trafficData.map((row, i) => (
                    <tr
                      key={i}
                      className={styles[`row-${row.status}`]}
                    >
                      <td>{i + 1}</td>
                      <td><strong>{row.prodi}</strong></td>
                      <td>
                        <span className={`badge badge-${row.status}`}>
                          {row.status === 'success' ? '✓' : row.status === 'warning' ? '⚠' : '✕'} {row.label}
                        </span>
                      </td>
                      <td>
                        <div className={styles.inlineProgress}>
                          <div className="progress-bar-track" style={{flex:1}}>
                            <div className="progress-bar-fill" style={{
                              width:`${row.kelengkapan}%`,
                              background: row.status === 'success' ? 'linear-gradient(90deg,#057A55,#10B981)'
                                : row.status === 'warning' ? 'linear-gradient(90deg,#C27803,#F59E0B)'
                                : 'linear-gradient(90deg,#C81E1E,#EF4444)',
                            }} />
                          </div>
                          <span style={{fontWeight:700,minWidth:40}}>{row.kelengkapan}%</span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: row.missing > 10 ? 'var(--color-danger)' : row.missing > 5 ? 'var(--color-warning)' : 'var(--color-success)',
                        }}>
                          {row.missing} dokumen
                        </span>
                      </td>
                      <td>{row.auditor}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => addToast(`Membuka detail ${row.prodi}...`, 'info')}
                          aria-label={`Lihat detail ${row.prodi}`}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
