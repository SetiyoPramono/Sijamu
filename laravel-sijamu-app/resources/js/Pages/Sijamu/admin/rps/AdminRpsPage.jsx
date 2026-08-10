'use client';

import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { ToastContainer, addToast } from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import { useRps } from '@/context/RpsContext';
import { useState } from 'react';

const emptyForm = { code: '', name: '', sks: '', semester: '', dosen: '', prodi: '' };

export default function AdminRpsPage() {
  const { courses, addCourse, updateCourse, deleteCourse } = useRps();

  const [formData, setFormData]   = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [deleteId, setDeleteId]   = useState(null);
  const [search, setSearch]       = useState('');

  const filtered = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.prodi.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateCourse(formData);
      addToast(`RPS "${formData.name}" berhasil diperbarui.`, 'success');
      setIsEditing(false);
    } else {
      addCourse(formData);
      addToast(`Mata kuliah "${formData.name}" berhasil ditambahkan.`, 'success');
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

  const handleDeleteConfirm = () => {
    const name = courses.find((c) => c.id === deleteId)?.name || '';
    deleteCourse(deleteId);
    addToast(`"${name}" berhasil dihapus.`, 'success');
    setDeleteId(null);
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
          <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                    <input id="rps-dosen" name="dosen" className="form-input"
                      placeholder="Nama lengkap & gelar"
                      value={formData.dosen} onChange={handleChange} required />
                  </div>

                  <div className="form-group md:col-span-1 lg:col-span-2">
                    <label className="form-label" htmlFor="rps-prodi">Program Studi</label>
                    <input id="rps-prodi" name="prodi" className="form-input"
                      placeholder="Program Studi"
                      value={formData.prodi} onChange={handleChange} required />
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

          {/* ── Summary Stats ─── */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="card flex flex-col items-center gap-1 p-5 text-center">
              <div className="text-3xl font-extrabold text-[var(--color-primary)] leading-none">{courses.length}</div>
              <div className="text-sm text-[var(--color-text-muted)] font-medium">Total Mata Kuliah</div>
            </div>
            <div className="card flex flex-col items-center gap-1 p-5 text-center">
              <div className="text-3xl font-extrabold text-[var(--color-primary)] leading-none">{[...new Set(courses.map((c) => c.prodi))].length}</div>
              <div className="text-sm text-[var(--color-text-muted)] font-medium">Program Studi</div>
            </div>
            <div className="card flex flex-col items-center gap-1 p-5 text-center">
              <div className="text-3xl font-extrabold text-[var(--color-primary)] leading-none">{courses.filter((c) => c.rpsFiles && c.rpsFiles.length > 0).length}</div>
              <div className="text-sm text-[var(--color-text-muted)] font-medium">Sudah Upload RPS</div>
            </div>
            <div className="card flex flex-col items-center gap-1 p-5 text-center">
              <div className="text-3xl font-extrabold text-[var(--color-primary)] leading-none">{courses.reduce((s, c) => s + c.sks, 0)}</div>
              <div className="text-sm text-[var(--color-text-muted)] font-medium">Total SKS</div>
            </div>
          </div>

          {/* ── Table Card ─── */}
          <div className="card mt-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-0">
              <h2 className="card-title" style={{ marginBottom: 0 }}>Daftar Mata Kuliah</h2>
              <div className="relative flex items-center">
                <svg className="absolute left-3.5 text-gray-400 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="py-2.5 pr-4 pl-10 border-2 border-[var(--color-border)] rounded-md font-sans text-sm text-[var(--color-text)] bg-[var(--color-white)] w-full md:w-[280px] transition-all focus:outline-none focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary-light)]"
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
                            <span className="badge badge-success">{course.rpsFiles.length} File Tersedia</span>
                          ) : (
                            <span className="badge badge-danger">✕ Belum</span>
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
    </div>
  );
}
