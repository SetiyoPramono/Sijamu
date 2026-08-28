// Halaman Ruang Evaluasi (Auditor) — Refined & Modern UI
'use client';

import './AuditorPage.css';
import { useState, useMemo, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import ConfirmModal from '@/components/ConfirmModal';
import { ToastContainer, addToast } from '@/components/Toast';
import { useRps } from '@/context/RpsContext';
import { usePeriod } from '@/context/PeriodContext';
import { useMutu } from '@/context/MutuContext';
import { useEvaluation } from '@/context/EvaluationContext';
import { useUploadConfig } from '@/context/UploadConfigContext';

/* ── DEFAULT CRITERIA ──────────────────────────────────────────── */
const defaultCriteria = [
  { id: 'def-4', label: 'Melampaui',      bobot: 4,    colorKey: 'melampaui',     kriteria: 'Bukti menunjukkan pencapaian yang melebihi standar, target, atau praktik baik yang dipersyaratkan.' },
  { id: 'def-3', label: 'Sesuai',          bobot: 3,    colorKey: 'sesuai',        kriteria: 'Bukti tersedia dan menunjukkan bahwa indikator telah memenuhi standar yang ditetapkan.' },
  { id: 'def-2', label: 'Tidak Sesuai',    bobot: 1,    colorKey: 'tidak-sesuai',  kriteria: 'Bukti tersedia, namun belum memenuhi indikator, persyaratan, atau standar yang ditetapkan.' },
  { id: 'def-1', label: 'Tidak Tersedia',  bobot: 0,    colorKey: 'tidak-tersedia',kriteria: 'Bukti, dokumen, data, atau informasi yang dipersyaratkan tidak tersedia sehingga indikator tidak dapat diverifikasi.' },
  { id: 'def-5', label: 'N/A',             bobot: null, colorKey: 'na',            kriteria: 'Indikator tidak relevan atau tidak berlaku pada unit yang diaudit sehingga tidak diperhitungkan dalam evaluasi.' },
];

const temuanOptions = [
  'Tidak ada temuan — dokumen sesuai standar',
  'Dokumen tidak lengkap — ada lampiran yang kurang',
  'Format tidak sesuai template SPMI',
  'Konten perlu diperbarui sesuai kurikulum terbaru',
  'Tanda tangan / pengesahan pejabat belum lengkap',
  'Versi dokumen tidak cocok dengan periode audit aktif',
];

/* ── HELPERS ────────────────────────────────────────────────────── */
const scoreColor = p => p > 80 ? '#057A55' : p > 50 ? '#D97706' : '#DC2626';
const scoreLabel = p => p > 80 ? 'Lulus / Memenuhi Standar' : p > 50 ? 'Perlu Perbaikan' : 'Belum Memenuhi Standar';

function getCriteriaColorKey(label) {
  const l = label?.toLowerCase() || '';
  if (l.includes('melampaui')) return 'melampaui';
  if (l === 'sesuai') return 'sesuai';
  if (l.includes('tidak sesuai')) return 'tidak-sesuai';
  if (l.includes('tidak tersedia')) return 'tidak-tersedia';
  if (l === 'n/a') return 'na';
  return 'sesuai';
}

/* ── ICONS ──────────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#64748B] shrink-0">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckSvg = ({ size = 20, stroke = 2.5, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const DocSvg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const MutuSvg = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const ZoomInSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const ZoomOutSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const ArrowLeftSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const ExternalLinkSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const LockSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function AuditorPage() {
  const [zoomLevel, setZoomLevel]     = useState(100);
  const [viewerWidth, setViewerWidth] = useState(55);
  const [mobileView, setMobileView]   = useState('form'); // 'form' | 'doc'
  const [evalData, setEvalData]       = useState({ criteriaId: '', catatan: '', temuan: '', bobot: null, colorKey: '' });
  const [showSubmit, setShowSubmit]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [loading, setLoading]         = useState(false);

  const { courses }                          = useRps();
  const { activePeriod }                     = usePeriod();
  const { mutuDocs }                         = useMutu();
  const { evaluateDocument, docEvaluations } = useEvaluation();
  const { docList, categoryList }            = useUploadConfig();

  const [selectedDoc, setSelectedDoc]   = useState(null);
  const [search, setSearch]             = useState('');
  const [filterProdi, setFilterProdi]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType]     = useState('');

  /* ── Aggregate All Documents ────────────────────────────────── */
  const allDocs = useMemo(() => {
    const d = [];
    courses.forEach(c => c.rpsFiles.forEach(f => {
      const id = f.id || `rps-${c.id}-${f.name}`;
      d.push({
        id,
        name: f.name,
        url: f.url,
        course: { code: c.code, name: c.name, prodi: c.prodi, category: 'RPS Perkuliahan' },
        isEvaluated: !!docEvaluations?.[id],
        evaluation: docEvaluations?.[id] || null,
        type: 'RPS',
        criteria: null,
      });
    }));
    mutuDocs?.forEach(m => {
      const id = `mutu-${m.id}`;
      const indicator = docList?.find(ind => String(ind.id) === String(m.indicatorId));
      const code = indicator ? indicator.kode : `C${m.indicatorId}`;
      const name = indicator ? indicator.nama : 'Dokumen Mutu Prodi';
      const category = indicator ? categoryList?.find(c => String(c.id) === String(indicator.document_category_id)) : null;
      const catName = category ? category.name : 'Dokumen Mutu';
      d.push({
        id,
        name: m.file.name,
        url: m.file.url,
        course: { code, name, prodi: m.prodi, category: catName },
        isEvaluated: !!docEvaluations?.[id],
        evaluation: docEvaluations?.[id] || null,
        type: 'MUTU',
        criteria: indicator?.criteria?.length > 0 ? indicator.criteria : null,
      });
    });
    return d;
  }, [courses, mutuDocs, docEvaluations, docList, categoryList]);

  /* ── Filtered Documents ─────────────────────────────────────── */
  const filtered = allDocs.filter(doc => {
    const q = search.toLowerCase();
    const matchesSearch = doc.name.toLowerCase().includes(q)
      || doc.course.name.toLowerCase().includes(q)
      || doc.course.code.toLowerCase().includes(q)
      || doc.course.prodi.toLowerCase().includes(q);

    const matchesProdi  = !filterProdi  || doc.course.prodi === filterProdi;
    const matchesType   = !filterType   || doc.type === filterType;
    const matchesStatus = filterStatus === 'done' ? doc.isEvaluated : filterStatus === 'pending' ? !doc.isEvaluated : true;

    return matchesSearch && matchesProdi && matchesType && matchesStatus;
  });

  const prodis      = [...new Set([...courses.map(c => c.prodi), ...(mutuDocs || []).map(d => d.prodi)])].filter(Boolean);
  const doneCount   = allDocs.filter(d => d.isEvaluated).length;
  const pendingCount= allDocs.length - doneCount;
  const progressPct = allDocs.length > 0 ? Math.round((doneCount / allDocs.length) * 100) : 0;

  /* ── Criteria for Active Document ───────────────────────────── */
  const activeCriteria = useMemo(() => {
    const raw = selectedDoc?.criteria || defaultCriteria;
    return raw
      .filter(c => c.label?.toLowerCase() !== 'belum dinilai')
      .map(c => ({ ...c, colorKey: c.colorKey || getCriteriaColorKey(c.label) }));
  }, [selectedDoc]);

  const isFormValid = !!evalData.criteriaId;

  const resetForm = useCallback(() => {
    setEvalData({ criteriaId: '', catatan: '', temuan: '', bobot: null, colorKey: '' });
    setMobileView('form');
    setZoomLevel(100);
  }, []);

  const openEvaluator = (doc) => {
    setSelectedDoc(doc);
    if (doc.evaluation) {
      setEvalData({
        criteriaId: '',
        catatan: doc.evaluation.catatan || '',
        temuan: doc.evaluation.temuan || '',
        bobot: doc.evaluation.score ?? null,
        colorKey: '',
      });
    } else {
      resetForm();
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      addToast('Harap pilih kriteria penilaian terlebih dahulu.', 'warning');
      return;
    }
    setShowSubmit(false);
    setLoading(true);

    const total = evalData.bobot !== null ? evalData.bobot : 0;
    const max = Math.max(...activeCriteria.map(c => c.bobot !== null ? c.bobot : 0), 4);

    await evaluateDocument(selectedDoc.id, selectedDoc.course.prodi, total, max, evalData.catatan, evalData.temuan, 'Auditor');
    setLoading(false);
    setSubmitted(true);
    addToast('Penilaian dokumen berhasil disimpan & dikunci! 🎉', 'success');
  };

  /* ═══════════════════════════════════════════════════════════════
     SUCCESS SCREEN (PENILAIAN SELESAI)
  ═══════════════════════════════════════════════════════════════ */
  if (submitted) {
    const total = evalData.bobot !== null ? evalData.bobot : 0;
    const max   = Math.max(...activeCriteria.map(c => c.bobot !== null ? c.bobot : 0), 4);
    const pct   = max > 0 ? Math.round((total / max) * 100) : 0;
    const col   = scoreColor(pct);
    const selectedCritLabel = activeCriteria.find(c => c.id === evalData.criteriaId)?.label || '-';

    return (
      <div className="app-shell">
        <Sidebar />
        <main className="main-content flex items-center justify-center p-6 bg-[var(--color-bg)]">
          <div className="card max-w-[540px] w-full p-8 text-center flex flex-col items-center gap-6 shadow-xl animate-[scaleIn_0.25s_ease]">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${col}, #2563EB)` }}
            >
              <CheckSvg size={44} stroke={3} color="white" />
            </div>

            <div>
              <h1 className="text-2xl font-black text-[#0F172A]">
                Penilaian Berhasil Dikunci! 🎉
              </h1>
              <p className="text-sm text-[#475569] mt-2 leading-relaxed">
                Dokumen <strong className="text-[#0F172A]">{selectedDoc?.name}</strong> telah dievaluasi dengan kriteria{' '}
                <strong className="font-bold" style={{ color: col }}>{selectedCritLabel}</strong>.
              </p>
            </div>

            <div className="w-full bg-[#F8FAFC] border border-[var(--color-border)] rounded-xl p-5 text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Hasil Evaluasi</span>
                <span className="badge font-bold px-3 py-1 text-xs" style={{ background: `${col}18`, color: col }}>
                  {scoreLabel(pct)}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-black text-[#0F172A]">{evalData.bobot !== null ? evalData.bobot : 'N/A'}</span>
                <span className="text-sm font-semibold text-[#64748B]">/ Bobot Standar: {max}</span>
              </div>
              {evalData.temuan && (
                <div className="mt-3 pt-3 border-t border-[#E2E8F0] text-xs text-[#334155]">
                  <strong className="text-[#0F172A]">Temuan SPMI:</strong> {evalData.temuan}
                </div>
              )}
              {evalData.catatan && (
                <div className="mt-2 text-xs text-[#334155]">
                  <strong className="text-[#0F172A]">Catatan Auditor:</strong> {evalData.catatan}
                </div>
              )}
            </div>

            <div className="flex gap-3 w-full flex-wrap">
              <button
                className="btn btn-outline flex-1 min-w-[150px] font-bold"
                onClick={() => {
                  setSubmitted(false);
                  setSelectedDoc(null);
                  resetForm();
                }}
              >
                ← Nilai Dokumen Lain
              </button>
              <Link href="/dashboard" className="flex-1 min-w-[150px]">
                <button className="btn btn-primary w-full font-bold">
                  Ke Dashboard
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     MAIN PAGE
  ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="app-shell">
      <Sidebar />
      <ToastContainer />

      <ConfirmModal
        isOpen={showSubmit}
        title="Kunci & Simpan Penilaian?"
        message="Setelah dikunci, hasil audit untuk dokumen ini akan tersimpan ke dalam database evaluasi."
        confirmLabel="Ya, Kunci Penilaian"
        cancelLabel="Batal"
        onConfirm={handleSubmit}
        onCancel={() => setShowSubmit(false)}
        type="warning"
      />

      <main className="main-content">
        {!selectedDoc ? (
          /* ══════════════════════════════════════════════════════
              VIEW 1: DAFTAR DOKUMEN (LIST / GRID)
          ══════════════════════════════════════════════════════ */
          <div className="page-wrapper">
            <Breadcrumb
              items={[
                { label: 'Beranda', href: '/dashboard' },
                { label: 'Ruang Evaluasi' },
              ]}
            />

            {/* Page Header */}
            <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: '1 1 300px' }}>
                <h1 className="page-title text-[#0F172A]">Ruang Evaluasi Dokumen</h1>
                <p className="page-subtitle text-[#475569]">
                  Evaluasi dan verifikasi dokumen mutu prodi serta RPS mata kuliah aktif.
                </p>
                {activePeriod?.name && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold bg-[#EBF2FF] text-[#1A56DB] border border-[#BFDBFE]">
                    <span>📅 Periode:</span>
                    <span>{activePeriod.name}{activePeriod.semester ? ` · ${activePeriod.semester}` : ''}</span>
                  </div>
                )}
              </div>

              {/* Progress Summary Card in Header */}
              <div className="aud-header-prog-card" style={{ flex: '0 0 auto', marginRight: '16px' }}>
                <div>
                  <div className="text-xs text-[#64748B] font-bold uppercase tracking-wider">Progres Audit</div>
                  <div className="text-xl font-black text-[#0F172A]">
                    {doneCount} <span className="text-xs font-semibold text-[#64748B]">/ {allDocs.length} Dokumen</span>
                  </div>
                </div>
                <div>
                  <div className="aud-prog-bar-bg">
                    <div className="aud-prog-bar-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                  <div className="text-xs font-extrabold text-right text-[#1A56DB] mt-1">
                    {progressPct}% Selesai
                  </div>
                </div>
              </div>
            </div>

            {/* Stat Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Dokumen', value: allDocs.length, icon: '📄', color: '#1A56DB', bg: '#EBF2FF' },
                { label: 'Sudah Dinilai', value: doneCount, icon: '✅', color: '#057A55', bg: '#DEF7EC' },
                { label: 'Belum Dinilai', value: pendingCount, icon: '⏳', color: '#C27803', bg: '#FDF6B2' },
                { label: 'Penyelesaian', value: `${progressPct}%`, icon: '📊', color: '#7E3AF2', bg: '#F6F5FF' },
              ].map((s, i) => (
                <div key={i} className="card aud-stat-card !p-4 flex items-center gap-3.5">
                  <div className="aud-stat-icon-wrap" style={{ background: s.bg, color: s.color }}>
                    {s.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[#0F172A] leading-none">{s.value}</div>
                    <div className="text-xs text-[#475569] font-bold mt-1">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Search & Filter Toolbar Card */}
            <div className="card !p-4 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Search Bar */}
                <div className="aud-search-box">
                  <SearchIcon />
                  <input
                    type="text"
                    placeholder="Cari nama dokumen, kode standar, prodi..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    aria-label="Cari dokumen"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                      aria-label="Hapus pencarian"
                    >
                      <XIcon />
                    </button>
                  )}
                </div>

                {/* Filter Prodi */}
                <select
                  className="form-select aud-filter-select"
                  value={filterProdi}
                  onChange={e => setFilterProdi(e.target.value)}
                  aria-label="Filter prodi"
                >
                  <option value="">Semua Prodi ({prodis.length})</option>
                  {prodis.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                {/* Filter Tipe */}
                <select
                  className="form-select aud-filter-select"
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  aria-label="Filter tipe dokumen"
                >
                  <option value="">Semua Tipe Dokumen</option>
                  <option value="MUTU">📋 Dokumen Mutu</option>
                  <option value="RPS">📄 Dokumen RPS</option>
                </select>

                {/* Filter Status */}
                <select
                  className="form-select aud-filter-select"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  aria-label="Filter status penilaian"
                >
                  <option value="">Semua Status Penilaian</option>
                  <option value="pending">⏳ Belum Dinilai</option>
                  <option value="done">✅ Sudah Dinilai</option>
                </select>
              </div>

              {/* Active Filter Notice */}
              {(search || filterProdi || filterStatus || filterType) && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)] text-xs text-[#475569]">
                  <span>
                    Menampilkan <strong className="text-[#0F172A]">{filtered.length}</strong> dari {allDocs.length} total dokumen
                  </span>
                  <button
                    onClick={() => {
                      setSearch('');
                      setFilterProdi('');
                      setFilterStatus('');
                      setFilterType('');
                    }}
                    className="text-[#1A56DB] font-extrabold hover:underline cursor-pointer bg-transparent border-none p-0 text-xs"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {/* Document Listing */}
            {filtered.length > 0 ? (
              <>
                {/* Desktop: Modern Grid Cards */}
                <div className="aud-grid">
                  {filtered.map(doc => {
                    const isEvaluated = doc.isEvaluated;
                    return (
                      <div
                        key={doc.id}
                        className="aud-card"
                        onClick={() => openEvaluator(doc)}
                      >
                        {/* Header badges */}
                        <div className="aud-card-header">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="badge text-[11px] font-extrabold"
                              style={{
                                background: doc.type === 'RPS' ? '#EBF2FF' : '#FEF3C7',
                                color: doc.type === 'RPS' ? '#1A56DB' : '#B45309',
                              }}
                            >
                              {doc.type === 'RPS' ? '📄 RPS' : '📋 MUTU'}
                            </span>
                            {doc.course.category && doc.type === 'MUTU' && (
                              <span className="badge text-[10.5px] font-bold bg-[#F5F3FF] text-[#7C3AED] max-w-[120px] truncate" title={doc.course.category}>
                                {doc.course.category}
                              </span>
                            )}
                          </div>

                          <span
                            className="badge text-[11px] font-extrabold"
                            style={{
                              background: isEvaluated ? '#DEF7EC' : '#FEF3C7',
                              color: isEvaluated ? '#03543F' : '#92400E',
                            }}
                          >
                            {isEvaluated ? '✓ Selesai Dinilai' : '○ Belum Dinilai'}
                          </span>
                        </div>

                        {/* Body Details */}
                        <div className="aud-card-body">
                          <h3 className="aud-doc-title" title={doc.name}>
                            {doc.name}
                          </h3>

                          <div className="aud-doc-code-pill">
                            <span>🏷️</span>
                            <span className="font-extrabold text-[#0F172A]">{doc.course.code}</span>
                            <span className="opacity-40">·</span>
                            <span className="font-semibold text-[#475569] truncate max-w-[180px]">{doc.course.name}</span>
                          </div>

                          <div className="aud-doc-prodi-tag">
                            <span>🏛️</span>
                            <span className="font-bold text-[#334155] truncate">{doc.course.prodi}</span>
                          </div>
                        </div>

                        {/* Footer Action Button */}
                        <div className="aud-card-footer">
                          <button
                            className={isEvaluated ? 'btn btn-sm btn-outline w-full font-bold' : 'btn btn-sm btn-primary w-full font-bold'}
                            onClick={e => {
                              e.stopPropagation();
                              openEvaluator(doc);
                            }}
                          >
                            {isEvaluated ? '🔄 Nilai Ulang' : '📝 Mulai Penilaian'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile: Clean List Rows */}
                <div className="aud-list-view">
                  {filtered.map(doc => (
                    <div
                      key={doc.id}
                      className="aud-list-item"
                      onClick={() => openEvaluator(doc)}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold"
                        style={{
                          background: doc.type === 'RPS' ? '#EBF2FF' : '#FEF3C7',
                          color: doc.type === 'RPS' ? '#1A56DB' : '#B45309',
                        }}
                      >
                        {doc.type === 'RPS' ? <DocSvg /> : <MutuSvg />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-[#0F172A] truncate">{doc.name}</div>
                        <div className="text-xs text-[#475569] mt-0.5 font-medium truncate">
                          {doc.course.prodi} · <span className="font-bold text-[#0F172A]">{doc.course.code}</span>
                        </div>
                      </div>

                      <span
                        className="badge text-[11px] shrink-0 font-extrabold"
                        style={{
                          background: doc.isEvaluated ? '#DEF7EC' : '#FEF3C7',
                          color: doc.isEvaluated ? '#03543F' : '#92400E',
                        }}
                      >
                        {doc.isEvaluated ? '✓ Selesai' : '○ Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="card !p-12 text-center flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center text-3xl">
                  🔍
                </div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">
                  Tidak Ada Dokumen Ditemukan
                </h3>
                <p className="text-sm text-[#475569] max-w-[380px] leading-relaxed">
                  Coba ubah kata kunci pencarian atau sesuaikan pilihan filter program studi dan tipe dokumen.
                </p>
                <button
                  className="btn btn-sm btn-ghost mt-2 font-bold"
                  onClick={() => {
                    setSearch('');
                    setFilterProdi('');
                    setFilterStatus('');
                    setFilterType('');
                  }}
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════
              VIEW 2: FOCUS MODE / SPLIT EVALUATOR
          ══════════════════════════════════════════════════════ */
          <div className="aud-eval-shell">
            {/* Top Navigation Header */}
            <div className="aud-eval-header">
              <button
                className="btn btn-sm btn-ghost gap-2 shrink-0 font-bold text-[#334155]"
                onClick={() => {
                  setSelectedDoc(null);
                  resetForm();
                }}
              >
                <ArrowLeftSvg />
                <span>Kembali ke Daftar</span>
              </button>

              <div className="aud-eval-header-info">
                <span className="aud-eval-header-title text-[#0F172A]" title={selectedDoc.name}>
                  {selectedDoc.name}
                </span>
                <span className="aud-eval-header-sub text-[#475569]">
                  <span className="font-semibold text-[#0F172A]">🏛️ {selectedDoc.course.prodi}</span>
                  <span>·</span>
                  <span>🏷️ <strong className="text-[#0F172A]">{selectedDoc.course.code}</strong> — {selectedDoc.course.name}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {selectedDoc.url && (
                  <a
                    href={selectedDoc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline gap-1.5 hidden sm:inline-flex font-bold"
                    title="Buka dokumen di tab baru"
                  >
                    <ExternalLinkSvg />
                    <span>Buka Tab Baru</span>
                  </a>
                )}
                <span
                  className="badge font-extrabold text-xs"
                  style={{
                    background: selectedDoc.type === 'RPS' ? '#EBF2FF' : '#FEF3C7',
                    color: selectedDoc.type === 'RPS' ? '#1A56DB' : '#B45309',
                  }}
                >
                  {selectedDoc.type === 'RPS' ? '📄 RPS' : '📋 MUTU'}
                </span>
              </div>
            </div>

            {/* Mobile Tab Toggle */}
            <div className="flex lg:hidden bg-white border-b border-[var(--color-border)]">
              <button
                className={`flex-1 py-3 text-xs font-extrabold border-b-2 ${
                  mobileView === 'form'
                    ? 'border-[#1A56DB] text-[#1A56DB]'
                    : 'border-transparent text-[#64748B]'
                }`}
                onClick={() => setMobileView('form')}
              >
                ✏️ Form Penilaian
              </button>
              <button
                className={`flex-1 py-3 text-xs font-extrabold border-b-2 ${
                  mobileView === 'doc'
                    ? 'border-[#1A56DB] text-[#1A56DB]'
                    : 'border-transparent text-[#64748B]'
                }`}
                onClick={() => setMobileView('doc')}
              >
                📄 Preview Dokumen
              </button>
            </div>

            {/* Main Evaluator Body (Split on Desktop) */}
            <div className="aud-eval-body">
              {/* LEFT PANE: PDF / Document Viewer */}
              <div
                className="aud-viewer-panel"
                style={{ width: `${viewerWidth}%` }}
              >
                {/* Viewer Toolbar */}
                <div className="aud-viewer-toolbar">
                  <span className="text-xs font-bold text-[#334155] truncate max-w-[260px]" title={selectedDoc.name}>
                    📄 {selectedDoc.name}
                  </span>

                  <div className="flex items-center gap-3">
                    {/* Zoom controls */}
                    <div className="aud-zoom-controls">
                      <button
                        className="aud-zoom-btn"
                        onClick={() => setZoomLevel(z => Math.max(50, z - 20))}
                        disabled={zoomLevel <= 50}
                        aria-label="Perkecil zoom"
                      >
                        <ZoomOutSvg />
                      </button>
                      <span className="text-xs font-extrabold px-1.5 min-w-[42px] text-center text-[#0F172A]">
                        {zoomLevel}%
                      </span>
                      <button
                        className="aud-zoom-btn"
                        onClick={() => setZoomLevel(z => Math.min(200, z + 20))}
                        disabled={zoomLevel >= 200}
                        aria-label="Perbesar zoom"
                      >
                        <ZoomInSvg />
                      </button>
                      <button
                        className="aud-zoom-btn text-xs font-bold px-1.5"
                        onClick={() => setZoomLevel(100)}
                        title="Reset Zoom ke 100%"
                      >
                        ↺
                      </button>
                    </div>

                    {/* Width presets */}
                    <div className="aud-width-controls flex gap-1">
                      {[45, 55, 65].map(w => (
                        <button
                          key={w}
                          className={`aud-width-pill ${viewerWidth === w ? 'active' : ''}`}
                          onClick={() => setViewerWidth(w)}
                        >
                          {w}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* PDF Container */}
                <div className="aud-iframe-container">
                  {selectedDoc.url ? (
                    <iframe
                      src={selectedDoc.url}
                      title={`Preview Dokumen: ${selectedDoc.name}`}
                      style={{
                        width: `${100 / (zoomLevel / 100)}%`,
                        height: `${100 / (zoomLevel / 100)}%`,
                        transform: `scale(${zoomLevel / 100})`,
                        transformOrigin: 'top left',
                        transition: 'transform 0.15s ease',
                        border: 'none',
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-[#64748B]">
                      <DocSvg />
                      <p className="text-sm font-bold mt-2">File dokumen belum diunggah atau tidak dapat ditampilkan.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Fullscreen Viewer */}
              {mobileView === 'doc' && (
                <div className="flex lg:hidden flex-col flex-1 bg-white overflow-hidden">
                  <div className="p-2.5 border-b border-[var(--color-border)] text-xs text-[#334155] font-bold truncate">
                    📄 {selectedDoc.name}
                  </div>
                  <div className="flex-1 bg-[#CBD5E1] overflow-hidden">
                    {selectedDoc.url ? (
                      <iframe
                        src={selectedDoc.url}
                        title={`Preview: ${selectedDoc.name}`}
                        className="w-full h-full border-none"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-[#64748B]">
                        Tidak ada file untuk ditampilkan
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* RIGHT PANE: Grading & Evaluation Form */}
              {(mobileView === 'form' || typeof window === 'undefined') && (
                <div className="aud-form-panel">
                  <div className="aud-form-scroll-area">
                    {/* Document Meta Header Card */}
                    <div className="aud-doc-meta-card">
                      <div
                        className="aud-doc-meta-icon font-bold"
                        style={{
                          background: selectedDoc.type === 'RPS' ? '#EBF2FF' : '#FEF3C7',
                          color: selectedDoc.type === 'RPS' ? '#1A56DB' : '#B45309',
                        }}
                      >
                        {selectedDoc.type === 'RPS' ? <DocSvg /> : <MutuSvg />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="badge text-[11px] font-extrabold bg-[#EBF2FF] text-[#1A56DB] mb-1">
                          {selectedDoc.course.code}
                        </span>
                        <h2 className="text-base font-extrabold text-[#0F172A] leading-snug">
                          {selectedDoc.course.name}
                        </h2>
                        <div className="text-xs text-[#475569] mt-1.5 flex items-center gap-2 flex-wrap font-medium">
                          <span className="font-bold text-[#0F172A]">🏛️ {selectedDoc.course.prodi}</span>
                          {selectedDoc.course.category && (
                            <>
                              <span>·</span>
                              <span className="font-extrabold text-[#7C3AED]">🗂️ {selectedDoc.course.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Criteria Selection Section */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-black uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                          <span>Kriteria Penilaian Auditor</span>
                          <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <span className="text-xs font-semibold text-[#64748B]">Pilih 1 kriteria penilaian</span>
                      </div>

                      <div className="aud-crit-group">
                        {activeCriteria.map(crit => {
                          const isSelected = evalData.criteriaId === crit.id;
                          return (
                            <div
                              key={crit.id}
                              className={`aud-crit-option crit-${crit.colorKey} ${isSelected ? 'selected' : ''}`}
                              onClick={() =>
                                setEvalData(prev => ({
                                  ...prev,
                                  criteriaId: crit.id,
                                  bobot: crit.bobot,
                                  colorKey: crit.colorKey,
                                }))
                              }
                              role="radio"
                              aria-checked={isSelected}
                              tabIndex={0}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  setEvalData(prev => ({
                                    ...prev,
                                    criteriaId: crit.id,
                                    bobot: crit.bobot,
                                    colorKey: crit.colorKey,
                                  }));
                                }
                              }}
                            >
                              <div className="aud-crit-radio">
                                <div className="aud-crit-radio-inner" />
                              </div>

                              <div className="aud-crit-content">
                                <div className="aud-crit-title-row justify-between">
                                  <span className="aud-crit-title">{crit.label}</span>
                                  <span className="badge text-[11px] font-black bg-white border border-[#CBD5E1] text-[#0F172A]">
                                    Bobot: {crit.bobot !== null ? crit.bobot : '-'}
                                  </span>
                                </div>
                                <p className="aud-crit-desc">{crit.kriteria}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Standard Finding Selector */}
                    <div className="form-group mb-5">
                      <label htmlFor="aud-temuan-select" className="form-label text-xs font-black uppercase tracking-wider text-[#334155]">
                        Temuan Standar SPMI
                      </label>
                      <select
                        id="aud-temuan-select"
                        className="form-select text-sm font-medium"
                        value={evalData.temuan}
                        onChange={e => setEvalData(prev => ({ ...prev, temuan: e.target.value }))}
                      >
                        <option value="">— Pilih temuan standar (opsional) —</option>
                        {temuanOptions.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Notes & Recommendations */}
                    <div className="form-group mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="aud-catatan-textarea" className="form-label text-xs font-black uppercase tracking-wider text-[#334155]">
                          Catatan &amp; Rekomendasi Auditor
                        </label>
                        <span className="badge text-[10px] font-bold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                          Opsional
                        </span>
                      </div>
                      <textarea
                        id="aud-catatan-textarea"
                        className="form-textarea text-sm font-normal text-[#0F172A]"
                        rows={4}
                        placeholder="Tuliskan catatan observasi, detail ketidaksesuaian, atau saran perbaikan..."
                        value={evalData.catatan}
                        onChange={e => setEvalData(prev => ({ ...prev, catatan: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Sticky Bottom Action Bar */}
                  <div className="aud-action-bar">
                    <div className="text-xs">
                      {isFormValid ? (
                        <div className="flex items-center gap-1.5 text-[#057A55] font-extrabold">
                          <CheckSvg size={18} stroke={3} />
                          <span>Kriteria dipilih: Bobot {evalData.bobot !== null ? evalData.bobot : '-'}</span>
                        </div>
                      ) : (
                        <span className="text-[#64748B] font-semibold">
                          ⚠️ Pilih salah satu kriteria penilaian di atas
                        </span>
                      )}
                    </div>

                    <button
                      className="btn btn-success gap-2 px-6 font-bold"
                      disabled={loading || !isFormValid}
                      onClick={() => setShowSubmit(true)}
                    >
                      {loading ? (
                        <span>Menyimpan...</span>
                      ) : (
                        <>
                          <LockSvg />
                          <span>Kunci Penilaian</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
