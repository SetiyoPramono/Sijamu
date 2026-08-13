// Halaman Ruang Evaluasi (Auditor) v3 — "Clean Workspace" Design
// route: /auditor
'use client';

import './AuditorPage.css';
import { useState, useMemo, useCallback } from 'react';
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

/* ── DATA ──────────────────────────────────────────────────────── */
const indicators = [
  { id: 1, kode: 'C1.1', icon: '🎯', nama: 'Visi, Misi, Tujuan, dan Strategi',
    rubrik: 'Dokumen harus memuat: (1) Visi yang jelas dan terukur, (2) Misi yang operasional, (3) Tujuan SMART, (4) Strategi pencapaian yang realistis.',
    help: 'VMTS harus mencerminkan keunggulan prodi. Pastikan ada bukti sosialisasi kepada civitas akademika.' },
  { id: 2, kode: 'C1.2', icon: '🏛️', nama: 'Tata Pamong dan Tata Kelola',
    rubrik: 'Penilaian mencakup: (1) Struktur organisasi, (2) Tupoksi terdokumentasi, (3) Mekanisme pengambilan keputusan, (4) Sistem penjaminan mutu internal.',
    help: 'Tata pamong yang baik ditandai dengan SOP yang tersosialisasi dan dilaksanakan secara konsisten.' },
  { id: 3, kode: 'C2.1', icon: '👨‍🏫', nama: 'Profil Dosen',
    rubrik: 'Penilaian meliputi: (1) Kualifikasi pendidikan (min. S2), (2) Jabatan akademik, (3) Rasio dosen:mahasiswa, (4) Kesesuaian keahlian dengan bidang ajar.',
    help: 'Periksa SK Dosen Tetap dan CV. Rasio dihitung dari PDDIKTI semester terakhir.' },
  { id: 4, kode: 'C3.1', icon: '📚', nama: 'Kurikulum',
    rubrik: 'Penilaian mencakup: (1) Kesesuaian dengan KKNI/OBE, (2) Proses perancangan kurikulum, (3) Pemutakhiran berkala (maks. 4 tahun).',
    help: 'Kurikulum harus mengacu pada Permendikbud No. 3 Tahun 2020.' },
  { id: 5, kode: 'C4.1', icon: '🔬', nama: 'Penelitian Dosen',
    rubrik: 'Penilaian mencakup: (1) Jumlah penelitian per tahun, (2) Sumber pendanaan, (3) Relevansi topik, (4) Luaran (publikasi/HKI).',
    help: 'Data penelitian diverifikasi via SINTA, Google Scholar, dan laporan internal.' },
];

const temuanOptions = [
  'Tidak ada temuan — dokumen sesuai standar',
  'Dokumen tidak lengkap — ada lampiran yang kurang',
  'Dokumen tidak sesuai — konten tidak relevan dengan indikator',
  'Dokumen kadaluarsa — belum diperbarui dalam 2 tahun',
  'Dokumen ada namun belum disahkan pimpinan',
  'Data tidak konsisten antar dokumen',
  'Tidak ada dokumen pendukung sama sekali',
];

