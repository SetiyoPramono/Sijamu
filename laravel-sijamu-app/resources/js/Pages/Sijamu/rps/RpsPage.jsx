'use client';

import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { ToastContainer, addToast } from '@/components/Toast';
import { useRps } from '@/context/RpsContext';
import { usePeriod } from '@/context/PeriodContext';
import { useEvaluation } from '@/context/EvaluationContext';
import { useState, useRef } from 'react';

/** Format bytes to human-readable string */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Format ISO date to local */
function formatDate(iso) {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const ACCEPTED = '.pdf';

export default function RpsPage() {
  const { courses, uploadRpsFile, removeRpsFile } = useRps();
  const { activePeriod, isArchive } = usePeriod();
  const { docEvaluations } = useEvaluation();

  const [activeCourseId, setActiveCourseId] = useState(courses[0]?.id ?? null);
  const [dragging, setDragging]             = useState(false);
  const [previewUrl, setPreviewUrl]         = useState(null);
  const [activeFeedback, setActiveFeedback] = useState(null);
  const fileInputRef                        = useRef(null);

  const activeCourse = courses.find((c) => c.id === activeCourseId) ?? courses[0];

  /* ── Upload handler ───────────────────────────── */
  const handleFiles = (files) => {
    if (!files || files.length === 0 || !activeCourse) return;
    
    const maxMb = 20;
    const validFiles = Array.from(files).filter(file => {
      if (file.size > maxMb * 1024 * 1024) {
        addToast(`File "${file.name}" terlalu besar. Maksimal ${maxMb} MB.`, 'error');
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      uploadRpsFile(activeCourse.id, validFiles);
      addToast(`${validFiles.length} file berhasil diunggah untuk ${activeCourse.name}.`, 'success');
    }
  };

  const onInputChange = (e) => {
    const files = e.target.files;
    if (files) handleFiles(files);
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files) handleFiles(files);
  };

  const handleRemove = (fileId) => {
    removeRpsFile(activeCourse.id, fileId);
    addToast('File RPS berhasil dihapus.', 'success');
  };

  /* ── Render ───────────────────────────────────── */
  if (courses.length === 0) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <div className="page-wrapper">
            <div className="flex flex-col items-center justify-center text-center gap-4 p-10 text-[var(--color-text-muted)] min-h-[60vh]">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <h2 className="text-xl font-bold text-[var(--color-text)]">Belum ada mata kuliah</h2>
              <p className="text-base max-w-[360px]">Tambahkan mata kuliah terlebih dahulu di halaman <strong>Manajemen RPS</strong>.</p>
              <a href="/admin/rps" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
                Buka Manajemen RPS
              </a>
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

      <main className="main-content">
        <div className="page-wrapper">
          <Breadcrumb items={[
            { label: 'Beranda', href: '/dashboard' },
            { label: 'RPS', href: '/rps' },
            { label: activeCourse?.name ?? '—' },
          ]} />

          <div className="page-header flex items-center justify-between">
            <div>
              <h1 className="page-title">Rencana Pembelajaran Semester</h1>
              <p className="page-subtitle">
                Periode Aktif: <strong>{activePeriod.name} {activePeriod.semester}</strong> 
                {isArchive ? ' (Arsip)' : ''}
              </p>
            </div>
            {activeCourse?.rpsFiles?.length > 0 && (
              <a
                href={activeCourse.rpsFiles[0].url}
                download={activeCourse.rpsFiles[0].name}
                className="btn btn-success"
                aria-label="Unduh RPS Utama"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Unduh RPS Utama
              </a>
            )}
          </div>

          {isArchive && (
            <div style={{
              background: '#fff8e1', borderLeft: '4px solid #ffb300', padding: '1rem',
              borderRadius: '6px', color: '#8f6200', marginBottom: '1.5rem', display: 'flex', gap: '8px'
            }}>
              <span>ℹ️</span>
              <div>
                <strong>Anda sedang melihat data arsip.</strong><br/>
                Data pada semester ini bersifat Read-Only (Hanya Baca). Fungsi unggah dan hapus dokumen dinonaktifkan.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
            {/* ── Sidebar: daftar MK ─────────────────────── */}
            <aside className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm overflow-hidden lg:sticky top-6" aria-label="Daftar mata kuliah">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] font-bold text-sm uppercase tracking-[0.05em] text-[var(--color-text-muted)] bg-[#F9FAFB]">
                <span>Mata Kuliah</span>
                <span className="badge badge-info">{courses.length}</span>
              </div>
              <ul className="list-none py-2 max-h-[70vh] overflow-y-auto m-0 p-0">
                {courses.map((mk) => (
                  <li key={mk.id}>
                    <button
                      className={`flex items-center gap-3 w-full px-5 py-3 bg-transparent border-none cursor-pointer text-left font-[var(--font-base)] transition-colors border-l-[3px] border-transparent hover:bg-[var(--color-bg)] ${activeCourseId === mk.id ? '!bg-[var(--color-primary-light)] !border-l-[var(--color-primary)]' : ''}`}
                      onClick={() => setActiveCourseId(mk.id)}
                      aria-current={activeCourseId === mk.id ? 'true' : undefined}
                    >
                      <span className={`shrink-0 text-xs font-bold text-white py-[3px] px-2 rounded-sm font-mono tracking-[0.04em] ${activeCourseId === mk.id ? 'bg-[var(--color-primary-dark)]' : 'bg-[var(--color-primary)]'}`}>{mk.code}</span>
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-[var(--color-text)] whitespace-nowrap overflow-hidden text-ellipsis">{mk.name}</span>
                        <span className="block text-xs text-[var(--color-text-muted)] mt-[2px]">{mk.prodi} · Smt {mk.semester}</span>
                      </div>
                      {mk.rpsFiles && mk.rpsFiles.length > 0 && (
                        <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
                          <span style={{fontSize:'12px', fontWeight:600, color:'var(--color-success)'}}>{mk.rpsFiles.length}</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="File tersedia" title="File RPS tersedia">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      )}
                    </button>

                  </li>
                ))}
              </ul>
            </aside>

            {/* ── Main panel ─────────────────────────────── */}
            {activeCourse && (
              <div className="min-w-0">
                {/* Info card */}
                <div className="card px-6 py-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Kode MK</span>
                      <span className="text-base font-bold text-[var(--color-text)]">{activeCourse.code}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Nama Mata Kuliah</span>
                      <span className="text-base font-bold text-[var(--color-text)]">{activeCourse.name}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">SKS</span>
                      <span className="text-base font-bold text-[var(--color-text)]">{activeCourse.sks} SKS</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Semester</span>
                      <span className="text-base font-bold text-[var(--color-text)]">Semester {activeCourse.semester}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Dosen Pengampu</span>
                      <span className="text-base font-bold text-[var(--color-text)]">{activeCourse.dosen || '—'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Program Studi</span>
                      <span className="text-base font-bold text-[var(--color-text)]">{activeCourse.prodi || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Upload area */}
                <div className="card mt-6">
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)'}}>
                    <h2 className="card-title" style={{marginBottom: 0}}>Dokumen RPS</h2>
                    {!isArchive && activeCourse.rpsFiles && activeCourse.rpsFiles.length > 0 && (
                      <button className="btn btn-sm btn-outline" onClick={() => fileInputRef.current?.click()}>
                        + Tambah Dokumen
                      </button>
                    )}
                  </div>

                  {activeCourse.rpsFiles && activeCourse.rpsFiles.length > 0 ? (
                    /* ── List of files ── */
                    <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-3)'}}>
                      {activeCourse.rpsFiles.map(file => {
                        const fileId = file.id || `rps-${activeCourse.id}-${file.name}`;
                        const evalData = docEvaluations?.[fileId];

                        return (
                          <div key={file.id} className="flex items-center gap-5 px-6 py-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg flex-wrap max-sm:flex-col max-sm:items-start">
                            <div className="shrink-0 text-[var(--color-primary)] bg-[var(--color-primary-light)] p-3 rounded-md" aria-hidden="true">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 8 9"/>
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                <p className="text-base font-bold text-[var(--color-text)] break-all" style={{marginBottom:0}}>{file.name}</p>
                                {evalData && (
                                  <span className={`badge badge-${evalData.status === 'warning' ? 'warning' : 'success'}`}>
                                    {evalData.status === 'warning' ? '⚠️ Perlu Revisi' : '✅ Lulus'}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                {formatBytes(file.size)} &nbsp;·&nbsp;
                                Diunggah {formatDate(file.uploadedAt)}
                              </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              {evalData?.status === 'warning' && (
                                <button
                                  className="btn btn-sm btn-warning"
                                  onClick={() => setActiveFeedback(evalData)}
                                  aria-label="Lihat Feedback Auditor"
                                >
                                  Lihat Feedback
                                </button>
                              )}
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => setPreviewUrl(file.url)}
                                aria-label="Preview file RPS"
                              >
                                Baca
                              </button>
                            <a
                              href={file.url}
                              download={file.name}
                              className="btn btn-sm btn-outline"
                              aria-label="Unduh file RPS"
                            >
                              Unduh
                            </a>
                            {!isArchive && (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRemove(file.id)}
                                aria-label="Hapus file RPS"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </div>
                        );
                      })}
                      {!isArchive && (
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept={ACCEPTED}
                          onChange={onInputChange}
                          style={{ display: 'none' }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  ) : (
                    /* ── Drop zone ── */
                    isArchive ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                        Belum ada dokumen RPS yang diunggah pada periode ini.
                      </div>
                    ) : (
                      <div
                      className={`group flex flex-col items-center justify-center gap-3 py-10 px-6 border-2 border-dashed border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] cursor-pointer transition-colors text-center outline-none hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] focus-visible:border-[var(--color-primary)] focus-visible:bg-[var(--color-primary-light)] ${dragging ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] scale-[1.01]' : ''}`}
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={onDrop}
                      role="button"
                      tabIndex={0}
                      aria-label="Area unggah file RPS. Klik atau seret file ke sini."
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                    >
                      <div className={`mb-2 transition-colors ${dragging ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]'}`} aria-hidden="true">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                      </div>
                      <p className="text-lg font-bold text-[var(--color-text)]">
                        {dragging ? 'Lepaskan file di sini…' : 'Seret & lepas file RPS ke sini'}
                      </p>
                      <p className="text-base text-[var(--color-text-muted)]">
                        atau klik untuk memilih file
                      </p>
                      <p className="text-sm text-[var(--color-text-light)] mt-1">
                        Format wajib: PDF &nbsp;·&nbsp; Maks. 20 MB
                      </p>
                      <button
                        type="button"
                        className={`btn btn-primary mt-3 pointer-events-none`}
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Pilih File
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED}
                        onChange={onInputChange}
                        style={{ display: 'none' }}
                        aria-hidden="true"
                      />
                    </div>
                  )
                )}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {previewUrl && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', padding: '1.5rem'
        }}>
          <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem'}}>
            <button 
              onClick={() => setPreviewUrl(null)} 
              aria-label="Tutup Preview"
              style={{
                background: 'transparent', border: 'none', color: '#fff', 
                cursor: 'pointer', padding: '8px', display: 'flex', 
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <iframe 
            src={previewUrl} 
            title="PDF Preview"
            style={{flex: 1, width: '100%', border: 'none', borderRadius: '8px', backgroundColor: '#fff'}}
          />
        </div>
      )}
      
      {activeFeedback && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', padding: '2rem' }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
              <h2 style={{margin:0, fontSize:'1.25rem', color:'var(--color-danger)'}}>⚠️ Catatan Revisi Auditor</h2>
              <button 
                onClick={() => setActiveFeedback(null)} 
                className="btn btn-sm btn-ghost"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>
            <div style={{marginBottom: '1rem'}}>
              <p style={{fontSize:'0.875rem', color:'var(--color-text-muted)', marginBottom:'4px'}}>Dinilai oleh: {activeFeedback.auditor}</p>
              <p style={{fontSize:'0.875rem', color:'var(--color-text-muted)'}}>Skor: {activeFeedback.score} / {activeFeedback.maxScore}</p>
            </div>
            
            <div style={{marginBottom: '1rem', background:'var(--color-background-alt)', padding:'1rem', borderRadius:'8px'}}>
              <h3 style={{fontSize:'0.875rem', fontWeight:600, marginBottom:'8px'}}>Temuan:</h3>
              <p style={{fontSize:'0.875rem', whiteSpace:'pre-wrap'}}>{activeFeedback.temuan || 'Tidak ada temuan spesifik.'}</p>
            </div>
            
            <div style={{marginBottom: '1.5rem', background:'var(--color-background-alt)', padding:'1rem', borderRadius:'8px'}}>
              <h3 style={{fontSize:'0.875rem', fontWeight:600, marginBottom:'8px'}}>Catatan Perbaikan:</h3>
              <p style={{fontSize:'0.875rem', whiteSpace:'pre-wrap'}}>{activeFeedback.catatan || 'Tidak ada catatan.'}</p>
            </div>
            
            <div style={{textAlign:'right'}}>
              <button className="btn btn-primary" onClick={() => setActiveFeedback(null)}>Mengerti</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
