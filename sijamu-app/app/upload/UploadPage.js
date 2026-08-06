// Halaman Pengunggahan Dokumen Terpandu — route: /upload
// CSS ada di: UploadPage.module.css
'use client';

import { useState, useRef, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import HelpTooltip from '@/components/HelpTooltip';
import ConfirmModal from '@/components/ConfirmModal';
import { ToastContainer, addToast } from '@/components/Toast';
import styles from './UploadPage.module.css';

const initialIndicators = [
  { id: 1, kode: 'C1.1', nama: 'Visi, Misi, Tujuan, dan Strategi (VMTS)', status: 'empty', file: null, help: 'Unggah dokumen VMTS yang telah disahkan Rektor. Format: PDF, maks. 10MB.' },
  { id: 2, kode: 'C1.2', nama: 'Tata Pamong dan Tata Kelola', status: 'empty', file: null, help: 'Dokumen SOP, SK Pengangkatan, dan Struktur Organisasi. Format: PDF.' },
  { id: 3, kode: 'C1.3', nama: 'Sistem Penjaminan Mutu Internal', status: 'empty', file: null, help: 'Bukti pelaksanaan audit mutu internal: notulen, laporan, tindak lanjut.' },
  { id: 4, kode: 'C2.1', nama: 'Profil Dosen Tetap', status: 'empty', file: null, help: 'CV dosen, SK dosen tetap, dan data PDDIKTI. Kumpulkan dalam 1 file ZIP.' },
  { id: 5, kode: 'C2.2', nama: 'Kinerja Dosen (Tri Dharma)', status: 'empty', file: null, help: 'Laporan kinerja dosen: pengajaran, penelitian, pengabdian masyarakat.' },
  { id: 6, kode: 'C3.1', nama: 'Kurikulum', status: 'empty', file: null, help: 'Dokumen kurikulum yang didalamnya memuat profil lulusan, CPL, dan RPS.' },
  { id: 7, kode: 'C3.2', nama: 'Pelaksanaan Proses Pembelajaran', status: 'empty', file: null, help: 'Berita acara perkuliahan, absensi, dan hasil evaluasi pembelajaran.' },
  { id: 8, kode: 'C4.1', nama: 'Penelitian Dosen', status: 'empty', file: null, help: 'Daftar penelitian, kontrak penelitian, dan laporan akhir. Maks. 2 tahun terakhir.' },
  { id: 9, kode: 'C4.2', nama: 'Pengabdian Kepada Masyarakat', status: 'empty', file: null, help: 'Dokumen PKM: proposal, laporan, dan foto kegiatan.' },
  { id: 10, kode: 'C5.1', nama: 'Hasil Studi Mahasiswa (IPK & Lama Studi)', status: 'empty', file: null, help: 'Data lulusan 3 tahun terakhir: IPK rata-rata dan rata-rata lama studi.' },
  { id: 11, kode: 'C5.2', nama: 'Kepuasan Pengguna Lulusan', status: 'empty', file: null, help: 'Hasil tracer study atau kuesioner kepuasan pengguna lulusan.' },
  { id: 12, kode: 'C6.1', nama: 'Keuangan dan Sarana Prasarana', status: 'empty', file: null, help: 'Laporan keuangan prodi dan daftar inventaris sarana-prasarana.' },
];

const STEPS = ['Pilih Prodi', 'Unggah Dokumen', 'Selesai'];

export default function UploadPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProdi, setSelectedProdi] = useState('');
  const [indicators, setIndicators] = useState(initialIndicators);
  const [activeModal, setActiveModal] = useState(null); // indicator id
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // indicator id
  const fileInputRef = useRef(null);

  const prodiList = [
    'Teknik Informatika',
    'Pendidikan Matematika',
    'Manajemen',
    'Pendidikan Bahasa Inggris',
    'Akuntansi',
    'Pendidikan IPA',
    'Hukum',
  ];

  const filledCount = indicators.filter(i => i.status === 'done').length;
  const totalCount = indicators.length;
  const pct = Math.round((filledCount / totalCount) * 100);

  const handleProdiNext = () => {
    if (!selectedProdi) {
      addToast('Pilih program studi terlebih dahulu.', 'warning');
      return;
    }
    setCurrentStep(2);
  };

  const processFile = useCallback(async (file, indicatorId) => {
    if (!file) return;
    const validTypes = ['application/pdf', 'application/zip', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024;
    if (!validTypes.includes(file.type) && !file.name.endsWith('.zip')) {
      addToast('Format file tidak didukung. Gunakan PDF, ZIP, JPG, atau PNG.', 'error');
      return;
    }
    if (file.size > maxSize) {
      addToast('Ukuran file melebihi batas 10MB.', 'error');
      return;
    }

    setUploading(true);
    await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));
    setIndicators(prev => prev.map(ind =>
      ind.id === indicatorId
        ? { ...ind, status: 'done', file: { name: file.name, size: file.size, type: file.type } }
        : ind
    ));
    setUploading(false);
    setActiveModal(null);
    addToast(`✓ Dokumen "${file.name}" berhasil diunggah!`, 'success');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && activeModal) processFile(file, activeModal);
  }, [activeModal, processFile]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && activeModal) processFile(file, activeModal);
    e.target.value = '';
  };

  const handleDelete = (id) => {
    setIndicators(prev => prev.map(ind =>
      ind.id === id ? { ...ind, status: 'empty', file: null } : ind
    ));
    setConfirmDelete(null);
    addToast('Dokumen berhasil dihapus.', 'info');
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const openModal = (ind) => {
    setActiveModal(ind.id);
  };

  const modalIndicator = indicators.find(i => i.id === activeModal);

  if (currentStep === 3) {
    return (
      <div className="app-shell">
        <Sidebar />
        <ToastContainer />
        <main className="main-content">
          <div className="page-wrapper">
            <div className={styles.successScreen}>
              <div className={styles.successIcon}>🎉</div>
              <h1 className={styles.successTitle}>Pengunggahan Selesai!</h1>
              <p className={styles.successMsg}>
                <strong>{filledCount} dari {totalCount}</strong> dokumen berhasil diunggah untuk{' '}
                <strong>{selectedProdi}</strong>.
              </p>
              {filledCount < totalCount && (
                <div className={styles.missingWarn}>
                  ⚠️ {totalCount - filledCount} dokumen belum diunggah. Anda masih bisa melengkapinya nanti.
                </div>
              )}
              <div className={styles.successActions}>
                <button className="btn btn-ghost" onClick={() => setCurrentStep(2)}>
                  ← Kembali Lengkapi
                </button>
                <button className="btn btn-success btn-lg" onClick={() => addToast('Laporan dikirim ke sistem!', 'success')}>
                  ✓ Kirim ke Sistem
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

      {/* Upload Modal */}
      {activeModal && modalIndicator && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget && !uploading) setActiveModal(null); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-modal-title"
        >
          <div className={styles.uploadModalBox}>
            <div className={styles.uploadModalHeader}>
              <div>
                <span className={styles.uploadModalKode}>{modalIndicator.kode}</span>
                <h2 id="upload-modal-title" className={styles.uploadModalTitle}>{modalIndicator.nama}</h2>
                <p className={styles.uploadModalHelp}>{modalIndicator.help}</p>
              </div>
              <button
                className={styles.modalCloseBtn}
                onClick={() => !uploading && setActiveModal(null)}
                aria-label="Tutup dialog unggah"
                disabled={uploading}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {uploading ? (
              <div className={styles.uploadingState}>
                <div className="spinner" aria-hidden="true" />
                <p>Sedang mengunggah dokumen...</p>
                <p className={styles.uploadingNote}>Mohon tunggu, jangan tutup jendela ini</p>
              </div>
            ) : (
              <div
                className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                aria-label="Area drag and drop untuk mengunggah file"
              >
                <div className={styles.dropIcon} aria-hidden="true">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p className={styles.dropTitle}>
                  {dragOver ? '✓ Lepaskan file di sini' : 'Seret & Lepas file di sini'}
                </p>
                <p className={styles.dropSub}>atau klik untuk memilih file dari komputer</p>
                <div className={styles.dropFormats}>
                  <span className="badge badge-info">PDF</span>
                  <span className="badge badge-info">ZIP</span>
                  <span className="badge badge-info">JPG/PNG</span>
                  <span className="badge badge-info">Maks. 10MB</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.zip,.jpg,.jpeg,.png"
                  className={styles.hiddenInput}
                  onChange={handleFileSelect}
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Hapus Dokumen?"
        message="Dokumen yang dihapus tidak dapat dikembalikan. Anda perlu mengunggah ulang jika berubah pikiran."
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
        type="danger"
      />

      <main className="main-content">
        <div className="page-wrapper">
          <Breadcrumb items={[
            { label: 'Beranda', href: '/dashboard' },
            { label: 'Unggah Dokumen', href: '/upload' },
            { label: currentStep === 1 ? 'Pilih Prodi' : selectedProdi, href: '/upload' },
          ]} />

          <div className="page-header">
            <h1 className="page-title">📁 Unggah Dokumen Bukti</h1>
            <p className="page-subtitle">Ikuti langkah-langkah berikut untuk mengunggah dokumen akreditasi secara terstruktur</p>
          </div>

          {/* Wizard steps */}
          <div className="wizard-steps">
            {STEPS.map((step, i) => {
              const stepNum = i + 1;
              const isDone = currentStep > stepNum;
              const isActive = currentStep === stepNum;
              return (
                <div key={i} className={`wizard-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                  <div className="wizard-step-dot">
                    {isDone ? '✓' : stepNum}
                  </div>
                  <span className="wizard-step-label">{step}</span>
                  {i < STEPS.length - 1 && <div className="wizard-connector" />}
                </div>
              );
            })}
          </div>

          {/* Step 1: Pilih Prodi */}
          {currentStep === 1 && (
            <div className={`card ${styles.prodiCard}`}>
              <h2 className="card-title">Pilih Program Studi</h2>
              <p className={styles.prodiNote}>
                Pilih program studi yang akan Anda lengkapi dokumennya. Pastikan Anda hanya mengunggah dokumen untuk prodi yang menjadi tanggung jawab Anda.
              </p>
              <div className={styles.prodiGrid}>
                {prodiList.map((prodi) => (
                  <label
                    key={prodi}
                    className={`${styles.prodiOption} ${selectedProdi === prodi ? styles.prodiOptionActive : ''}`}
                  >
                    <input
                      type="radio"
                      name="prodi"
                      value={prodi}
                      checked={selectedProdi === prodi}
                      onChange={() => setSelectedProdi(prodi)}
                      className={styles.hiddenRadio}
                      aria-label={`Pilih prodi ${prodi}`}
                    />
                    <span className={styles.prodiCheck} aria-hidden="true">
                      {selectedProdi === prodi ? '✓' : ''}
                    </span>
                    <span className={styles.prodiName}>{prodi}</span>
                  </label>
                ))}
              </div>
              <div className={styles.prodiActions}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleProdiNext}
                  aria-label="Lanjutkan ke tahap unggah dokumen"
                >
                  Lanjutkan ke Unggah →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Checklist Upload */}
          {currentStep === 2 && (
            <div>
              {/* Progress summary */}
              <div className={`card ${styles.progressSummary}`}>
                <div className={styles.progressInfo}>
                  <div>
                    <div className={styles.progressProdi}>{selectedProdi}</div>
                    <div className={styles.progressLabel}>
                      <span className={styles.progressNum}>{filledCount}</span> dari {totalCount} dokumen diunggah
                    </div>
                  </div>
                  <div className={styles.progressPct}>{pct}%</div>
                </div>
                <div className="progress-bar-track" style={{marginTop:'var(--space-3)'}}>
                  <div className="progress-bar-fill" style={{width:`${pct}%`}} />
                </div>
              </div>

              {/* Checklist Table */}
              <div className={`card mt-4`}>
                <h2 className="card-title">Daftar Dokumen Wajib</h2>
                <div className="table-wrapper mt-4">
                  <table className="data-table" aria-label="Daftar checklist dokumen yang harus diunggah">
                    <thead>
                      <tr>
                        <th scope="col" style={{width:40}}>No</th>
                        <th scope="col" style={{width:80}}>Kode</th>
                        <th scope="col">Nama Indikator / Dokumen</th>
                        <th scope="col">Bantuan</th>
                        <th scope="col">Status</th>
                        <th scope="col">File Terunggah</th>
                        <th scope="col" style={{width:200}}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indicators.map((ind, i) => (
                        <tr
                          key={ind.id}
                          className={ind.status === 'done' ? styles.rowDone : styles.rowEmpty}
                        >
                          <td>{i + 1}</td>
                          <td>
                            <span className={styles.kodeChip}>{ind.kode}</span>
                          </td>
                          <td>
                            <span className={styles.indName}>{ind.nama}</span>
                          </td>
                          <td>
                            <HelpTooltip title={ind.kode} content={ind.help} />
                          </td>
                          <td>
                            {ind.status === 'done' ? (
                              <span className="badge badge-success">✔ Selesai</span>
                            ) : (
                              <span className="badge badge-danger">✕ Belum Diunggah</span>
                            )}
                          </td>
                          <td>
                            {ind.file ? (
                              <div className={styles.fileInfo}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                                </svg>
                                <span className={styles.fileName} title={ind.file.name}>{ind.file.name}</span>
                                <span className={styles.fileSize}>{formatSize(ind.file.size)}</span>
                              </div>
                            ) : (
                              <span className="text-muted" style={{fontSize:'var(--font-size-sm)'}}>—</span>
                            )}
                          </td>
                          <td>
                            <div className={styles.actionBtns}>
                              {ind.status === 'done' ? (
                                <>
                                  <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() => openModal(ind)}
                                    aria-label={`Ganti dokumen ${ind.kode}`}
                                  >
                                    Ganti
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => setConfirmDelete(ind.id)}
                                    aria-label={`Hapus dokumen ${ind.kode}`}
                                  >
                                    Hapus
                                  </button>
                                </>
                              ) : (
                                <button
                                  className={`btn btn-sm btn-primary ${styles.uploadBtn}`}
                                  onClick={() => openModal(ind)}
                                  aria-label={`Unggah dokumen untuk ${ind.nama}`}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                  </svg>
                                  ➕ Unggah Bukti
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={styles.checklistFooter}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setCurrentStep(1)}
                    aria-label="Kembali ke pilih prodi"
                  >
                    ← Ganti Prodi
                  </button>
                  <button
                    className="btn btn-success btn-lg"
                    onClick={() => setCurrentStep(3)}
                    aria-label="Selesaikan pengunggahan"
                  >
                    Selesai ({filledCount}/{totalCount}) →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
