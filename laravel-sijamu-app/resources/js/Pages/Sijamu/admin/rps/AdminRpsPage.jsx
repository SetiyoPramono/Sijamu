'use client';

import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { ToastContainer, addToast } from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import { useRps } from '@/context/RpsContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

const emptyForm = { code: '', name: '', sks: '', semester: '', user_id: '', study_program_id: '' };

export default function AdminRpsPage() {
  const { courses, addCourse, updateCourse, deleteCourse } = useRps();

  const [formData, setFormData]   = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [deleteId, setDeleteId]   = useState(null);
  const [search, setSearch]       = useState('');
  
  const [prodis, setProdis] = useState([]);
  const [users, setUsers] = useState([]);
  const [viewFilesFor, setViewFilesFor] = useState(null); // course object for modal

  useEffect(() => {
    axios.get('/admin/api/prodis').then(res => setProdis(res.data)).catch(() => {});
    axios.get('/admin/api/users').then(res => setUsers(res.data)).catch(() => {});
  }, []);

  const filtered = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.prodi.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateCourse(formData);
        addToast(`RPS "${formData.name}" berhasil diperbarui.`, 'success');
        setIsEditing(false);
      } else {
        await addCourse(formData);
        addToast(`Mata kuliah "${formData.name}" berhasil ditambahkan.`, 'success');
      }
    } catch {
      addToast('Gagal menyimpan mata kuliah.', 'error');
    }
    setFormData(emptyForm);
    setShowForm(false);
  };

  const handleEdit = (course) => {
    setFormData(course);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = async () => {
    const name = courses.find((c) => c.id === deleteId)?.name || '';
    try {
      await deleteCourse(deleteId);
      addToast(`"${name}" berhasil dihapus.`, 'success');
    } catch {
      addToast('Gagal menghapus mata kuliah.', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setIsEditing(false);
    setShowForm(false);
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <ToastContainer />
      <ConfirmModal
        isOpen={!!deleteId}
        title="Hapus Mata Kuliah"
        message={`Apakah Anda yakin ingin menghapus RPS "${courses.find((c) => c.id === deleteId)?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      <main className="main-content">
        <div className="page-wrapper">
          <Breadcrumb items={[
            { label: 'Beranda',       href: '/dashboard' },
            { label: 'Administrasi' },
            { label: 'Manajemen RPS', href: '/admin/rps' },
          ]} />

          {/* ── Page Header ─── */}
          <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '24px', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start', textAlign: 'left' }}>
              <div>
                <h1 className="page-title">Manajemen RPS</h1>
                <p className="page-subtitle">Kelola Rencana Pembelajaran Semester untuk seluruh mata kuliah</p>
              </div>
              {!showForm && (
                <button
                  className="btn btn-primary"
                  onClick={() => { setShowForm(true); setIsEditing(false); setFormData(emptyForm); }}
                  aria-label="Tambah mata kuliah baru"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Tambah Mata Kuliah
                </button>
              )}
            </div>

            {/* ── Summary Stats (Moved to Header Right) ─── */}
            <div style={{ flex: '0 0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div className="card flex flex-col items-center justify-center gap-1 p-4 text-center">
                <div className="text-3xl font-extrabold text-[var(--color-primary)] leading-none">{courses.length}</div>
                <div className="text-sm text-[var(--color-text-muted)] font-medium">Total Mata Kuliah</div>
              </div>
              <div className="card flex flex-col items-center justify-center gap-1 p-4 text-center">
                <div className="text-3xl font-extrabold text-[var(--color-primary)] leading-none">{[...new Set(courses.map((c) => c.prodi))].length}</div>
                <div className="text-sm text-[var(--color-text-muted)] font-medium">Program Studi</div>
              </div>
              <div className="card flex flex-col items-center justify-center gap-1 p-4 text-center">
                <div className="text-3xl font-extrabold text-[var(--color-primary)] leading-none">{courses.filter((c) => c.rpsFiles && c.rpsFiles.length > 0).length}</div>
                <div className="text-sm text-[var(--color-text-muted)] font-medium">Sudah Upload RPS</div>
              </div>
              <div className="card flex flex-col items-center justify-center gap-1 p-4 text-center">
                <div className="text-3xl font-extrabold text-[var(--color-primary)] leading-none">{courses.reduce((s, c) => s + c.sks, 0)}</div>
                <div className="text-sm text-[var(--color-text-muted)] font-medium">Total SKS</div>
              </div>
            </div>
          </div>

          {/* ── Form Card ─── */}
          {showForm && (
            <div className="card mb-6 border-t-[3px] border-[var(--color-primary)]">
              <h2 className="card-title">
                {isEditing ? `Edit RPS — ${formData.name}` : 'Tambah Mata Kuliah Baru'}
              </h2>
              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="form-group">
                    <label className="form-label" htmlFor="rps-code">Kode Mata Kuliah</label>
                    <input id="rps-code" name="code" className="form-input"
                      placeholder="Misal: MK101"
                      value={formData.code} onChange={handleChange} required />
                  </div>

                  <div className="form-group md:col-span-1 lg:col-span-2">
                    <label className="form-label" htmlFor="rps-name">Nama Mata Kuliah</label>
                    <input id="rps-name" name="name" className="form-input"
                      placeholder="Nama lengkap mata kuliah"
                      value={formData.name} onChange={handleChange} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="rps-sks">SKS</label>
                    <input id="rps-sks" name="sks" type="number" className="form-input"
                      min="1" max="6" placeholder="Jumlah SKS"
                      value={formData.sks} onChange={handleChange} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="rps-semester">Semester</label>
                    <input id="rps-semester" name="semester" type="number" className="form-input"
                      min="1" max="8" placeholder="Nomor Semester"
                      value={formData.semester} onChange={handleChange} required />
                  </div>

                  <div className="form-group md:col-span-1 lg:col-span-2">
                    <label className="form-label" htmlFor="rps-dosen">Dosen Pengampu</label>
                    <select id="rps-dosen" name="user_id" className="form-input"
                      value={formData.user_id || ''} onChange={handleChange} required>
                      <option value="">-- Pilih Dosen Pengampu --</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                    </select>
                  </div>

                  <div className="form-group md:col-span-1 lg:col-span-2">
                    <label className="form-label" htmlFor="rps-prodi">Program Studi</label>
                    <select id="rps-prodi" name="study_program_id" className="form-input"
                      value={formData.study_program_id || ''} onChange={handleChange} required>
                      <option value="">-- Pilih Program Studi --</option>
                      {prodis.map(p => <option key={p.id} value={p.id}>{p.name || p.nama}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                  <button type="button" className="btn btn-ghost" onClick={handleCancel}>
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    {isEditing ? 'Simpan Perubahan' : 'Simpan Mata Kuliah'}
                  </button>
                </div>
              </form>
            </div>
          )}



          {/* ── Table Card ─── */}
          <div className="card mt-6">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', paddingLeft: '16px', paddingRight: '16px' }}>
              <h2 className="card-title" style={{ marginBottom: 0 }}>Daftar Mata Kuliah</h2>
              <div className="relative flex items-center">
                <svg className="absolute left-3.5 text-gray-400 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="py-2.5 pr-4 pl-10 border-2 border-[var(--color-border)] rounded-md font-sans text-sm text-[var(--color-text)] bg-[var(--color-white)] transition-all focus:outline-none focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary-light)]"
                  style={{ width: '280px', maxWidth: '100%' }}
                  placeholder="Cari kode, nama, atau prodi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Cari mata kuliah"
                />
              </div>
            </div>

            <div className="table-wrapper mt-4">
              <table className="data-table" aria-label="Tabel daftar RPS mata kuliah">
                <thead>
                  <tr>
                    <th scope="col">Kode</th>
                    <th scope="col">Nama Mata Kuliah</th>
                    <th scope="col">Program Studi</th>
                    <th scope="col">Dosen Pengampu</th>
                    <th scope="col" style={{ textAlign: 'center' }}>SKS</th>
                    <th scope="col" style={{ textAlign: 'center' }}>Smt</th>
                    <th scope="col" style={{ textAlign: 'center' }}>File RPS</th>
                    <th scope="col" style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center p-10">
                        <div className="flex flex-col items-center gap-3 text-[var(--color-text-muted)] text-base">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--color-border)' }}>
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                          </svg>
                          <p>Tidak ada data mata kuliah ditemukan.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((course) => (
                      <tr key={course.id}>
                        <td><span className="inline-flex items-center py-1 px-2.5 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-sm text-sm font-bold tracking-wider font-mono">{course.code}</span></td>
                        <td><strong>{course.name}</strong></td>
                        <td className="text-muted">{course.prodi}</td>
                        <td className="text-muted">{course.dosen}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-info">{course.sks}</span>
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                          {course.semester}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {course.rpsFiles && course.rpsFiles.length > 0 ? (
                            <button
                              className="badge badge-success cursor-pointer hover:opacity-80 transition-opacity"
                              style={{ border: 'none', background: 'var(--color-success-light, #d1fae5)', color: 'var(--color-success, #059669)', cursor: 'pointer' }}
                              onClick={() => setViewFilesFor(course)}
                              title="Klik untuk melihat daftar file RPS"
                            >
                              📄 {course.rpsFiles.length} File
                            </button>
                          ) : (
                            <span className="badge badge-danger">✕ Belum Ada</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="flex flex-col md:flex-row gap-2 justify-center">
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => handleEdit(course)}
                              aria-label={`Edit ${course.name}`}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => setDeleteId(course.id)}
                              aria-label={`Hapus ${course.name}`}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6"/><path d="M14 11v6"/>
                                <path d="M9 6V4h6v2"/>
                              </svg>
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* ── Modal: Lihat File RPS ─── */}
      {viewFilesFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setViewFilesFor(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-text)]">
                  📄 File RPS — {viewFilesFor.name}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                  Kode: <strong className="font-mono">{viewFilesFor.code}</strong> &bull; {viewFilesFor.prodi}
                </p>
              </div>
              <button
                onClick={() => setViewFilesFor(null)}
                className="text-[var(--color-text-light)] hover:text-[var(--color-text)] transition-colors p-1"
                aria-label="Tutup"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* File List */}
            {viewFilesFor.rpsFiles && viewFilesFor.rpsFiles.length > 0 ? (
              <ul className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                {viewFilesFor.rpsFiles.map((file, i) => (
                  <li
                    key={file.id ?? i}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-all"
                  >
                    {/* PDF Icon */}
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="9" y1="13" x2="15" y2="13"/>
                        <line x1="9" y1="17" x2="15" y2="17"/>
                      </svg>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text)] truncate">{file.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {file.uploader && <span>Diunggah oleh <strong>{file.uploader}</strong> &bull; </span>}
                        {new Date(file.uploadedAt).toLocaleString('id-ID', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </p>
                      {file.status && (
                        <span className={`badge ${file.status === 'audited' ? 'badge-success' : file.status === 'revision' ? 'badge-danger' : 'badge-info'} text-xs mt-1`}>
                          {file.status === 'pending' ? 'Menunggu' : file.status === 'audited' ? 'Disetujui' : 'Perlu Revisi'}
                        </span>
                      )}
                    </div>

                    {/* Download/View Button */}
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline shrink-0"
                      title="Buka/Unduh file"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      Buka
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-[var(--color-text-muted)]">
                <p>Belum ada file RPS yang diunggah untuk mata kuliah ini.</p>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button className="btn btn-ghost" onClick={() => setViewFilesFor(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
