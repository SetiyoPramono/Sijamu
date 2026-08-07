// Halaman Executive Dashboard — route: /dashboard
// CSS ada di: DashboardPage.module.css
'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { ToastContainer, addToast } from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';
import { useEvaluation } from '@/context/EvaluationContext';
import styles from './DashboardPage.module.css';

/* ── RingCard — SVG circular progress ring ──────────────────────────────── */
function RingCard({ value, total, label, color, trackColor }) {
  const SIZE       = 120;
  const STROKE     = 10;
  const R          = (SIZE - STROKE) / 2;
  const CIRC       = 2 * Math.PI * R;
  const pct        = total > 0 ? value / total : 0;
  const dashOffset = CIRC * (1 - pct);

  return (
    <div className={styles.ringCard}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-label={`${label}: ${value} dari ${total} prodi`} role="img">
        <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke={trackColor} strokeWidth={STROKE} />
        <circle
          cx={SIZE/2} cy={SIZE/2} r={R}
          fill="none" stroke={color} strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRC} strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${SIZE/2} ${SIZE/2})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="800" fontFamily="Inter, sans-serif" fill={color}>{value}</text>
        <text x="50%" y="66%" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif" fill="#6B7280">prodi</text>
      </svg>
      <div className={styles.ringLabel} style={{ color }}>{label}</div>
      <div className={styles.ringPct}>{Math.round(pct * 100)}%</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { evaluations: trafficData, loading: evalLoading } = useEvaluation();
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!evalLoading) {
      const timer = setTimeout(() => {
        setDataLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [evalLoading]);

  const totalDocs      = trafficData.reduce((s, p) => s + p.kelengkapan, 0);
  const avgKelengkapan = trafficData.length ? Math.round(totalDocs / trafficData.length) : 0;
  const totalMissing   = trafficData.reduce((s, p) => s + p.missing, 0);
  const totalProdi     = trafficData.length;
  const countAman      = trafficData.filter(p => p.status === 'success').length;
  const countWarn      = trafficData.filter(p => p.status === 'warning').length;
  const countDanger    = trafficData.filter(p => p.status === 'danger').length;

  const statCards = [
    { label: 'Total Prodi Diaudit', value: String(totalProdi),  sub: `dari ${totalProdi} prodi aktif`, color: 'primary', icon: '🏫' },
    { label: 'Status Aman',         value: String(countAman),   sub: 'prodi dokumen lengkap',          color: 'success', icon: '✅' },
    { label: 'Perlu Perhatian',     value: String(countWarn),   sub: 'prodi segera dilengkapi',        color: 'warning', icon: '⚠️' },
    { label: 'Status Kritis',       value: String(countDanger), sub: 'prodi segera ditindak',          color: 'danger',  icon: '🚨' },
  ];

  const period   = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const greeting = user?.name ? `Halo, ${user.name.split(',')[0]}!` : 'Executive Dashboard';

  if (dataLoading) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <div className="page-wrapper">
            <div className={styles.skeletonGrid}>
              {[1,2,3,4].map(i => <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`} />)}
            </div>
            <div className={`${styles.skeleton} ${styles.skeletonBody}`} />
          </div>
        </main>
      </div>
    );
  }

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
              <h1 className="page-title">{greeting}</h1>
              <p className="page-subtitle">Rekap status mutu seluruh program studi — Periode {period}</p>
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
            {/* ── Status Kelengkapan Mutu — SVG Ring Card ── */}
            <div className={`card ${styles.chartCard}`}>
              <h2 className="card-title">Status Kelengkapan Mutu</h2>

              {/* Three SVG rings */}
              <div className={styles.ringsRow}>
                <RingCard
                  value={countAman}
                  total={totalProdi}
                  label="Aman"
                  color="#057A55"
                  trackColor="#DEF7EC"
                />
                <RingCard
                  value={countWarn}
                  total={totalProdi}
                  label="Perlu Perhatian"
                  color="#C27803"
                  trackColor="#FDF6B2"
                />
                <RingCard
                  value={countDanger}
                  total={totalProdi}
                  label="Kritis"
                  color="#C81E1E"
                  trackColor="#FDE8E8"
                />
              </div>

              {/* Stacked distribution bar */}
              <div className={styles.distSection}>
                <div className={styles.distLabel}>
                  <span>Distribusi {totalProdi} Program Studi</span>
                  <span className={styles.distAvg}>Rata-rata kelengkapan: <strong>{avgKelengkapan}%</strong></span>
                </div>
                <div className={styles.distBar} role="img" aria-label="Distribusi status program studi">
                  <div
                    className={styles.distSegment}
                    style={{ width: `${(countAman / totalProdi) * 100}%`, background: '#057A55' }}
                    title={`Aman: ${countAman} prodi`}
                  />
                  <div
                    className={styles.distSegment}
                    style={{ width: `${(countWarn / totalProdi) * 100}%`, background: '#C27803' }}
                    title={`Perlu Perhatian: ${countWarn} prodi`}
                  />
                  <div
                    className={styles.distSegment}
                    style={{ width: `${(countDanger / totalProdi) * 100}%`, background: '#C81E1E' }}
                    title={`Kritis: ${countDanger} prodi`}
                  />
                </div>
                <div className={styles.distLegend}>
                  <span><span className={styles.legendDot} style={{ background: '#057A55' }} />Aman</span>
                  <span><span className={styles.legendDot} style={{ background: '#C27803' }} />Perlu Perhatian</span>
                  <span><span className={styles.legendDot} style={{ background: '#C81E1E' }} />Kritis</span>
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

