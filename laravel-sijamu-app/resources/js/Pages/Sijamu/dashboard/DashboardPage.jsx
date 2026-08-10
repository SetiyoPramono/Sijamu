// Halaman Executive Dashboard — route: /dashboard
'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { ToastContainer, addToast } from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';
import { useEvaluation } from '@/context/EvaluationContext';

/* ── RingCard — SVG circular progress ring ──────────────────────────────── */
function RingCard({ value, total, label, color, trackColor }) {
  const SIZE       = 120;
  const STROKE     = 10;
  const R          = (SIZE - STROKE) / 2;
  const CIRC       = 2 * Math.PI * R;
  const pct        = total > 0 ? value / total : 0;
  const dashOffset = CIRC * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-2 py-4 px-3 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
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
      <div className="text-sm font-bold text-center leading-[1.3]" style={{ color }}>{label}</div>
      <div className="text-xs text-[var(--color-text-muted)] font-semibold bg-[var(--color-surface)] py-[2px] px-[10px] rounded-full border border-[var(--color-border)]">{Math.round(pct * 100)}%</div>
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
    { label: 'Total Prodi Diaudit', value: String(totalProdi),  sub: `dari ${totalProdi} prodi aktif`, color: 'primary', icon: '🏫', border: 'border-t-[var(--color-primary)]', textColor: 'text-[var(--color-primary)]' },
    { label: 'Status Aman',         value: String(countAman),   sub: 'prodi dokumen lengkap',          color: 'success', icon: '✅', border: 'border-t-[var(--color-success)]', textColor: 'text-[var(--color-success)]' },
    { label: 'Perlu Perhatian',     value: String(countWarn),   sub: 'prodi segera dilengkapi',        color: 'warning', icon: '⚠️', border: 'border-t-[var(--color-warning)]', textColor: 'text-[var(--color-warning)]' },
    { label: 'Status Kritis',       value: String(countDanger), sub: 'prodi segera ditindak',          color: 'danger',  icon: '🚨', border: 'border-t-[var(--color-danger)]', textColor: 'text-[var(--color-danger)]' },
  ];

  const period   = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const greeting = user?.name ? `Halo, ${user.name.split(',')[0]}!` : 'Executive Dashboard';

  if (dataLoading) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <div className="page-wrapper">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-[120px]" />)}
            </div>
            <div className="animate-pulse bg-gray-200 rounded-lg h-[340px] mt-6" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {statCards.map((s, i) => (
              <div key={i} className={`bg-white rounded-lg py-5 px-6 shadow-sm border border-[var(--color-border)] border-t-[4px] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md cursor-default ${s.border}`}>
                <div className="text-[28px] mb-3" aria-hidden="true">{s.icon}</div>
                <div className={`text-[42px] font-extrabold leading-none tracking-tight mb-2 ${s.textColor}`}>{s.value}</div>
                <div className="text-base font-bold text-[var(--color-text)] mb-1">{s.label}</div>
                <div className="text-sm text-[var(--color-text-muted)]">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
            {/* ── Status Kelengkapan Mutu — SVG Ring Card ── */}
            <div className={`card flex flex-col gap-0`}>
              <h2 className="card-title">Status Kelengkapan Mutu</h2>

              {/* Three SVG rings */}
              <div className="grid grid-cols-3 gap-3 pt-5 pb-4 border-b border-[var(--color-border)]">
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
              <div className="pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm font-semibold text-[var(--color-text-muted)]">
                  <span>Distribusi {totalProdi} Program Studi</span>
                  <span className="text-sm text-[var(--color-text-muted)]">Rata-rata kelengkapan: <strong className="text-[var(--color-primary)]">{avgKelengkapan}%</strong></span>
                </div>
                <div className="flex h-4 rounded-full overflow-hidden gap-[2px] bg-[var(--color-bg)] border border-[var(--color-border)] p-[2px]" role="img" aria-label="Distribusi status program studi">
                  <div
                    className="rounded-full transition-all duration-700 ease-in-out"
                    style={{ width: `${(countAman / totalProdi) * 100}%`, background: '#057A55' }}
                    title={`Aman: ${countAman} prodi`}
                  />
                  <div
                    className="rounded-full transition-all duration-700 ease-in-out"
                    style={{ width: `${(countWarn / totalProdi) * 100}%`, background: '#C27803' }}
                    title={`Perlu Perhatian: ${countWarn} prodi`}
                  />
                  <div
                    className="rounded-full transition-all duration-700 ease-in-out"
                    style={{ width: `${(countDanger / totalProdi) * 100}%`, background: '#C81E1E' }}
                    title={`Kritis: ${countDanger} prodi`}
                  />
                </div>
                <div className="flex gap-4 text-xs font-semibold text-[var(--color-text-muted)]">
                  <span><span className="inline-block w-2.5 h-2.5 rounded-full mr-[5px] align-middle" style={{ background: '#057A55' }} />Aman</span>
                  <span><span className="inline-block w-2.5 h-2.5 rounded-full mr-[5px] align-middle" style={{ background: '#C27803' }} />Perlu Perhatian</span>
                  <span><span className="inline-block w-2.5 h-2.5 rounded-full mr-[5px] align-middle" style={{ background: '#C81E1E' }} />Kritis</span>
                </div>
              </div>
            </div>

            {/* Progress by Prodi */}
            <div className="card">
              <h2 className="card-title">Kelengkapan per Program Studi</h2>
              <div className="flex flex-col gap-4">
                {trafficData.map((p, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[var(--color-text)]">{p.prodi}</span>
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
          <div className="card mt-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="card-title" style={{marginBottom:0}}>Traffic Light — Status Mutu Prodi</h2>
              <div className="flex gap-2">
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
                      className={
                        row.status === 'success' ? 'bg-[#057a55]/[0.03]' :
                        row.status === 'warning' ? 'bg-[#c27803]/[0.04]' :
                        'bg-[#c81e1e]/[0.04]'
                      }
                    >
                      <td>{i + 1}</td>
                      <td><strong>{row.prodi}</strong></td>
                      <td>
                        <span className={`badge badge-${row.status}`}>
                          {row.status === 'success' ? '✓' : row.status === 'warning' ? '⚠' : '✕'} {row.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-3 min-w-[150px]">
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

