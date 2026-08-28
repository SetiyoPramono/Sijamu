'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import ConfirmModal from '@/components/ConfirmModal';
import { ToastContainer, addToast } from '@/components/Toast';
import { usePeriod } from '@/context/PeriodContext';

export default function AdminPeriodsPage() {
  const { periods, setPeriods, setActivePeriodId } = usePeriod();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const EMPTY_FORM = { name: '', semester: 'Ganjil' };
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  // ── Stats ───────────────────────────────────────────────────────────
  const totalPeriods  = periods.length;
  const totalAktif    = periods.filter(p => p.isCurrent).length;
  const totalArsip    = periods.filter(p => !p.isCurrent).length;

  // ── Filter ──────────────────────────────────────────────────────────
  const filtered = useMemo(() =>
    periods.filter(p =>
      `${p.name} ${p.semester}`.toLowerCase().includes(search.toLowerCase())
    ),
    [periods, search]
  );

  // ── Modal helpers ───────────────────────────────────────────────────
  const openModal = (period = null) => {
    setFormErrors({});
    if (period) {
      setEditId(period.id);
      setForm({ name: period.name, semester: period.semester });
    } else {
      setEditId(null);
      setForm(EMPTY_FORM);
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    const errors = {};
    const nameTrimmed = form.name.trim();
    
    // 1. Validasi Kehadiran & Regex Format YYYY/YYYY
    if (!nameTrimmed) {
      errors.name = 'Tahun ajaran wajib diisi (contoh: 2026/2027)';
    } else {
      const yearPattern = /^\d{4}\/\d{4}$/;
      if (!yearPattern.test(nameTrimmed)) {
        errors.name = 'Format harus YYYY/YYYY (contoh: 2026/2027)';
      }
    }
    
    if (!form.semester) errors.semester = 'Semester wajib dipilih';

    // 2. Cek Duplikasi (Tahun Ajaran + Semester)
    if (!errors.name && !errors.semester) {
      const isDuplicate = periods.some(p => 
        p.name === nameTrimmed && 
        p.semester === form.semester && 
        p.id !== editId
      );
      if (isDuplicate) {
        errors.name = 'Periode dengan tahun ajaran dan semester ini sudah ada';
      }
    }

    if (Object.keys(errors).length > 0) { 
      setFormErrors(errors); 
      return; 
    }

    const finalForm = { ...form, name: nameTrimmed };

    if (editId) {
      setPeriods(prev => prev.map(p => p.id === editId ? { ...p, ...finalForm } : p));
      addToast('Berhasil', 'Data periode berhasil diperbarui.', 'success');
    } else {
      // Membersihkan spasi pada ID jika ada
      const newId = `${nameTrimmed.replace(/\s+/g, '').replace('/', '-')}-${form.semester.toLowerCase()}`;
      setPeriods(prev => [{ id: newId, name: nameTrimmed, semester: form.semester, isCurrent: false }, ...prev]);
      addToast('Berhasil', 'Periode baru berhasil ditambahkan.', 'success');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const target = periods.find(p => p.id === deleteTarget);
    if (target?.isCurrent) {
      addToast('Gagal', 'Tidak dapat menghapus periode yang sedang aktif!', 'error');
      setDeleteTarget(null);
      return;
    }
    setPeriods(prev => prev.filter(p => p.id !== deleteTarget));
    addToast('Terhapus', 'Periode berhasil dihapus.', 'success');
    setDeleteTarget(null);
  };

  const setAsActive = (id) => {
    setPeriods(prev => prev.map(p => ({ ...p, isCurrent: p.id === id })));
    setActivePeriodId(id);
    addToast('Diaktifkan', 'Periode berhasil diaktifkan. Seluruh sistem akan mengacu ke periode ini.', 'success');
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      <Sidebar />
      <ToastContainer />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Hapus Periode Akademik"
        message={`Apakah Anda yakin ingin menghapus periode "${periods.find(p => p.id === deleteTarget)?.name} ${periods.find(p => p.id === deleteTarget)?.semester}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <main className="main-content">
        <div className="page-wrapper">
          <Breadcrumb items={[
            { label: 'Beranda',       href: '/dashboard' },
            { label: 'Administrasi' },
            { label: 'Manajemen Periode', href: '/admin/periods' },
          ]} />

          {/* ── Page Header ─── */}
          <div
            className="page-header"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: '24px',
              alignItems: 'flex-start',
              marginBottom: '24px',
            }}
          >
            {/* Title + Button */}
            <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
              <div>
                <h1 className="page-title">Manajemen Periode Akademik</h1>
                <p className="page-subtitle">Kelola pembukaan dan penutupan semester akademik (Ganjil/Genap)</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => openModal()}
                aria-label="Tambah periode akademik baru"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Tambah Periode
              </button>
            </div>

            {/* Summary Stats */}
            <div style={{ flex: '0 0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div className="card flex flex-col items-center justify-center gap-1 p-4 text-center">
                <div className="text-3xl font-extrabold text-[var(--color-primary)] leading-none">{totalPeriods}</div>
                <div className="text-sm text-[var(--color-text-muted)] font-medium">Total Periode</div>
              </div>
              <div className="card flex flex-col items-center justify-center gap-1 p-4 text-center">
                <div className="text-3xl font-extrabold text-emerald-600 leading-none">{totalAktif}</div>
                <div className="text-sm text-[var(--color-text-muted)] font-medium">Periode Aktif</div>
              </div>
              <div className="card flex flex-col items-center justify-center gap-1 p-4 text-center">
                <div className="text-3xl font-extrabold text-gray-400 leading-none">{totalArsip}</div>
                <div className="text-sm text-[var(--color-text-muted)] font-medium">Periode Arsip</div>
              </div>
            </div>
          </div>

          {/* ── Table Card ─── */}
          <div className="card mt-6">
            {/* Toolbar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', paddingLeft: '16px', paddingRight: '16px' }}>
              <h2 className="card-title" style={{ marginBottom: 0 }}>Daftar Periode</h2>
              <div className="relative flex items-center">
                <svg className="absolute left-3.5 text-gray-400 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="py-2.5 pr-4 pl-10 border-2 border-[var(--color-border)] rounded-md font-sans text-sm text-[var(--color-text)] bg-[var(--color-white)] transition-all focus:outline-none focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary-light)]"
                  style={{ width: '260px', maxWidth: '100%' }}
                  placeholder="Cari tahun ajaran atau semester..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Cari periode"
                />
              </div>
            </div>

            <div className="table-wrapper mt-4">
              <table className="data-table" aria-label="Tabel daftar periode akademik">
                <thead>
                  <tr>
                    <th scope="col" style={{ textAlign: 'center', width: '52px' }}>No</th>
                    <th scope="col">Tahun Ajaran</th>
                    <th scope="col">Semester</th>
                    <th scope="col" style={{ textAlign: 'center' }}>Status</th>
                    <th scope="col" style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        {search ? 'Tidak ada periode yang cocok dengan pencarian.' : 'Belum ada data periode.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p, idx) => (
                      <tr key={p.id}>
                        <td style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: 500 }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-text)' }}>{p.name}</td>
                        <td>{p.semester}</td>
                        <td style={{ textAlign: 'center' }}>
                          {p.isCurrent ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EBF2FF] text-[#1A56DB] border border-[#BFDBFE]">
                              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#1A56DB', display: 'inline-block' }}></span>
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#9CA3AF', display: 'inline-block' }}></span>
                              Arsip
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {!p.isCurrent && (
                              <button
                                className="btn btn-sm btn-outline"
                                style={{ color: '#059669', borderColor: '#A7F3D0', backgroundColor: 'transparent' }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ECFDF5'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                onClick={() => setAsActive(p.id)}
                                title="Jadikan periode ini sebagai periode aktif"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                Aktifkan
                              </button>
                            )}
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => openModal(p)}
                              aria-label={`Edit periode ${p.name} ${p.semester}`}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => setDeleteTarget(p.id)}
                              disabled={p.isCurrent}
                              title={p.isCurrent ? 'Periode aktif tidak bisa dihapus' : 'Hapus periode'}
                              aria-label={`Hapus periode ${p.name} ${p.semester}`}
                            >
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

      {/* ── Modal Tambah / Edit ─── */}
      {modalOpen && (
        <div
          className="fade-in"
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
          }}
        >
          <div
            className="scale-in"
            style={{
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              width: '100%',
              maxWidth: '460px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--color-bg-subtle)',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {editId ? 'Edit Periode' : 'Tambah Periode Baru'}
              </h3>
              <button
                style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}
                onClick={() => setModalOpen(false)}
                aria-label="Tutup modal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="period-name">
                  Tahun Ajaran <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  id="period-name"
                  type="text"
                  className={`form-input${formErrors.name ? ' error' : ''}`}
                  placeholder="Contoh: 2026/2027"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  autoComplete="off"
                />
                {formErrors.name && (
                  <p style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>{formErrors.name}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="period-semester">
                  Semester <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <select
                  id="period-semester"
                  className={`form-input${formErrors.semester ? ' error' : ''}`}
                  value={form.semester}
                  onChange={e => setForm({ ...form, semester: e.target.value })}
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                  <option value="Pendek">Pendek</option>
                </select>
                {formErrors.semester && (
                  <p style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>{formErrors.semester}</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              background: 'var(--color-bg-subtle)',
            }}>
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                {editId ? 'Simpan Perubahan' : 'Simpan Periode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
