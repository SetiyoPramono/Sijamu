// Halaman Pengunggahan Dokumen Terpandu — route: /upload
// CSS ada di: UploadPage.module.css
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import HelpTooltip from '@/components/HelpTooltip';
import ConfirmModal from '@/components/ConfirmModal';
import { ToastContainer, addToast } from '@/components/Toast';
import { useMutu } from '@/context/MutuContext';
import { useEvaluation } from '@/context/EvaluationContext';
import { useUploadConfig } from '@/context/UploadConfigContext';
const STEPS = ['Pilih Prodi', 'Unggah Dokumen', 'Selesai'];

export default function UploadPage() {
  const { mutuDocs, addMutuDoc, deleteMutuDoc } = useMutu();
  const { docEvaluations } = useEvaluation();
  const { prodiList, docList, categoryList } = useUploadConfig();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProdi, setSelectedProdi] = useState('');
  const [indicators, setIndicators] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activeFeedback, setActiveFeedback] = useState(null);
  const fileInputRef = useRef(null);

  // Derived data
  // Derived data
  const buildIndicators = () => docList.map(d => ({
    id: d.id, kode: d.kode, nama: d.nama, help: d.help, status: 'empty', file: null,
  }));

  // Sync indicators when prodi changes or docList changes
  useEffect(() => {
    const base = buildIndicators();
    if (selectedProdi) {
      setIndicators(base.map(ind => {
        // Use loose equality (==) to handle potential string/number mismatches from API
        const existingDoc = mutuDocs.find(d => d.prodiId == selectedProdi && d.indicatorId == ind.id);
        if (existingDoc) {
          return { ...ind, status: 'done', file: existingDoc.file, globalDocId: existingDoc.id };
        }
        return { ...ind, status: 'empty', file: null, globalDocId: null };
      }));
    } else {
      setIndicators(base);
    }
  }, [selectedProdi, mutuDocs, docList]);

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
    const validTypes = ['application/pdf'];
    const maxSize = 10 * 1024 * 1024;
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      addToast('Format file tidak didukung. Hanya file PDF yang diizinkan.', 'error');
      return;
    }
    if (file.size > maxSize) {
      addToast('Ukuran file melebihi batas 10MB.', 'error');
      return;
    }

    setUploading(true);
    try {
      const savedFile = await addMutuDoc(selectedProdi, indicatorId, file);

      setIndicators(prev => prev.map(ind =>
        ind.id === indicatorId
          ? { ...ind, status: 'done', file: savedFile }
          : ind
      ));
      addToast(`✓ Dokumen "${file.name}" berhasil diunggah!`, 'success');
    } catch (err) {
      const msg = err?.message || 'Gagal mengunggah dokumen. Silakan coba lagi.';
      addToast(msg, 'error');
    } finally {
      setUploading(false);
      setActiveModal(null);
    }
  }, [selectedProdi]);

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

  const handleDelete = async (id) => {
    const ind = indicators.find(i => i.id === id);
    if (ind && ind.globalDocId) {
      await deleteMutuDoc(ind.globalDocId);
    }
    setIndicators(prev => prev.map(i =>
      i.id === id ? { ...i, status: 'empty', file: null, globalDocId: null } : i
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-5 p-10">
              <div className="text-[80px]">🎉</div>
              <h1 className="text-3xl font-extrabold text-[var(--color-success)]">Pengunggahan Selesai!</h1>
              <p className="text-lg text-[var(--color-text-muted)] leading-[1.7]">
                <strong>{filledCount} dari {totalCount}</strong> dokumen berhasil diunggah untuk{' '}
                <strong>{prodiList.find(p => p.id == selectedProdi)?.nama}</strong>.
              </p>
              {filledCount < totalCount && (
                <div className="py-4 px-5 bg-[var(--color-warning-light)] border border-[rgba(194,120,3,0.3)] rounded-lg text-base text-[var(--color-warning)] font-semibold">
                  ⚠️ {totalCount - filledCount} dokumen belum diunggah. Anda masih bisa melengkapinya nanti.
                </div>
              )}
              <div className="flex gap-4 mt-3">
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
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-[560px] w-full animate-[scaleIn_0.2s_ease]">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <span className="inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] py-1 px-[10px] rounded-sm text-xs font-bold mb-2">{modalIndicator.kode}</span>
                <h2 id="upload-modal-title" className="text-xl font-bold text-[var(--color-text)] mb-2">{modalIndicator.nama}</h2>
                <p className="text-sm text-[var(--color-text-muted)] leading-[1.6]">{modalIndicator.help}</p>
                <div className="flex items-center gap-2 mt-3 py-2 px-3 bg-red-50 border border-red-200 rounded-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p className="text-xs text-red-600 font-semibold">Hanya file <strong>PDF</strong> yang diterima. Maksimal <strong>10MB</strong> per file.</p>
                </div>
              </div>
              <button
                className="shrink-0 w-9 h-9 rounded-md flex items-center justify-center text-[var(--color-text-light)] transition-colors cursor-pointer bg-transparent border-none hover:not(:disabled):bg-[var(--color-bg)] hover:not(:disabled):text-[var(--color-text)]"
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
              <div className="flex flex-col items-center gap-4 p-8 text-center text-lg font-semibold text-[var(--color-text)]">
                <div className="spinner" aria-hidden="true" />
                <p>Sedang mengunggah dokumen...</p>
                <p className="text-sm text-[var(--color-text-muted)] font-normal">Mohon tunggu, jangan tutup jendela ini</p>
              </div>
            ) : (
              <div
                className={`group border-[3px] border-dashed border-[var(--color-border)] rounded-xl py-10 px-6 text-center cursor-pointer transition-all flex flex-col items-center gap-3 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2 focus-visible:border-[var(--color-primary)] focus-visible:bg-[var(--color-primary-light)] ${dragOver ? '!border-[var(--color-primary)] !bg-[var(--color-primary-light)] scale-[1.01]' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                aria-label="Area drag and drop untuk mengunggah file"
              >
                <div className={`text-[var(--color-primary)] opacity-70 transition-transform ${dragOver ? 'opacity-100 -translate-y-1' : ''}`} aria-hidden="true">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p className="text-xl font-bold text-[var(--color-text)]">
                  {dragOver ? '✓ Lepaskan file di sini' : 'Seret & Lepas file di sini'}
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">atau klik untuk memilih file dari komputer</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  <span className="badge badge-danger" style={{ fontWeight: 700 }}>PDF Only</span>
                  <span className="badge badge-info">Maks. 10MB</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">⚠️ Hanya format PDF yang diterima. File selain PDF akan ditolak.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="absolute opacity-0 w-0 h-0 pointer-events-none"
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
            { label: currentStep === 1 ? 'Pilih Prodi' : prodiList.find(p => p.id == selectedProdi)?.nama, href: '/upload' },
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
            <div className={`card max-w-[720px]`}>
              <h2 className="card-title">Pilih Program Studi</h2>
              <p className="text-base text-[var(--color-text-muted)] mb-6 leading-[1.7]">
                Pilih program studi yang akan Anda lengkapi dokumennya. Pastikan Anda hanya mengunggah dokumen untuk prodi yang menjadi tanggung jawab Anda.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {prodiList.map((prodi) => (
                  <label
                    key={prodi.id}
                    className={`flex items-center gap-3 px-5 py-4 border-2 border-[var(--color-border)] rounded-lg cursor-pointer transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] ${selectedProdi == prodi.id ? '!border-[var(--color-primary)] !bg-[var(--color-primary-light)] shadow-[0_0_0_3px_rgba(26,86,219,0.15)]' : ''}`}
                  >
                    <input
                      type="radio"
                      name="prodi"
                      value={prodi.id}
                      checked={selectedProdi == prodi.id}
                      onChange={() => setSelectedProdi(prodi.id)}
                      className="absolute opacity-0 w-0 h-0"
                      aria-label={`Pilih prodi ${prodi.nama}`}
                    />
                    <span className={`w-[26px] h-[26px] rounded-full border-2 border-[var(--color-border)] flex items-center justify-center font-bold text-sm shrink-0 transition-all text-transparent ${selectedProdi == prodi.id ? '!bg-[var(--color-primary)] !border-[var(--color-primary)] !text-white' : ''}`} aria-hidden="true">
                      {selectedProdi == prodi.id ? '✓' : ''}
                    </span>
                    <span className={`text-base font-semibold text-[var(--color-text)] ${selectedProdi == prodi.id ? '!text-[var(--color-primary)]' : ''}`}>{prodi.nama}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end">
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
              <div className={`card`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-[var(--color-text)]">{prodiList.find(p => p.id == selectedProdi)?.nama}</div>
                    <div className="text-base text-[var(--color-text-muted)] mt-1">
                      <span className="font-extrabold text-[var(--color-primary)] text-xl">{filledCount}</span> dari {totalCount} dokumen diunggah
                    </div>
                  </div>
                  <div className="text-[42px] font-extrabold text-[var(--color-primary)] tracking-[-0.02em]">{pct}%</div>
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
                      {indicators.map((ind, i) => {
                        const originalDoc = docList.find(d => d.id === ind.id);
                        const cat = categoryList.find(c => c.id == originalDoc?.document_category_id);
                        const catName = cat ? cat.name : 'Tanpa Kategori / Lainnya';
                        return (
                        <tr
                          key={ind.id}
                          className={ind.status === 'done' ? '!bg-[rgba(5,122,85,0.03)]' : '!bg-transparent'}
                        >
                          <td>{i + 1}</td>
                          <td>
                            <span className="bg-[var(--color-primary-light)] text-[var(--color-primary)] px-2 py-1 rounded-sm text-xs font-bold whitespace-nowrap">{ind.kode}</span>
                          </td>
                          <td>
                            <span className="text-base font-medium">{ind.nama}</span>
                            <div className="text-xs text-[var(--color-text-muted)] mt-1">{catName}</div>
                          </td>
                          <td>
                            <HelpTooltip title={ind.kode} content={ind.help} />
                          </td>
                          <td>
                            {ind.status === 'done' ? (
                              <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                                <span className="badge badge-success">✔ Selesai</span>
                                {docEvaluations?.[`mutu-${ind.globalDocId}`] && (
                                  <span className={`badge badge-${docEvaluations[`mutu-${ind.globalDocId}`].status === 'warning' ? 'warning' : 'success'}`}>
                                    {docEvaluations[`mutu-${ind.globalDocId}`].status === 'warning' ? '⚠️ Perlu Revisi' : '✅ Lulus'}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="badge badge-danger">✕ Belum Diunggah</span>
                            )}
                          </td>
                          <td>
                            {ind.file ? (
                              <div className="flex items-center gap-1 max-w-[200px]">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                                </svg>
                                <span className="text-xs text-[var(--color-text-muted)] overflow-hidden text-ellipsis whitespace-nowrap flex-1" title={ind.file.name}>{ind.file.name}</span>
                                <span className="text-xs text-[var(--color-text-light)] shrink-0">{formatSize(ind.file.size)}</span>
                              </div>
                            ) : (
                              <span className="text-muted" style={{fontSize:'var(--font-size-sm)'}}>—</span>
                            )}
                          </td>
                          <td>
                            <div className="flex gap-2 items-center">
                              {ind.status === 'done' ? (
                                <>
                                  {docEvaluations?.[`mutu-${ind.globalDocId}`] && (
                                    <button
                                      className={`btn btn-sm ${docEvaluations[`mutu-${ind.globalDocId}`].status === 'warning' ? 'btn-warning' : 'btn-outline'}`}
                                      onClick={() => setActiveFeedback(docEvaluations[`mutu-${ind.globalDocId}`])}
                                      aria-label="Lihat Catatan Auditor"
                                    >
                                      Lihat Feedback
                                    </button>
                                  )}
                                  <a
                                    href={ind.file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-outline text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                                    title="Lihat Dokumen"
                                  >
                                    Lihat
                                  </a>
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
                                  className={`btn btn-sm btn-primary !font-bold`}
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center mt-6 pt-5 border-t border-[var(--color-border)]">
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
      
      {/* Feedback Modal */}
      {activeFeedback && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]"
          onClick={(e) => { if (e.target === e.currentTarget) setActiveFeedback(null); }}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-[540px] w-full p-6 sm:p-8 animate-[scaleIn_0.2s_ease]">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeFeedback.status === 'warning' ? 'bg-[var(--color-warning-light)] text-[var(--color-warning)]' : 'bg-[var(--color-success-light)] text-[var(--color-success)]'}`}>
                  {activeFeedback.status === 'warning' ? '⚠️' : '✅'}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--color-text)] leading-tight m-0">
                    Feedback Auditor
                  </h2>
                  <p className="text-sm font-semibold text-[var(--color-text-muted)] mt-1 mb-0">
                    {activeFeedback.status === 'warning' ? 'Status: Perlu Revisi' : 'Status: Lulus (Memenuhi Standar)'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveFeedback(null)} 
                className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--color-text-light)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] transition-colors"
                aria-label="Tutup"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <div className="flex items-center gap-6 mb-6 pb-5 border-b border-[var(--color-border)]">
              <div>
                <p className="text-xs font-bold text-[var(--color-text-light)] uppercase tracking-wider mb-1">Dinilai oleh</p>
                <p className="text-sm font-semibold text-[var(--color-text)] m-0">{activeFeedback.auditor}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-text-light)] uppercase tracking-wider mb-1">Total Skor</p>
                <p className="text-sm font-extrabold text-[var(--color-primary)] m-0">{activeFeedback.score} <span className="text-[var(--color-text-muted)] font-medium">/ {activeFeedback.maxScore}</span></p>
              </div>
            </div>
            
            <div className="bg-[var(--color-bg)] rounded-lg p-5 mb-4 border border-[var(--color-border)]">
              <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Temuan Standar:
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed m-0 whitespace-pre-wrap">
                {activeFeedback.temuan || 'Tidak ada temuan spesifik yang dicatat oleh auditor.'}
              </p>
            </div>
            
            <div className="bg-[#FAFBFE] rounded-lg p-5 mb-6 border border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Catatan & Rekomendasi:
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed m-0 whitespace-pre-wrap">
                {activeFeedback.catatan || 'Tidak ada catatan perbaikan tambahan.'}
              </p>
            </div>
            
            <div className="flex justify-end mt-2">
              <button className="btn btn-primary px-8" onClick={() => setActiveFeedback(null)}>Mengerti</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