const nilaiOptions = [
  { val: 4, label: 'Sangat Baik', sub: '> 85%',  bg: '#ECFDF5', border: '#10B981', text: '#065F46', ring: 'rgba(16,185,129,0.15)' },
  { val: 3, label: 'Baik',        sub: '70–85%',  bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF', ring: 'rgba(59,130,246,0.15)' },
  { val: 2, label: 'Cukup',       sub: '55–70%',  bg: '#FFFBEB', border: '#F59E0B', text: '#92400E', ring: 'rgba(245,158,11,0.15)' },
  { val: 1, label: 'Kurang',      sub: '< 55%',   bg: '#FEF2F2', border: '#EF4444', text: '#991B1B', ring: 'rgba(239,68,68,0.15)' },
];

/* ── HELPERS ────────────────────────────────────────────────────── */
const scoreColor = p => p > 80 ? '#10B981' : p > 50 ? '#F59E0B' : '#EF4444';
const scoreLabel = p => p > 80 ? 'Lulus' : p > 50 ? 'Perlu Perhatian' : 'Kritis';

/* ── SVG ICONS ──────────────────────────────────────────────────── */
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const XIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const CheckSvg = ({ size = 11, stroke = 3.5, color = 'currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>;
const DocSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const MutuSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const ZoomIn = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;
const ZoomOut = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;

/* ── PROGRESS RING ──────────────────────────────────────────────── */
function ProgressRing({ pct, size = 48, stroke = 5 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const c = pct === 100 ? '#10B981' : pct >= 60 ? '#1A56DB' : '#F59E0B';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }} role="img" aria-label={`Progress ${pct}%`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function AuditorPage() {
  const [currentIdx, setCurrentIdx]       = useState(0);
  const [zoomLevel, setZoomLevel]         = useState(100);
  const [viewerWidth, setViewerWidth]     = useState(55);
  const [mobileView, setMobileView]       = useState('form');
  const [values, setValues]               = useState(() =>
    indicators.reduce((a, i) => ({ ...a, [i.id]: { temuan: '', nilai: '', catatan: '' } }), {})
  );
  const [showReview, setShowReview]       = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [showSubmit, setShowSubmit]       = useState(false);
  const [submitted, setSubmitted]         = useState(false);
  const [loading, setLoading]             = useState(false);

  const { courses }                       = useRps();
  const { activePeriod }                  = usePeriod();
  const { mutuDocs }                      = useMutu();
  const { evaluateDocument, docEvaluations } = useEvaluation();

  const [selectedDoc, setSelectedDoc]     = useState(null);
  const [search, setSearch]               = useState('');
  const [filterProdi, setFilterProdi]     = useState('');
  const [filterStatus, setFilterStatus]   = useState('');

  /* docs */
  const allDocs = useMemo(() => {
    const d = [];
    courses.forEach(c => c.rpsFiles.forEach(f => {
      const id = f.id || `rps-${c.id}-${f.name}`;
      d.push({ id, name: f.name, url: f.url, course: { code: c.code, name: c.name, prodi: c.prodi }, isEvaluated: !!docEvaluations?.[id], type: 'RPS' });
    }));
    mutuDocs?.forEach(m => {
      const id = `mutu-${m.id}`;
      d.push({ id, name: m.file.name, url: m.file.url, course: { code: `C${m.indicatorId}`, name: 'Dokumen Mutu Prodi', prodi: m.prodi }, isEvaluated: !!docEvaluations?.[id], type: 'MUTU' });
    });
    return d;
  }, [courses, mutuDocs, docEvaluations]);

  const filtered = allDocs.filter(doc => {
    const q = search.toLowerCase();
    return (doc.name.toLowerCase().includes(q) || doc.course.name.toLowerCase().includes(q) || doc.course.code.toLowerCase().includes(q))
      && (!filterProdi || doc.course.prodi === filterProdi)
      && (filterStatus === 'done' ? doc.isEvaluated : filterStatus === 'pending' ? !doc.isEvaluated : true);
  });

  const prodis   = [...new Set([...courses.map(c => c.prodi), ...(mutuDocs||[]).map(d => d.prodi)])].filter(Boolean);
  const doneCount = allDocs.filter(d => d.isEvaluated).length;

  /* eval state */
  const cur         = indicators[currentIdx];
  const curVal      = values[cur.id];
  const isLast      = currentIdx === indicators.length - 1;
  const filledCount = Object.values(values).filter(v => v.nilai).length;
  const pctDone     = Math.round((filledCount / indicators.length) * 100);

  const updateVal = useCallback((f, v) => {
    setValues(prev => ({ ...prev, [cur.id]: { ...prev[cur.id], [f]: v } }));
  }, [cur.id]);

  const resetForm = useCallback(() => {
    setValues(indicators.reduce((a, i) => ({ ...a, [i.id]: { temuan: '', nilai: '', catatan: '' } }), {}));
    setCurrentIdx(0); setShowReview(false); setMobileView('form'); setZoomLevel(100);
  }, []);

  const handleSaveNext = () => {
    if (!curVal.nilai) { addToast('Harap pilih nilai terlebih dahulu.', 'warning'); return; }
    addToast(`Indikator ${cur.kode} tersimpan ✓`, 'success');
    if (isLast) setShowReview(true); else setCurrentIdx(i => i + 1);
  };

  const handleSubmit = async () => {
    setShowSubmit(false); setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const total = Object.values(values).reduce((s, v) => s + (Number(v.nilai)||0), 0);
    const max   = indicators.length * 4;
    const catatan = indicators.map(i => values[i.id]?.catatan ? `[${i.kode}] ${values[i.id].catatan}` : null).filter(Boolean).join('\n');
    const temuan  = indicators.map(i => values[i.id]?.temuan  ? `[${i.kode}] ${values[i.id].temuan}`  : null).filter(Boolean).join('\n');
    await evaluateDocument(selectedDoc.id, selectedDoc.course.prodi, total, max, catatan, temuan, 'Auditor');
    setLoading(false); setSubmitted(true);
    addToast('Laporan berhasil dikunci dan dikirim! 🎉', 'success');
  };

  /* ═══════════════════════════════════════════════════════════════
     SUCCESS
  ═══════════════════════════════════════════════════════════════ */
  if (submitted) {
    const total = Object.values(values).reduce((s, v) => s + (Number(v.nilai)||0), 0);
    const max   = indicators.length * 4;
    const pct   = Math.round((total / max) * 100);
    const col   = scoreColor(pct);
    return (
      <div className="aud-shell">
        <Sidebar />
        <main className="aud-main aud-success-wrap">
          <div className="aud-anim-slide" style={{ maxWidth: 540, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
            <div className="aud-anim-pop" style={{ width: 120, height: 120, borderRadius: '50%', background: `linear-gradient(135deg, ${col}, ${col}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 20px 60px ${col}44` }}>
              <CheckSvg size={58} stroke={2.5} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>Laporan Berhasil Dikirim! 🎉</h1>
              <p style={{ color: '#64748B', lineHeight: 1.7, fontSize: 14, margin: 0 }}>
                Evaluasi untuk <strong style={{ color: '#0F172A' }}>{selectedDoc?.course?.prodi}</strong> telah dikunci.<br />Terima kasih atas kontribusi Anda.
              </p>
            </div>
            <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #E5E7EB', padding: 24, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
                <div className="aud-score-ring" style={{ background: `${col}14`, border: `4px solid ${col}` }}>
                  <span className="aud-score-ring-val" style={{ color: col }}>{total}</span>
                  <span className="aud-score-ring-max">/{max}</span>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 34, fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{pct}%</div>
                  <span style={{ marginTop: 6, display: 'inline-block', padding: '3px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: `${col}18`, color: col }}>{scoreLabel(pct)}</span>
                </div>
              </div>
              <div style={{ height: 7, background: '#F1F5F9', borderRadius: 99 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 99, transition: 'width 1s ease' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${indicators.length}, 1fr)`, gap: 8, marginTop: 16 }}>
                {indicators.map(ind => {
                  const n = Number(values[ind.id]?.nilai);
                  const c = n >= 4 ? '#10B981' : n === 3 ? '#3B82F6' : n === 2 ? '#F59E0B' : '#EF4444';
                  return (
                    <div key={ind.id} style={{ textAlign: 'center', padding: '8px 4px', background: '#F8FAFC', borderRadius: 10, border: `1.5px solid ${c}30` }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: c }}>{values[ind.id]?.nilai || '—'}</div>
                      <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{ind.kode}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, width: '100%', flexWrap: 'wrap' }}>
              <button className="aud-btn-ghost" style={{ flex: 1, minWidth: 140 }} onClick={() => { setSubmitted(false); setSelectedDoc(null); resetForm(); }}>Nilai Dokumen Lain</button>
              <Link href="/dashboard" style={{ flex: 1, minWidth: 140, textDecoration: 'none' }}>
                <button className="aud-btn-primary" style={{ width: '100%' }}>Kembali ke Beranda</button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     REVIEW
  ═══════════════════════════════════════════════════════════════ */
  if (showReview) {
    const total = Object.values(values).reduce((s, v) => s + (Number(v.nilai)||0), 0);
    const max   = indicators.length * 4;
    const pct   = Math.round((total / max) * 100);
    const col   = scoreColor(pct);
    return (
      <div className="aud-shell">
        <Sidebar />
        <ToastContainer />
        <ConfirmModal isOpen={showSubmit} title="Kunci & Kirim Laporan?" message="Setelah dikirim, penilaian tidak dapat diubah." confirmLabel="Ya, Kunci & Kirim" cancelLabel="Periksa Lagi" onConfirm={handleSubmit} onCancel={() => setShowSubmit(false)} type="warning" />
        <main className="aud-main aud-scroll">
          <div className="aud-review aud-anim-slide">
            <div className="aud-review-inner">
              <Breadcrumb items={[{ label: 'Beranda', href: '/dashboard' }, { label: 'Ruang Evaluasi', href: '/auditor' }, { label: 'Review' }]} />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', margin: '20px 0', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>📋 Review Penilaian</h1>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>{selectedDoc?.course?.prodi} · Periksa sebelum mengunci</p>
                </div>
                <button className="aud-btn-ghost" onClick={() => setShowReview(false)}>← Kembali Edit</button>
              </div>

              {/* Score */}
              <div className="aud-score-card">
                <div className="aud-score-ring" style={{ background: `${col}14`, border: `4px solid ${col}` }}>
                  <span className="aud-score-ring-val" style={{ color: col }}>{total}</span>
                  <span className="aud-score-ring-max">/{max}</span>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 36, fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{pct}%</span>
                    <span style={{ padding: '4px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: `${col}16`, color: col }}>{scoreLabel(pct)}</span>
                  </div>
                  <div style={{ height: 8, background: '#F1F5F9', borderRadius: 99, marginBottom: 6 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 99, transition: 'width 0.8s ease' }} />
                  </div>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>Skor dari {indicators.length} indikator</p>
                </div>
              </div>

              {/* Recap */}
              <div className="aud-recap-card">
                <div className="aud-recap-head">Rekap Semua Indikator</div>
                {indicators.map((ind, i) => {
                  const v = values[ind.id]; const n = Number(v?.nilai);
                  const nc = n>=4?'#10B981':n===3?'#3B82F6':n===2?'#F59E0B':'#EF4444';
                  const nb = n>=4?'#ECFDF5':n===3?'#EFF6FF':n===2?'#FFFBEB':'#FEF2F2';
                  return (
                    <div key={ind.id} className="aud-recap-row">
                      <span style={{ padding: '4px 10px', borderRadius: 6, background: '#EFF6FF', color: '#1A56DB', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{ind.kode}</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#0F172A', minWidth: 100 }}>{ind.icon} {ind.nama}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
                        {v?.nilai
                          ? <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: nb, color: nc }}>Nilai {v.nilai}</span>
                          : <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: '#FEF2F2', color: '#EF4444' }}>Belum</span>}
                        <button className="aud-btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => { setCurrentIdx(i); setShowReview(false); }}>Edit</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap', paddingBottom: 24 }}>
                <button className="aud-btn-ghost" onClick={() => setShowReview(false)}>← Kembali Edit</button>
                <button className="aud-btn-success" onClick={() => setShowSubmit(true)} disabled={loading}>
                  {loading ? '⏳ Mengirim...' : '🔒 Kunci & Kirim Laporan'}
                </button>
              </div>
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
    <div className="aud-shell">
      <Sidebar />
      <ToastContainer />
      <ConfirmModal isOpen={showBackModal} title="Kembali ke Indikator Sebelumnya?" message="Progress belum tersimpan akan hilang." confirmLabel="Ya, Kembali" cancelLabel="Tetap di Sini" onConfirm={() => { setShowBackModal(false); if (currentIdx > 0) setCurrentIdx(i => i - 1); }} onCancel={() => setShowBackModal(false)} />

      <main className="aud-main">

        {/* ── DOCUMENT LIST ─────────────────────────────────────── */}
        {!selectedDoc ? (
          <div className="aud-scroll">
            {/* HERO BANNER */}
            <div className="aud-hero">
              <Breadcrumb items={[{ label: 'Beranda', href: '/dashboard' }, { label: 'Ruang Evaluasi' }]} />
              <h1 className="aud-hero-title" style={{ marginTop: 12 }}>Ruang Evaluasi Dokumen</h1>
              <p className="aud-hero-sub">Periode: {activePeriod?.name} {activePeriod?.semester} — Pilih dokumen untuk dinilai</p>
              <div className="aud-stats">
                <div className="aud-stat">
                  <span className="aud-stat-val">{allDocs.length}</span>
                  <span className="aud-stat-label">Total Dokumen</span>
                </div>
                <div className="aud-stat">
                  <span className="aud-stat-val">{doneCount}</span>
                  <span className="aud-stat-label">Sudah Dinilai</span>
                </div>
                <div className="aud-stat">
                  <span className="aud-stat-val">{allDocs.length - doneCount}</span>
                  <span className="aud-stat-label">Belum Dinilai</span>
                </div>
              </div>
            </div>

            {/* Progress strip */}
            {allDocs.length > 0 && (
              <div className="aud-progress-strip">
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>Progress</span>
                <div className="aud-progress-bar">
                  <div className="aud-progress-fill" style={{ width: `${allDocs.length ? (doneCount/allDocs.length)*100 : 0}%` }} />
                </div>
                <span className="aud-progress-text">{doneCount}/{allDocs.length}</span>
              </div>
            )}

            <div className="aud-body">
              {/* Toolbar */}
              <div className="aud-toolbar">
                <div className="aud-search">
                  <SearchIcon />
                  <input type="text" placeholder="Cari nama dokumen, mata kuliah, atau kode..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Cari dokumen" />
                  {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 2, display: 'flex' }} aria-label="Hapus"><XIcon /></button>}
                </div>
                <select className="aud-filter" value={filterProdi} onChange={e => setFilterProdi(e.target.value)} aria-label="Filter prodi">
                  <option value="">Semua Program Studi</option>
                  {prodis.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select className="aud-filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} aria-label="Filter status">
                  <option value="">Semua Status</option>
                  <option value="pending">Belum Dinilai</option>
                  <option value="done">Sudah Dinilai</option>
                </select>
              </div>

              {(search || filterProdi || filterStatus) && (
                <p style={{ fontSize: 12, color: '#64748B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {filtered.length} dari {allDocs.length} dokumen
                  <button onClick={() => { setSearch(''); setFilterProdi(''); setFilterStatus(''); }} style={{ fontSize: 12, fontWeight: 600, color: '#1A56DB', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button>
                </p>
              )}

              {filtered.length > 0 ? (
                <>
                  {/* Desktop: Table */}
                  <div className="aud-table">
                    <div className="aud-table-head">
                      <span>Dokumen</span>
                      <span>Tipe</span>
                      <span>Status</span>
                      <span style={{ textAlign: 'right' }}>Aksi</span>
                    </div>
                    {filtered.map(doc => (
                      <div key={doc.id} className="aud-table-row">
                        <div className="aud-row-doc">
                          <div className="aud-row-icon" style={{ background: doc.type === 'RPS' ? '#EFF6FF' : '#FFFBEB', color: doc.type === 'RPS' ? '#1A56DB' : '#D97706' }}>
                            {doc.type === 'RPS' ? <DocSvg /> : <MutuSvg />}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p className="aud-row-name" title={doc.name}>{doc.name}</p>
                            <p className="aud-row-prodi">{doc.course.prodi} · {doc.course.code}</p>
                          </div>
                        </div>
                        <div><span className="aud-row-type">{doc.type}</span></div>
                        <div>
                          <span className="aud-row-status" style={{ background: doc.isEvaluated ? '#ECFDF5' : '#FFFBEB', color: doc.isEvaluated ? '#059669' : '#D97706' }}>
                            {doc.isEvaluated ? '✓ Dinilai' : '⏳ Pending'}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <button className="aud-row-btn"
                            style={{ background: doc.isEvaluated ? 'white' : '#1A56DB', color: doc.isEvaluated ? '#374151' : 'white', border: doc.isEvaluated ? '1.5px solid #D1D9E6' : 'none' }}
                            onClick={() => { setSelectedDoc(doc); resetForm(); }}>
                            {doc.isEvaluated ? '🔄 Ulang' : '📝 Nilai'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile/Tablet: Cards */}
                  <div className="aud-card-grid">
                    {filtered.map(doc => (
                      <div key={doc.id} className="aud-dcard">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div className="aud-row-icon" style={{ background: doc.type === 'RPS' ? '#EFF6FF' : '#FFFBEB', color: doc.type === 'RPS' ? '#1A56DB' : '#D97706' }}>
                            {doc.type === 'RPS' ? <DocSvg /> : <MutuSvg />}
                          </div>
                          <span className="aud-row-status" style={{ background: doc.isEvaluated ? '#ECFDF5' : '#FFFBEB', color: doc.isEvaluated ? '#059669' : '#D97706' }}>
                            {doc.isEvaluated ? '✓ Dinilai' : '⏳ Pending'}
                          </span>
                        </div>
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', margin: '0 0 3px' }}>{doc.type} · {doc.course.code}</p>
                          <h3 className="aud-row-name" style={{ whiteSpace: 'normal', WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{doc.name}</h3>
                          <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>{doc.course.prodi}</p>
                        </div>
                        <button className="aud-row-btn" style={{ width: '100%', padding: '10px', background: doc.isEvaluated ? 'white' : '#1A56DB', color: doc.isEvaluated ? '#374151' : 'white', border: doc.isEvaluated ? '1.5px solid #D1D9E6' : 'none' }}
                          onClick={() => { setSelectedDoc(doc); resetForm(); }}>
                          {doc.isEvaluated ? '🔄 Nilai Ulang' : '📝 Mulai Penilaian'}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="aud-empty">
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SearchIcon />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0 }}>Tidak ada dokumen ditemukan</h3>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Coba ubah kata kunci atau filter</p>
                  <button className="aud-btn-ghost" onClick={() => { setSearch(''); setFilterProdi(''); setFilterStatus(''); }}>Reset Filter</button>
                </div>
              )}
            </div>
          </div>

        ) : (
          /* ── EVALUATOR ──────────────────────────────────────── */
          <div className="aud-eval-wrap">

            {/* Header */}
            <div className="aud-eval-header">
              <div className="aud-eval-info">
                <Breadcrumb items={[
                  { label: 'Beranda', href: '/dashboard' },
                  { label: 'Evaluasi', href: '/auditor', onClick: e => { e.preventDefault(); setSelectedDoc(null); resetForm(); } },
                  { label: selectedDoc.course.name },
                ]} />
                <p className="aud-eval-docname" title={selectedDoc.name}>{selectedDoc.name}</p>
                <p className="aud-eval-docsub">{selectedDoc.course.prodi} · {selectedDoc.course.code}</p>
              </div>
              <div className="aud-eval-progress">
                <div style={{ position: 'relative', width: 48, height: 48 }}>
                  <ProgressRing pct={pctDone} size={48} stroke={5} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#0F172A' }}>
                    {filledCount}/{indicators.length}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{pctDone}%</span>
                  <span style={{ fontSize: 10, color: '#94A3B8' }}>selesai</span>
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div className="aud-stepper" style={{ paddingBottom: 28 }}>
              {indicators.map((ind, i) => {
                const isDone = !!values[ind.id]?.nilai;
                const isAct  = i === currentIdx;
                return (
                  <div key={ind.id} className="aud-step">
                    {i > 0 && <div className={`aud-step-line${isDone || values[indicators[i-1].id]?.nilai ? ' filled' : ''}`} />}
                    <div className={`aud-step-dot${isAct ? ' active' : ''}${isDone && !isAct ? ' done' : ''}`} onClick={() => setCurrentIdx(i)} title={`${ind.kode} — ${ind.nama}`}>
                      {isDone && !isAct ? <CheckSvg size={14} stroke={3} /> : <span>{i + 1}</span>}
                      <span className="aud-step-label">{ind.kode}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile toggle */}
            <div className="aud-mtoggle">
              {[{ id: 'form', label: '✏️ Form Penilaian' }, { id: 'doc', label: '📄 Lihat Dokumen' }].map(tab => (
                <button key={tab.id} className="aud-mtoggle-btn"
                  style={{ background: mobileView === tab.id ? 'white' : '#F8FAFC', color: mobileView === tab.id ? '#1A56DB' : '#64748B', borderBottom: `2px solid ${mobileView === tab.id ? '#1A56DB' : 'transparent'}` }}
                  onClick={() => setMobileView(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Split */}
            <div className="aud-split">

              {/* LEFT: Viewer (desktop only) */}
              <div className="aud-viewer" style={{ width: `${viewerWidth}%` }}>
                <div className="aud-viewer-bar">
                  <span className="aud-viewer-file">📄 {selectedDoc.name}</span>
                  <div className="aud-zoom-grp">
                    <button className="aud-zoom-btn" onClick={() => setZoomLevel(z => Math.max(50, z-25))} disabled={zoomLevel <= 50} aria-label="Perkecil"><ZoomOut /></button>
                    <span className="aud-zoom-val">{zoomLevel}%</span>
                    <button className="aud-zoom-btn" onClick={() => setZoomLevel(z => Math.min(200, z+25))} disabled={zoomLevel >= 200} aria-label="Perbesar"><ZoomIn /></button>
                    <button className="aud-zoom-btn" onClick={() => setZoomLevel(100)} style={{ fontSize: 10, fontWeight: 700, width: 'auto', padding: '0 5px' }} aria-label="Reset zoom">↺</button>
                  </div>
                  <div className="aud-width-btns">
                    {[40, 55, 65].map(w => (
                      <button key={w} className={`aud-width-btn${viewerWidth === w ? ' on' : ''}`} onClick={() => setViewerWidth(w)}>{w}%</button>
                    ))}
                  </div>
                </div>
                <div className="aud-viewer-body">
                  <iframe src={selectedDoc.url} title={`Preview: ${selectedDoc.name}`}
                    style={{ width: `${100/(zoomLevel/100)}%`, height: `${100/(zoomLevel/100)}%`, transform: `scale(${zoomLevel/100})`, transformOrigin: 'top left', transition: 'transform 0.2s ease' }} />
                </div>
              </div>

              {/* Mobile viewer */}
              {mobileView === 'doc' && (
                <div className="aud-mobile-viewer" style={{ display: 'flex', flexDirection: 'column', flex: 1, background: '#E8EDF3', overflow: 'hidden' }}>
                  <div className="aud-viewer-bar">
                    <span className="aud-viewer-file">📄 {selectedDoc.name}</span>
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <iframe src={selectedDoc.url} title={`Preview: ${selectedDoc.name}`} style={{ width: '100%', height: '100%', border: 'none' }} />
                  </div>
                </div>
              )}

              {/* RIGHT: Form */}
              {mobileView === 'form' && (
                <div className="aud-form">
                  <div className="aud-form-scroll">

                    {/* Indicator header */}
                    <div className="aud-ind-head">
                      <div className="aud-ind-kode">{cur.kode}</div>
                      <div style={{ minWidth: 0 }}>
                        <h2 className="aud-ind-name">
                          <span aria-hidden="true">{cur.icon}</span>
                          {cur.nama}
                          <HelpTooltip title={`Bantuan: ${cur.kode}`} content={cur.help} />
                        </h2>
                        <p className="aud-ind-sub">Indikator {currentIdx + 1} dari {indicators.length}</p>
                      </div>
                    </div>

                    {/* Rubrik section */}
                    <div className="aud-section">
                      <div className="aud-section-title">
                        <CheckSvg size={11} stroke={2.5} color="#1D4ED8" /> Rubrik Penilaian
                      </div>
                      <div className="aud-rubrik">
                        <p className="aud-rubrik-text">{cur.rubrik}</p>
                      </div>
                    </div>

                    {/* Temuan */}
                    <div className="aud-fg">
                      <label htmlFor={`temuan-${cur.id}`} className="aud-label">
                        Temuan Standar
                        <HelpTooltip title="Temuan" content="Pilih temuan yang paling mendekati kondisi dokumen." />
                      </label>
                      <select id={`temuan-${cur.id}`} className="aud-select" value={curVal.temuan} onChange={e => updateVal('temuan', e.target.value)}>
                        <option value="">— Pilih temuan —</option>
                        {temuanOptions.map((o, i) => <option key={i} value={o}>{o}</option>)}
                      </select>
                    </div>

                    {/* Nilai */}
                    <div className="aud-fg">
                      <label className="aud-label">
                        Nilai Indikator <span style={{ color: '#EF4444' }}>*</span>
                        <HelpTooltip title="Skala Nilai" content="Skala 1–4. Nilai 4 = sangat sesuai standar. Nilai 1 = tidak memenuhi." />
                      </label>
                      <div className="aud-nilai-grid">
                        {nilaiOptions.map(opt => {
                          const sel = curVal.nilai === String(opt.val);
                          return (
                            <label key={opt.val} className="aud-nilai"
                              style={sel ? { border: `2px solid ${opt.border}`, background: opt.bg, boxShadow: `0 0 0 3px ${opt.ring}`, transform: 'translateY(-2px)' } : {}}>
                              <input type="radio" name={`nilai-${cur.id}`} value={String(opt.val)} checked={sel} onChange={e => updateVal('nilai', e.target.value)} aria-label={`Nilai ${opt.val}`} />
                              <span className="aud-nilai-num" style={{ color: sel ? opt.text : '#9CA3AF' }}>{opt.val}</span>
                              <span className="aud-nilai-label" style={{ color: sel ? opt.text : '#374151' }}>{opt.label}</span>
                              <span className="aud-nilai-sub">{opt.sub}</span>
                              {sel && (
                                <div className="aud-nilai-check" style={{ background: opt.border }}>
                                  <CheckSvg size={9} stroke={3.5} color="white" />
                                </div>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Catatan */}
                    <div className="aud-fg" style={{ marginBottom: 4 }}>
                      <label htmlFor={`catatan-${cur.id}`} className="aud-label">
                        Catatan & Rekomendasi
                        <span className="aud-optional">Opsional</span>
                      </label>
                      <textarea id={`catatan-${cur.id}`} className="aud-textarea" value={curVal.catatan} onChange={e => updateVal('catatan', e.target.value)} rows={3} placeholder="Tuliskan catatan atau rekomendasi perbaikan..." />
                    </div>
                  </div>

                  {/* Action bar */}
                  <div className="aud-action">
                    <button className="aud-btn-ghost" onClick={() => { if (currentIdx > 0) setShowBackModal(true); }} disabled={currentIdx === 0}>
                      ← Sebelumnya
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>
                        {currentIdx + 1}<span style={{ color: '#D1D9E6' }}>/</span>{indicators.length}
                      </span>
                      <button className="aud-btn-primary" onClick={handleSaveNext}>
                        {isLast ? '📋 Lihat Review' : 'Simpan & Lanjut →'}
                      </button>
                    </div>
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
