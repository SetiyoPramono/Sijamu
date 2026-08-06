// Halaman Ruang Evaluasi (Auditor Split-Screen) — route: /auditor
// CSS ada di: AuditorPage.module.css
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import HelpTooltip from '@/components/HelpTooltip';
import ConfirmModal from '@/components/ConfirmModal';
import { ToastContainer, addToast } from '@/components/Toast';
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
  { val: 4, label: '4 — Sangat Baik (> 85%)' },
  { val: 3, label: '3 — Baik (70% – 85%)' },
  { val: 2, label: '2 — Cukup (55% – 70%)' },
  { val: 1, label: '1 — Kurang (< 55%)' },
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
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setSubmitted(true);
    addToast('Laporan evaluasi berhasil dikunci dan dikirim!', 'success');
  };

  if (submitted) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <div className={styles.successScreen}>
            <div className={styles.successIcon}>✅</div>
            <h1 className={styles.successTitle}>Laporan Berhasil Dikirim!</h1>
            <p className={styles.successMsg}>
              Evaluasi untuk <strong>Teknik Informatika</strong> telah dikunci dan dikirim ke sistem.<br />
              Terima kasih atas kerja keras Anda sebagai Auditor.
            </p>
            <Link href="/dashboard" className="btn btn-primary btn-lg">
              Kembali ke Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (showReview) {
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
              { label: 'Review Penilaian', href: '/auditor' },
            ]} />
            <div className="page-header">
              <h1 className="page-title">📋 Review Penilaian</h1>
              <p className="page-subtitle">Teknik Informatika · Periksa kembali semua nilai sebelum dikirim</p>
            </div>

            <div className={`card ${styles.reviewCard}`}>
              <div className="table-wrapper">
                <table className="data-table" aria-label="Rekap penilaian auditor">
                  <thead>
                    <tr>
                      <th>Kode</th>
                      <th>Indikator</th>
                      <th>Temuan</th>
                      <th>Nilai</th>
                      <th>Catatan</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicators.map((ind, i) => {
                      const v = values[ind.id];
                      return (
                        <tr key={ind.id}>
                          <td><strong>{ind.kode}</strong></td>
                          <td>{ind.nama}</td>
                          <td style={{maxWidth:200, fontSize:'var(--font-size-sm)'}}>
                            {v.temuan || <span className="text-muted">—</span>}
                          </td>
                          <td>
                            {v.nilai ? (
                              <span className={`badge badge-${v.nilai >= 3 ? 'success' : v.nilai === 2 ? 'warning' : 'danger'}`}>
                                Nilai {v.nilai}
                              </span>
                            ) : (
                              <span className="badge badge-danger">Belum diisi</span>
                            )}
                          </td>
                          <td style={{maxWidth:160, fontSize:'var(--font-size-sm)'}}>
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
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowReview(false)}
                >
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

      <main className="main-content" style={{marginLeft:'var(--sidebar-width)'}}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div>
            <Breadcrumb items={[
              { label: 'Beranda', href: '/dashboard' },
              { label: 'Ruang Evaluasi', href: '/auditor' },
              { label: 'Teknik Informatika', href: '/auditor' },
            ]} />
            <h1 className={styles.topTitle}>
              Ruang Evaluasi — <span>Teknik Informatika</span>
            </h1>
          </div>
          <div className={styles.topProgress}>
            <span className={styles.topProgressText}>
              <strong>{filledCount}</strong> / {indicators.length} Indikator Dinilai
            </span>
            <div className="progress-bar-track" style={{width:200}}>
              <div className="progress-bar-fill" style={{width:`${(filledCount/indicators.length)*100}%`}} />
            </div>
          </div>
        </div>

        {/* Indicator tabs */}
        <div className={styles.indTabs} role="tablist" aria-label="Navigasi indikator">
          {indicators.map((ind, i) => {
            const v = values[ind.id];
            return (
              <button
                key={ind.id}
                role="tab"
                aria-selected={i === currentIdx}
                aria-controls={`panel-${ind.id}`}
                className={`${styles.indTab} ${i === currentIdx ? styles.indTabActive : ''} ${v.nilai ? styles.indTabDone : ''}`}
                onClick={() => setCurrentIdx(i)}
              >
                {v.nilai ? '✓ ' : ''}{ind.kode}
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
                Dokumen_{current.kode}_TeknikInformatika.pdf
              </span>
              <div className={styles.zoomControls}>
                <button
                  className={styles.zoomBtn}
                  onClick={() => setZoomLevel(z => Math.max(50, z - 25))}
                  aria-label="Perkecil tampilan dokumen"
                  disabled={zoomLevel <= 50}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                </button>
                <span className={styles.zoomVal} aria-live="polite">{zoomLevel}%</span>
                <button
                  className={styles.zoomBtn}
                  onClick={() => setZoomLevel(z => Math.min(200, z + 25))}
                  aria-label="Perbesar tampilan dokumen"
                  disabled={zoomLevel >= 200}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className={styles.docViewer}>
              <div className={styles.pdfPlaceholder} style={{transform:`scale(${zoomLevel/100})`, transformOrigin:'top center'}}>
                <div className={styles.pdfPage}>
                  <div className={styles.pdfHeader}>
                    <div className={styles.pdfLogo}>🏫 UNIPGRI BANYUWANGI</div>
                    <div className={styles.pdfTitle}>DOKUMEN {current.kode}</div>
                    <div className={styles.pdfSubtitle}>{current.nama}</div>
                    <div className={styles.pdfProdi}>Program Studi Teknik Informatika</div>
                  </div>
                  <div className={styles.pdfBody}>
                    <div className={styles.pdfSection}>
                      <div className={styles.pdfSectionTitle}>1. Pendahuluan</div>
                      <div className={styles.pdfLine} />
                      <div className={styles.pdfLine} style={{width:'88%'}} />
                      <div className={styles.pdfLine} style={{width:'92%'}} />
                      <div className={styles.pdfLine} style={{width:'75%'}} />
                    </div>
                    <div className={styles.pdfSection}>
                      <div className={styles.pdfSectionTitle}>2. Isi Dokumen</div>
                      <div className={styles.pdfLine} />
                      <div className={styles.pdfLine} style={{width:'95%'}} />
                      <div className={styles.pdfLine} style={{width:'82%'}} />
                      <div className={styles.pdfLine} style={{width:'90%'}} />
                      <div className={styles.pdfLine} style={{width:'78%'}} />
                      <div className={styles.pdfLine} style={{width:'88%'}} />
                    </div>
                    <div className={styles.pdfSection}>
                      <div className={styles.pdfSectionTitle}>3. Lampiran</div>
                      <div className={styles.pdfBox}>Lampiran 1 — Tabel Data</div>
                      <div className={styles.pdfBox}>Lampiran 2 — Grafik Capaian</div>
                    </div>
                  </div>
                </div>
                <div className={styles.pdfPageNum}>Halaman 1 dari 12</div>
              </div>
            </div>
          </div>

          {/* Right: Assessment Form */}
          <div className={styles.assessPanel}>
            <div className={styles.assessScroll}>
              <div className={styles.assessHeader}>
                <div className={styles.indicatorBadge}>{current.kode}</div>
                <h2 className={styles.indicatorTitle}>
                  {current.nama}
                  <HelpTooltip title={`Bantuan: ${current.kode}`} content={current.help} />
                </h2>
              </div>

              <div className={styles.rubrikBox}>
                <div className={styles.rubrikLabel}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  Rubrik Penilaian
                </div>
                <p className={styles.rubrikText}>{current.rubrik}</p>
              </div>

              <div className={styles.formSection}>
                {/* Temuan */}
                <div className="form-group">
                  <label className="form-label" htmlFor={`temuan-${current.id}`}>
                    Pilih Temuan Standar
                    <HelpTooltip title="Temuan Standar" content="Pilih temuan yang paling mendekati kondisi dokumen yang Anda periksa. Temuan ini akan muncul di laporan resmi." />
                  </label>
                  <select
                    id={`temuan-${current.id}`}
                    className="form-select"
                    value={currentVal.temuan}
                    onChange={e => updateValue('temuan', e.target.value)}
                    aria-required="false"
                  >
                    <option value="">— Pilih temuan —</option>
                    {temuanOptions.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Nilai */}
                <div className="form-group">
                  <label className="form-label">
                    Nilai Indikator
                    <HelpTooltip title="Skala Penilaian" content="Nilai diberikan dalam skala 1–4. Nilai 4 (Sangat Baik) artinya dokumen sangat lengkap dan sesuai standar. Nilai 1 (Kurang) artinya dokumen tidak memenuhi syarat." />
                  </label>
                  <div className={styles.nilaiGrid}>
                    {nilaiOptions.map((opt) => (
                      <label
                        key={opt.val}
                        className={`${styles.nilaiCard} ${currentVal.nilai === String(opt.val) ? styles.nilaiCardActive : ''} ${
                          opt.val >= 3 ? styles.nilaiGreen : opt.val === 2 ? styles.nilaiYellow : styles.nilaiRed
                        }`}
                      >
                        <input
                          type="radio"
                          name={`nilai-${current.id}`}
                          value={String(opt.val)}
                          checked={currentVal.nilai === String(opt.val)}
                          onChange={e => updateValue('nilai', e.target.value)}
                          className={styles.nilaiInput}
                          aria-label={opt.label}
                        />
                        <span className={styles.nilaiNum}>{opt.val}</span>
                        <span className={styles.nilaiLabel}>{opt.label.split('—')[1].trim()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Catatan */}
                <div className="form-group">
                  <label className="form-label" htmlFor={`catatan-${current.id}`}>
                    Catatan / Rekomendasi (Opsional)
                  </label>
                  <textarea
                    id={`catatan-${current.id}`}
                    className="form-textarea"
                    placeholder="Tuliskan catatan tambahan atau rekomendasi perbaikan untuk prodi..."
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
                onClick={() => {
                  if (currentIdx > 0) setShowBackModal(true);
                }}
                disabled={currentIdx === 0}
                aria-label="Kembali ke indikator sebelumnya"
              >
                ← Sebelumnya
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSaveNext}
                aria-label={isLastIndicator ? 'Simpan dan lihat review' : 'Simpan dan lanjut ke indikator berikutnya'}
              >
                {isLastIndicator ? '📋 Simpan & Lihat Review' : 'Simpan & Lanjut →'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
