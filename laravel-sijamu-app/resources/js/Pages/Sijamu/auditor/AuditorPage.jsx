// Halaman Ruang Evaluasi (Auditor Split-Screen) — route: /auditor
// CSS ada di: AuditorPage.module.css
'use client';

import { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import HelpTooltip from '@/components/HelpTooltip';
import ConfirmModal from '@/components/ConfirmModal';
import { ToastContainer, addToast } from '@/components/Toast';
import { useRps } from '@/context/RpsContext';
import { usePeriod } from '@/context/PeriodContext';
import { useMutu } from '@/context/MutuContext';
import { useEvaluation } from '@/context/EvaluationContext';

const indicators = [
  {
    id: 1,
    kode: 'C1.1',
    nama: 'Visi, Misi, Tujuan, dan Strategi',
    rubrik: 'Dokumen ini harus memuat: (1) Visi yang jelas dan terukur, (2) Misi yang operasional, (3) Tujuan yang SMART, (4) Strategi pencapaian yang realistis.',
    help: 'VMTS harus mencerminkan keunggulan prodi dan dapat diukur pencapaiannya. Pastikan ada bukti sosialisasi kepada civitas akademika.',
  },
  {
    id: 2,
    kode: 'C1.2',
    nama: 'Tata Pamong dan Tata Kelola',
    rubrik: 'Penilaian mencakup: (1) Struktur organisasi yang jelas, (2) Tupoksi terdokumentasi, (3) Mekanisme pengambilan keputusan, (4) Sistem penjaminan mutu internal.',
    help: 'Tata pamong yang baik ditandai dengan adanya SOP yang tersosialisasi dan dilaksanakan secara konsisten. Periksa notulen rapat dan SK pengangkatan.',
  },
  {
    id: 3,
    kode: 'C2.1',
    nama: 'Profil Dosen',
    rubrik: 'Penilaian meliputi: (1) Kualifikasi pendidikan (min. S2), (2) Jabatan akademik, (3) Rasio dosen:mahasiswa (1:30), (4) Kesesuaian keahlian dengan bidang ajar.',
    help: 'Periksa SK Dosen Tetap dan CV masing-masing dosen. Rasio dosen:mahasiswa dihitung dari PDDIKTI semester terakhir.',
  },
  {
    id: 4,
    kode: 'C3.1',
    nama: 'Kurikulum',
    rubrik: 'Penilaian mencakup: (1) Kesesuaian dengan KKNI/OBE, (2) Proses perancangan kurikulum (stakeholder involvement), (3) Pemutakhiran berkala (maks. 4 tahun sekali).',
    help: 'Kurikulum harus mengacu pada Permendikbud No. 3 Tahun 2020. Periksa dokumen peninjauan kurikulum dan berita acara rapat.',
  },
  {
    id: 5,
    kode: 'C4.1',
    nama: 'Penelitian Dosen',
    rubrik: 'Penilaian mencakup: (1) Jumlah penelitian per tahun (min. 1/dosen/tahun), (2) Sumber pendanaan, (3) Relevansi topik, (4) Luaran (publikasi/HKI).',
    help: 'Data penelitian dapat diverifikasi melalui SINTA, Google Scholar, dan sistem pelaporan internal. Luaran yang diperhitungkan minimal di jurnal nasional terakreditasi.',
  },
];

const temuanOptions = [
  'Tidak ada temuan — dokumen sesuai standar',
  'Dokumen tidak lengkap — ada lampiran yang kurang',
  'Dokumen tidak sesuai — konten tidak relevan dengan indikator',
  'Dokumen kadaluarsa — belum diperbarui dalam 2 tahun terakhir',
  'Dokumen ada namun belum disahkan pimpinan',
  'Data tidak konsisten antar dokumen',
  'Tidak ada dokumen pendukung sama sekali',
];

const nilaiOptions = [
  { val: 4, label: 'Sangat Baik', sub: '> 85%', color: 'green' },
  { val: 3, label: 'Baik', sub: '70% – 85%', color: 'blue' },
  { val: 2, label: 'Cukup', sub: '55% – 70%', color: 'yellow' },
  { val: 1, label: 'Kurang', sub: '< 55%', color: 'red' },
];

export default function AuditorPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [values, setValues] = useState(
    indicators.reduce((acc, ind) => ({
      ...acc,
      [ind.id]: { temuan: '', nilai: '', catatan: '' },
    }), {})
  );
  const [showReview, setShowReview] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { courses } = useRps();
  const { activePeriod } = usePeriod();
  const { mutuDocs } = useMutu();
  const { updateEvaluation, evaluateDocument, docEvaluations } = useEvaluation();
  
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProdi, setFilterProdi] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const allDocuments = useMemo(() => {
    const docs = [];
    courses.forEach(course => {
      course.rpsFiles.forEach(file => {
        docs.push({
          id: file.id || `rps-${course.id}-${file.name}`,
          name: file.name,
          url: file.url,
          course: { code: course.code, name: course.name, prodi: course.prodi },
          isEvaluated: !!docEvaluations?.[file.id || `rps-${course.id}-${file.name}`],
          type: 'RPS'
        });
      });
    });
    mutuDocs?.forEach(doc => {
      const docId = `mutu-${doc.id}`;
      docs.push({
        id: docId,
        name: doc.file.name,
        url: doc.file.url,
        course: { code: `C${doc.indicatorId}`, name: 'Dokumen Mutu Prodi', prodi: doc.prodi },
        isEvaluated: !!docEvaluations?.[docId],
        type: 'MUTU'
      });
    });
    return docs;
  }, [courses, mutuDocs, docEvaluations]);

  const filteredDocs = allDocuments.filter(doc => {
    const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        doc.course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        doc.course.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchProdi = filterProdi ? doc.course.prodi === filterProdi : true;
    const matchStatus = filterStatus === 'done' ? doc.isEvaluated : 
                        filterStatus === 'pending' ? !doc.isEvaluated : true;
    return matchSearch && matchProdi && matchStatus;
  });

  const uniqueProdis = [...new Set([
    ...courses.map(c => c.prodi),
    ...(mutuDocs || []).map(d => d.prodi)
  ])].filter(Boolean);

  const current = indicators[currentIdx];
  const currentVal = values[current.id];
  const isLastIndicator = currentIdx === indicators.length - 1;
  const filledCount = Object.values(values).filter(v => v.nilai).length;

  const updateValue = (field, val) => {
    setValues(prev => ({
      ...prev,
      [current.id]: { ...prev[current.id], [field]: val }
    }));
  };

  const handleSaveNext = () => {
    if (!currentVal.nilai) {
      addToast('Harap pilih nilai sebelum melanjutkan.', 'warning');
      return;
    }
    addToast(`Indikator ${current.kode} berhasil disimpan.`, 'success');
    if (isLastIndicator) {
      setShowReview(true);
    } else {
      setCurrentIdx(i => i + 1);
    }
  };

  const handleFinalSubmit = async () => {
    setShowSubmitModal(false);
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    
    const totalScore = Object.values(values).reduce((sum, v) => sum + (Number(v.nilai) || 0), 0);
    const maxScore = indicators.length * 4; 
    
    const combinedCatatan = indicators
      .map(ind => values[ind.id]?.catatan ? `[${ind.kode}] ${values[ind.id].catatan}` : null)
      .filter(Boolean)
      .join('\n');
      
    const combinedTemuan = indicators
      .map(ind => values[ind.id]?.temuan ? `[${ind.kode}] ${values[ind.id].temuan}` : null)
      .filter(Boolean)
      .join('\n');

    await evaluateDocument(
      selectedDocument.id,
      selectedDocument.course.prodi,
      totalScore,
      maxScore,
      combinedCatatan,
      combinedTemuan,
      'Auditor Anda'
    );
    
    setLoading(false);
    setSubmitted(true);
    addToast('Laporan evaluasi berhasil dikunci dan dikirim!', 'success');
  };

  /* ── Success screen ─────────────────────────────────── */
  if (submitted) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-8 gap-5">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-success)] to-[#10b981] flex items-center justify-center shadow-[0_12px_36px_rgba(5,150,105,0.35)] animate-[popIn_0.4s_ease-out]">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-[var(--color-text)]">Laporan Berhasil Dikirim!</h1>
            <p className="text-lg text-[var(--color-text-muted)] leading-[1.7] max-w-[480px]">
              Evaluasi untuk <strong>{selectedDocument?.course?.prodi ?? 'Prodi'}</strong> telah dikunci dan dikirim ke sistem.<br />
              Terima kasih atas kerja keras Anda sebagai Auditor.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <button className="btn btn-outline" onClick={() => { setSubmitted(false); setSelectedDocument(null); setCurrentIdx(0); setValues(indicators.reduce((acc, ind) => ({ ...acc, [ind.id]: { temuan: '', nilai: '', catatan: '' } }), {})); }}>
                Nilai Dokumen Lain
              </button>
              <Link href="/dashboard" className="btn btn-primary btn-lg">
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ── Review screen ──────────────────────────────────── */
  if (showReview) {
    const totalScore = Object.values(values).reduce((sum, v) => sum + (Number(v.nilai) || 0), 0);
    const maxScore = indicators.length * 4;
    const pct = Math.round((totalScore / maxScore) * 100);
    const statusColor = pct > 80 ? 'success' : pct > 50 ? 'warning' : 'danger';
    const statusLabel = pct > 80 ? 'Lulus' : pct > 50 ? 'Perlu Perhatian' : 'Kritis';

    return (
      <div className="app-shell">
        <Sidebar />
        <ToastContainer />
        <ConfirmModal
          isOpen={showSubmitModal}
          title="Kunci & Kirim Laporan?"
          message="Setelah dikirim, penilaian Anda tidak dapat diubah lagi. Pastikan semua nilai sudah benar sebelum melanjutkan."
          confirmLabel="Ya, Kunci & Kirim"
          cancelLabel="Periksa Lagi"
          onConfirm={handleFinalSubmit}
          onCancel={() => setShowSubmitModal(false)}
          type="warning"
        />
        <main className="main-content">
          <div className="page-wrapper">
            <Breadcrumb items={[
              { label: 'Beranda', href: '/dashboard' },
              { label: 'Ruang Evaluasi', href: '/auditor' },
              { label: 'Review Penilaian' },
            ]} />

            <div className="page-header">
              <div>
                <h1 className="page-title">📋 Review Penilaian</h1>
                <p className="page-subtitle">{selectedDocument?.course?.prodi} · Periksa kembali sebelum mengunci laporan</p>
              </div>
            </div>

            {/* Score summary card */}
            <div className="bg-white border-[1.5px] border-[var(--color-border)] rounded-xl p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-6 mb-4">
                <div 
                  className="w-24 h-24 rounded-full flex items-baseline justify-center gap-0.5 shrink-0 border-4"
                  style={{ backgroundColor: `var(--color-${statusColor}-light)`, borderColor: `var(--color-${statusColor})` }}
                >
                  <span className="text-3xl font-black text-[var(--color-text)]">{totalScore}</span>
                  <span className="text-base font-semibold text-[var(--color-text-muted)]">/{maxScore}</span>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[var(--color-text)] mb-1">{pct}%</div>
                  <span className={`badge badge-${statusColor}`}>{statusLabel}</span>
                  <p className="text-sm text-[var(--color-text-muted)] mt-2">Total skor akhir dari {indicators.length} indikator</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="progress-bar-track" style={{height: 8}}>
                  <div className="progress-bar-fill" style={{width:`${pct}%`, background: `var(--color-${statusColor})`}} />
                </div>
              </div>
            </div>

            <div className={`card`}>
              <h2 className="card-title" style={{marginBottom: 'var(--space-4)'}}>Rekap Seluruh Indikator</h2>
              <div className="table-wrapper">
                <table className="data-table" aria-label="Rekap penilaian auditor">
                  <thead>
                    <tr>
                      <th>Kode</th>
                      <th>Nama Indikator</th>
                      <th>Temuan</th>
                      <th style={{width: 100}}>Nilai</th>
                      <th>Catatan</th>
                      <th style={{width: 80}}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicators.map((ind, i) => {
                      const v = values[ind.id];
                      return (
                        <tr key={ind.id}>
                          <td><span className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-md px-2.5 py-1 font-bold text-xs tracking-wider">{ind.kode}</span></td>
                          <td style={{fontWeight: 600}}>{ind.nama}</td>
                          <td style={{maxWidth: 200, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)'}}>
                            {v.temuan || <span className="text-muted">—</span>}
                          </td>
                          <td>
                            {v.nilai ? (
                              <span className={`badge badge-${Number(v.nilai) >= 3 ? 'success' : Number(v.nilai) === 2 ? 'warning' : 'danger'}`}>
                                Nilai {v.nilai}
                              </span>
                            ) : (
                              <span className="badge badge-danger">Belum</span>
                            )}
                          </td>
                          <td style={{maxWidth: 160, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)'}}>
                            {v.catatan || <span className="text-muted">—</span>}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-ghost"
                              onClick={() => { setCurrentIdx(i); setShowReview(false); }}
                              aria-label={`Edit penilaian ${ind.kode}`}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-[var(--color-border)]">
                <button className="btn btn-ghost" onClick={() => setShowReview(false)}>
                  ← Kembali Edit
                </button>
                <button
                  className="btn btn-success btn-lg"
                  onClick={() => setShowSubmitModal(true)}
                  disabled={loading}
                  aria-label="Kunci dan kirim laporan evaluasi"
                >
                  {loading ? (
                    <><span className="spinner spinner-sm" /> Mengirim...</>
                  ) : (
                    <>🔒 Kunci & Kirim Laporan</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ── Main page ──────────────────────────────────────── */
  return (
    <div className="app-shell">
      <Sidebar />
      <ToastContainer />
      <ConfirmModal
        isOpen={showBackModal}
        title="Kembali ke Halaman Sebelumnya?"
        message="Progress yang belum disimpan pada indikator ini akan hilang. Apakah Anda yakin ingin kembali?"
        confirmLabel="Ya, Kembali"
        cancelLabel="Tetap di Sini"
        onConfirm={() => { setShowBackModal(false); if (currentIdx > 0) setCurrentIdx(i => i - 1); }}
        onCancel={() => setShowBackModal(false)}
      />

      <main className="main-content">
        {!selectedDocument ? (
          /* ── Document list ───────────────────────────── */
          <div className="page-wrapper">
            <Breadcrumb items={[
              { label: 'Beranda', href: '/dashboard' },
              { label: 'Ruang Evaluasi' },
            ]} />

            <div className="page-header flex items-center justify-between">
              <div>
                <h1 className="page-title">Ruang Evaluasi Dokumen</h1>
                <p className="page-subtitle">
                  Periode: <strong>{activePeriod.name} {activePeriod.semester}</strong> — Pilih dokumen yang ingin dinilai
                </p>
              </div>
              <div className="hidden sm:flex gap-3">
                <div className="flex flex-col items-center bg-[var(--color-success-light)] border border-[rgba(5,150,105,0.2)] rounded-lg py-3 px-5 min-w-[80px]">
                  <span className="text-2xl font-extrabold text-[var(--color-text)] leading-none">{allDocuments.filter(d => d.isEvaluated).length}</span>
                  <span className="text-xs text-[var(--color-text-muted)] font-semibold mt-1 whitespace-nowrap">Sudah Dinilai</span>
                </div>
                <div className="flex flex-col items-center bg-[var(--color-warning-light)] border border-[rgba(217,119,6,0.2)] rounded-lg py-3 px-5 min-w-[80px]">
                  <span className="text-2xl font-extrabold text-[var(--color-text)] leading-none">{allDocuments.filter(d => !d.isEvaluated).length}</span>
                  <span className="text-xs text-[var(--color-text-muted)] font-semibold mt-1 whitespace-nowrap">Belum Dinilai</span>
                </div>
              </div>
            </div>

            {/* Search & filter bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-wrap">
              <div className="flex-1 min-w-[220px] flex items-center gap-3 bg-white border-[1.5px] border-[var(--color-border)] rounded-lg px-4 text-[var(--color-text-muted)] transition-all focus-within:border-[var(--color-primary)] focus-within:shadow-[0_0_0_3px_var(--color-primary-light)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input 
                  type="text" 
                  className="flex-1 border-none outline-none bg-transparent py-3 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]" 
                  placeholder="Cari nama dokumen, mata kuliah, atau kode..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label="Cari dokumen"
                />
              </div>
              <select className="h-12 px-4 border-[1.5px] border-[var(--color-border)] rounded-lg bg-white text-[var(--color-text)] text-sm font-medium cursor-pointer min-w-full sm:min-w-[170px] transition-colors focus:outline-none focus:border-[var(--color-primary)]" value={filterProdi} onChange={e => setFilterProdi(e.target.value)} aria-label="Filter program studi">
                <option value="">Semua Program Studi</option>
                {uniqueProdis.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select className="h-12 px-4 border-[1.5px] border-[var(--color-border)] rounded-lg bg-white text-[var(--color-text)] text-sm font-medium cursor-pointer min-w-full sm:min-w-[170px] transition-colors focus:outline-none focus:border-[var(--color-primary)]" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} aria-label="Filter status">
                <option value="">Semua Status</option>
                <option value="pending">Belum Dinilai</option>
                <option value="done">Sudah Dinilai</option>
              </select>
            </div>

            {/* Document grid */}
            {filteredDocs.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {filteredDocs.map(doc => (
                  <div key={doc.id} className={`bg-white border-[1.5px] border-[var(--color-border)] rounded-xl overflow-hidden flex flex-col transition-all shadow-sm hover:border-[var(--color-primary)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.12)] hover:-translate-y-0.5 ${doc.isEvaluated ? '!border-[rgba(5,150,105,0.3)] bg-gradient-to-br from-white to-[#f0fdf4] hover:!border-[var(--color-success)] hover:!shadow-[0_8px_24px_rgba(5,150,105,0.12)]' : ''}`}>
                    <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                      <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${doc.type === 'RPS' ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'bg-[var(--color-warning-light)] text-[var(--color-warning)]'}`}>
                        {doc.type === 'RPS' ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                          </svg>
                        )}
                      </div>
                      <span className={`badge ${doc.isEvaluated ? 'badge-success' : 'badge-warning'}`}>
                        {doc.isEvaluated ? '✓ Dinilai' : '⏳ Pending'}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col gap-1">
                      <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider m-0">{doc.type} · {doc.course.code}</p>
                      <h3 className="text-base font-bold text-[var(--color-text)] m-0 leading-[1.4] overflow-hidden line-clamp-2" title={doc.name}>{doc.name}</h3>
                      <p className="text-sm text-[var(--color-text-muted)] m-0 mt-1">{doc.course.prodi}</p>
                    </div>

                    <div className="py-3 px-4 bg-[var(--color-bg)] border-t border-[var(--color-border)]">
                      <button
                        className={`btn btn-sm ${doc.isEvaluated ? 'btn-outline' : 'btn-primary'} w-full`}
                        onClick={() => { setSelectedDocument(doc); setCurrentIdx(0); setValues(indicators.reduce((acc, ind) => ({ ...acc, [ind.id]: { temuan: '', nilai: '', catatan: '' } }), {})); }}
                        aria-label={`${doc.isEvaluated ? 'Nilai ulang' : 'Nilai'} dokumen ${doc.name}`}
                      >
                        {doc.isEvaluated ? 'Nilai Ulang' : 'Nilai Dokumen →'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`card flex flex-col items-center justify-center text-center py-16 px-8 gap-4 text-[var(--color-text-muted)]`}>
                <div className="w-20 h-20 bg-[var(--color-bg)] rounded-full flex items-center justify-center text-[var(--color-border)]">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text)] m-0">Tidak ada dokumen ditemukan</h3>
                <p>Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
                <button className="btn btn-outline mt-2" onClick={() => { setSearchQuery(''); setFilterProdi(''); setFilterStatus(''); }}>
                  Reset Filter
                </button>
              </div>
            )}
          </div>

        ) : (
          /* ── Split-screen Evaluator ─────────────────── */
          <>
            {/* Top bar */}
            <div className="flex items-start justify-between py-4 px-6 bg-white border-b border-[var(--color-border)] flex-wrap gap-4 shadow-[0_1px_0_var(--color-border)]">
              <div className="flex flex-col gap-1">
                <Breadcrumb items={[
                  { label: 'Beranda', href: '/dashboard' },
                  { label: 'Ruang Evaluasi', href: '/auditor', onClick: (e) => { e.preventDefault(); setSelectedDocument(null); } },
                  { label: selectedDocument.course.name },
                ]} />
                <h1 className="text-xl font-bold text-[var(--color-text)] m-0 mt-1">
                  <span className="text-[var(--color-primary)]">{selectedDocument.name}</span>
                </h1>
                <p className="text-sm text-[var(--color-text-muted)] m-0">{selectedDocument.course.prodi} · {selectedDocument.course.code}</p>
              </div>
              <div className="flex items-end flex-col gap-2 pt-3">
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                    <span><strong>{filledCount}</strong> / {indicators.length}</span>
                    <span>Indikator Dinilai</span>
                  </div>
                  <div className="progress-bar-track" style={{width: 180}}>
                    <div className="progress-bar-fill" style={{width:`${(filledCount/indicators.length)*100}%`}} />
                  </div>
                </div>
              </div>
            </div>

            {/* Indicator tabs */}
            <div className="flex gap-2 py-3 px-6 bg-white border-b border-[var(--color-border)] overflow-x-auto flex-nowrap scrollbar-hide" role="tablist" aria-label="Navigasi indikator">
              {indicators.map((ind, i) => {
                const v = values[ind.id];
                const isDone = !!v.nilai;
                const isActive = i === currentIdx;
                return (
                  <button
                    key={ind.id}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${ind.id}`}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border-2 border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] cursor-pointer transition-all whitespace-nowrap shrink-0 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] ${isActive ? '!border-[var(--color-primary)] !bg-[var(--color-primary)] !text-white' : ''} ${isDone && !isActive ? '!border-[var(--color-success)] !bg-[var(--color-success-light)] !text-[var(--color-success)]' : ''}`}
                    onClick={() => setCurrentIdx(i)}
                  >
                    {isDone && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {ind.kode}
                  </button>
                );
              })}
            </div>

            {/* Split-screen */}
            <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-170px)] overflow-hidden">
              {/* Left: Document Viewer */}
              <div className="w-full lg:w-[58%] h-[50vh] lg:h-auto shrink-0 border-r-0 lg:border-r-2 border-[var(--color-border)] flex flex-col bg-[#f3f4f8]" id={`panel-${current.id}`}>
                <div className="flex items-center justify-between py-3 px-4 bg-white border-b border-[var(--color-border)] gap-3 shrink-0">
                  <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-muted)] overflow-hidden text-ellipsis whitespace-nowrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    {selectedDocument.name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-1">
                    <button
                      className="w-8 h-8 rounded-md border-none bg-transparent flex items-center justify-center cursor-pointer text-[var(--color-text-muted)] transition-all hover:not(:disabled):bg-[var(--color-primary-light)] hover:not(:disabled):text-[var(--color-primary)] disabled:opacity-35 disabled:cursor-not-allowed"
                      onClick={() => setZoomLevel(z => Math.max(50, z - 25))}
                      aria-label="Perkecil tampilan"
                      disabled={zoomLevel <= 50}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>
                      </svg>
                    </button>
                    <span className="text-sm font-bold text-[var(--color-text)] min-w-[38px] text-center" aria-live="polite">{zoomLevel}%</span>
                    <button
                      className="w-8 h-8 rounded-md border-none bg-transparent flex items-center justify-center cursor-pointer text-[var(--color-text-muted)] transition-all hover:not(:disabled):bg-[var(--color-primary-light)] hover:not(:disabled):text-[var(--color-primary)] disabled:opacity-35 disabled:cursor-not-allowed"
                      onClick={() => setZoomLevel(z => Math.min(200, z + 25))}
                      aria-label="Perbesar tampilan"
                      disabled={zoomLevel >= 200}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <iframe
                    src={selectedDocument.url}
                    title="Preview PDF"
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      transform: `scale(${zoomLevel/100})`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.2s ease',
                      backgroundColor: '#fff'
                    }}
                  />
                </div>
              </div>

              {/* Right: Assessment Form */}
              <div className="flex-1 flex flex-col h-auto lg:h-auto overflow-hidden bg-white">
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">

                  {/* Indicator header */}
                  <div className="flex items-start gap-4 mb-5 pb-5 border-b border-[var(--color-border)]">
                    <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--sidebar-bg)] text-white px-3.5 py-2 rounded-lg font-extrabold text-base shrink-0 tracking-wider shadow-[0_4px_12px_rgba(59,130,246,0.3)]">{current.kode}</div>
                    <div>
                      <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2 flex-wrap m-0 mb-1">
                        {current.nama}
                        <HelpTooltip title={`Bantuan: ${current.kode}`} content={current.help} />
                      </h2>
                      <p className="text-sm text-[var(--color-text-muted)] m-0">Indikator {currentIdx + 1} dari {indicators.length}</p>
                    </div>
                  </div>

                  {/* Rubrik */}
                  <div className="bg-[var(--color-primary-light)] border border-[rgba(59,130,246,0.2)] border-l-4 border-l-[var(--color-primary)] rounded-lg p-4 mb-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)] mb-2 uppercase tracking-wider">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                      Rubrik Penilaian
                    </div>
                    <p className="text-sm text-[var(--color-text)] leading-[1.75] m-0">{current.rubrik}</p>
                  </div>

                  <div className="flex flex-col gap-5">
                    {/* 1. Temuan */}
                    <div className="form-group">
                      <label className="form-label" htmlFor={`temuan-${current.id}`}>
                        Temuan Standar
                        <HelpTooltip title="Temuan Standar" content="Pilih temuan yang paling mendekati kondisi dokumen. Temuan ini akan muncul di laporan resmi." />
                      </label>
                      <select
                        id={`temuan-${current.id}`}
                        className="form-select"
                        value={currentVal.temuan}
                        onChange={e => updateValue('temuan', e.target.value)}
                      >
                        <option value="">— Pilih temuan —</option>
                        {temuanOptions.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Nilai */}
                    <div className="form-group">
                      <label className="form-label">
                        Nilai Indikator <span style={{color:'var(--color-danger)'}}>*</span>
                        <HelpTooltip title="Skala Penilaian" content="Nilai diberikan dalam skala 1–4. Nilai 4 (Sangat Baik) artinya dokumen sangat lengkap dan sesuai standar. Nilai 1 (Kurang) artinya dokumen tidak memenuhi syarat." />
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {nilaiOptions.map((opt) => (
                          <label
                            key={opt.val}
                            className={`flex flex-col items-center gap-1 py-4 px-3 border-2 border-[var(--color-border)] rounded-lg cursor-pointer transition-all text-center relative hover:-translate-y-px hover:shadow-md ${opt.color === 'green' ? 'hover:border-[var(--color-success)] hover:bg-[var(--color-success-light)]' : opt.color === 'blue' ? 'hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]' : opt.color === 'yellow' ? 'hover:border-[var(--color-warning)] hover:bg-[var(--color-warning-light)]' : 'hover:border-[var(--color-danger)] hover:bg-[var(--color-danger-light)]'} ${currentVal.nilai === String(opt.val) ? (opt.color === 'green' ? '!border-[var(--color-success)] !bg-[var(--color-success-light)] shadow-[0_0_0_3px_rgba(5,150,105,0.15)]' : opt.color === 'blue' ? '!border-[var(--color-primary)] !bg-[var(--color-primary-light)] shadow-[0_0_0_3px_rgba(59,130,246,0.15)]' : opt.color === 'yellow' ? '!border-[var(--color-warning)] !bg-[var(--color-warning-light)] shadow-[0_0_0_3px_rgba(217,119,6,0.15)]' : '!border-[var(--color-danger)] !bg-[var(--color-danger-light)] shadow-[0_0_0_3px_rgba(220,38,38,0.15)]') : ''}`}
                          >
                            <input
                              type="radio"
                              name={`nilai-${current.id}`}
                              value={String(opt.val)}
                              checked={currentVal.nilai === String(opt.val)}
                              onChange={e => updateValue('nilai', e.target.value)}
                              className="absolute opacity-0 w-0 h-0"
                              aria-label={`Nilai ${opt.val} — ${opt.label}`}
                            />
                            <span className={`text-[28px] font-black leading-none ${opt.color === 'green' ? 'text-[var(--color-success)]' : opt.color === 'blue' ? 'text-[var(--color-primary)]' : opt.color === 'yellow' ? 'text-[var(--color-warning)]' : 'text-[var(--color-danger)]'}`}>{opt.val}</span>
                            <span className="text-sm font-bold text-[var(--color-text)] leading-tight">{opt.label}</span>
                            <span className="text-xs text-[var(--color-text-muted)] leading-none">{opt.sub}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 3. Catatan */}
                    <div className="form-group">
                      <label className="form-label" htmlFor={`catatan-${current.id}`}>
                        Catatan & Rekomendasi
                        <span className="text-xs font-semibold text-[var(--color-text-muted)] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full px-2 py-0.5 ml-2">Opsional</span>
                      </label>
                      <textarea
                        id={`catatan-${current.id}`}
                        className="form-textarea"
                        placeholder="Tuliskan catatan tambahan atau rekomendasi perbaikan yang spesifik untuk prodi..."
                        value={currentVal.catatan}
                        onChange={e => updateValue('catatan', e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom action */}
                <div className="flex items-center justify-between py-4 px-6 bg-white border-t-2 border-[var(--color-border)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] shrink-0">
                  <button
                    className="btn btn-ghost"
                    onClick={() => { if (currentIdx > 0) setShowBackModal(true); }}
                    disabled={currentIdx === 0}
                    aria-label="Kembali ke indikator sebelumnya"
                  >
                    ← Sebelumnya
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[var(--color-text-muted)]">
                      {currentIdx + 1}/{indicators.length}
                    </span>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleSaveNext}
                      aria-label={isLastIndicator ? 'Simpan dan lihat review' : 'Simpan dan lanjut'}
                    >
                      {isLastIndicator ? '📋 Lihat Review' : 'Simpan & Lanjut →'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
