// Halaman Ruang Evaluasi (Auditor Split-Screen) — route: /auditor
// CSS ada di: AuditorPage.module.css
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import HelpTooltip from '@/components/HelpTooltip';
import ConfirmModal from '@/components/ConfirmModal';
import { ToastContainer, addToast } from '@/components/Toast';
import { useRps } from '@/context/RpsContext';
import { usePeriod } from '@/context/PeriodContext';
import { useMutu } from '@/context/MutuContext';
import { useEvaluation } from '@/context/EvaluationContext';
import styles from './AuditorPage.module.css';

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
          <div className={styles.successScreen}>
            <div className={styles.successOrb}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 className={styles.successTitle}>Laporan Berhasil Dikirim!</h1>
            <p className={styles.successMsg}>
              Evaluasi untuk <strong>{selectedDocument?.course?.prodi ?? 'Prodi'}</strong> telah dikunci dan dikirim ke sistem.<br />
              Terima kasih atas kerja keras Anda sebagai Auditor.
            </p>
            <div className={styles.successActions}>
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
            <div className={styles.scoreSummary}>
              <div className={styles.scoreMain}>
                <div className={`${styles.scoreOrb} ${styles[`scoreOrb_${statusColor}`]}`}>
                  <span className={styles.scoreNum}>{totalScore}</span>
                  <span className={styles.scoreMax}>/{maxScore}</span>
                </div>
                <div>
                  <div className={styles.scorePct}>{pct}%</div>
                  <span className={`badge badge-${statusColor}`}>{statusLabel}</span>
                  <p className={styles.scoreNote}>Total skor akhir dari {indicators.length} indikator</p>
                </div>
              </div>
              <div className={styles.scoreProgress}>
                <div className="progress-bar-track" style={{height: 8}}>
                  <div className="progress-bar-fill" style={{width:`${pct}%`, background: `var(--color-${statusColor})`}} />
                </div>
              </div>
            </div>

            <div className={`card ${styles.reviewCard}`}>
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
                          <td><span className={styles.kodeChip}>{ind.kode}</span></td>
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

              <div className={styles.reviewActions}>
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
              <div className={styles.statsBadges}>
                <div className={styles.statBadge}>
                  <span className={styles.statNum}>{allDocuments.filter(d => d.isEvaluated).length}</span>
                  <span className={styles.statLabel}>Sudah Dinilai</span>
                </div>
                <div className={`${styles.statBadge} ${styles.statBadgePending}`}>
                  <span className={styles.statNum}>{allDocuments.filter(d => !d.isEvaluated).length}</span>
                  <span className={styles.statLabel}>Belum Dinilai</span>
                </div>
              </div>
            </div>

            {/* Search & filter bar */}
            <div className={styles.searchBar}>
              <div className={styles.searchField}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input 
                  type="text" 
                  className={styles.searchInput} 
                  placeholder="Cari nama dokumen, mata kuliah, atau kode..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label="Cari dokumen"
                />
              </div>
              <select className={styles.filterSelect} value={filterProdi} onChange={e => setFilterProdi(e.target.value)} aria-label="Filter program studi">
                <option value="">Semua Program Studi</option>
                {uniqueProdis.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select className={styles.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)} aria-label="Filter status">
                <option value="">Semua Status</option>
                <option value="pending">Belum Dinilai</option>
                <option value="done">Sudah Dinilai</option>
              </select>
            </div>

            {/* Document grid */}
            {filteredDocs.length > 0 ? (
              <div className={styles.docGrid}>
                {filteredDocs.map(doc => (
                  <div key={doc.id} className={`${styles.docCard} ${doc.isEvaluated ? styles.docCardDone : ''}`}>
                    <div className={styles.docCardHeader}>
                      <div className={`${styles.docTypeIcon} ${doc.type === 'RPS' ? styles.docTypeRps : styles.docTypeMutu}`}>
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

                    <div className={styles.docCardBody}>
                      <p className={styles.docCardType}>{doc.type} · {doc.course.code}</p>
                      <h3 className={styles.docCardName} title={doc.name}>{doc.name}</h3>
                      <p className={styles.docCardProdi}>{doc.course.prodi}</p>
                    </div>

                    <div className={styles.docCardFooter}>
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
              <div className={`card ${styles.emptyState}`}>
                <div className={styles.emptyStateIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <h3>Tidak ada dokumen ditemukan</h3>
                <p>Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
                <button className="btn btn-outline" onClick={() => { setSearchQuery(''); setFilterProdi(''); setFilterStatus(''); }}>
                  Reset Filter
                </button>
              </div>
            )}
          </div>

        ) : (
          /* ── Split-screen Evaluator ─────────────────── */
          <>
            {/* Top bar */}
            <div className={styles.topBar}>
              <div className={styles.topBarLeft}>
                <Breadcrumb items={[
                  { label: 'Beranda', href: '/dashboard' },
                  { label: 'Ruang Evaluasi', href: '/auditor', onClick: (e) => { e.preventDefault(); setSelectedDocument(null); } },
                  { label: selectedDocument.course.name },
                ]} />
                <h1 className={styles.topTitle}>
                  <span className={styles.topTitleDoc}>{selectedDocument.name}</span>
                </h1>
                <p className={styles.topSubtitle}>{selectedDocument.course.prodi} · {selectedDocument.course.code}</p>
              </div>
              <div className={styles.topBarRight}>
                <div className={styles.topProgress}>
                  <div className={styles.topProgressLabel}>
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
            <div className={styles.indTabs} role="tablist" aria-label="Navigasi indikator">
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
                    className={`${styles.indTab} ${isActive ? styles.indTabActive : ''} ${isDone && !isActive ? styles.indTabDone : ''}`}
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
            <div className={styles.splitScreen}>
              {/* Left: Document Viewer */}
              <div className={styles.docPanel} id={`panel-${current.id}`}>
                <div className={styles.docToolbar}>
                  <span className={styles.docTitle}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    {selectedDocument.name}
                  </span>
                  <div className={styles.zoomControls}>
                    <button
                      className={styles.zoomBtn}
                      onClick={() => setZoomLevel(z => Math.max(50, z - 25))}
                      aria-label="Perkecil tampilan"
                      disabled={zoomLevel <= 50}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>
                      </svg>
                    </button>
                    <span className={styles.zoomVal} aria-live="polite">{zoomLevel}%</span>
                    <button
                      className={styles.zoomBtn}
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
                <div className={styles.docViewer}>
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
              <div className={styles.assessPanel}>
                <div className={styles.assessScroll}>

                  {/* Indicator header */}
                  <div className={styles.assessHeader}>
                    <div className={styles.indicatorBadge}>{current.kode}</div>
                    <div>
                      <h2 className={styles.indicatorTitle}>
                        {current.nama}
                        <HelpTooltip title={`Bantuan: ${current.kode}`} content={current.help} />
                      </h2>
                      <p className={styles.indicatorSub}>Indikator {currentIdx + 1} dari {indicators.length}</p>
                    </div>
                  </div>

                  {/* Rubrik */}
                  <div className={styles.rubrikBox}>
                    <div className={styles.rubrikLabel}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      </svg>
                      Rubrik Penilaian
                    </div>
                    <p className={styles.rubrikText}>{current.rubrik}</p>
                  </div>

                  <div className={styles.formSection}>
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
                      <div className={styles.nilaiGrid}>
                        {nilaiOptions.map((opt) => (
                          <label
                            key={opt.val}
                            className={`${styles.nilaiCard} ${styles[`nilai_${opt.color}`]} ${currentVal.nilai === String(opt.val) ? styles.nilaiCardActive : ''}`}
                          >
                            <input
                              type="radio"
                              name={`nilai-${current.id}`}
                              value={String(opt.val)}
                              checked={currentVal.nilai === String(opt.val)}
                              onChange={e => updateValue('nilai', e.target.value)}
                              className={styles.nilaiInput}
                              aria-label={`Nilai ${opt.val} — ${opt.label}`}
                            />
                            <span className={styles.nilaiNum}>{opt.val}</span>
                            <span className={styles.nilaiLabel}>{opt.label}</span>
                            <span className={styles.nilaiSub}>{opt.sub}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 3. Catatan */}
                    <div className="form-group">
                      <label className="form-label" htmlFor={`catatan-${current.id}`}>
                        Catatan & Rekomendasi
                        <span className={styles.optionalTag}>Opsional</span>
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
                <div className={styles.assessFooter}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => { if (currentIdx > 0) setShowBackModal(true); }}
                    disabled={currentIdx === 0}
                    aria-label="Kembali ke indikator sebelumnya"
                  >
                    ← Sebelumnya
                  </button>
                  <div className={styles.footerRight}>
                    <span className={styles.footerHint}>
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
