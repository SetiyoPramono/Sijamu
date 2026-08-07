// Halaman Manajemen Pengguna (CRUD + Permissions) — route: /admin/users
// CSS ada di: UserManagementPage.module.css
'use client';

import { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import ConfirmModal from '@/components/ConfirmModal';
import { ToastContainer, addToast } from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';
import styles from './UserManagementPage.module.css';

/* ─── Role Mapping ─── */
const ROLE_MAP = {
  'admin': 'Administrator',
  'auditor': 'Auditor / Asesor',
  'dekan': 'Dekan / Pimpinan',
  'koprodi': 'Koordinator Prodi',
  'taskforce': 'Staf / Task Force'
};
const ROLES = Object.keys(ROLE_MAP);

const PERMISSIONS = [
  { key: 'view_dashboard',    label: 'Lihat Dashboard',          group: 'Dashboard' },
  { key: 'view_report',       label: 'Lihat Laporan',            group: 'Dashboard' },
  { key: 'export_report',     label: 'Ekspor Laporan (PDF)',      group: 'Dashboard' },
  { key: 'start_evaluation',  label: 'Mulai Evaluasi',           group: 'Evaluasi' },
  { key: 'submit_evaluation', label: 'Kunci & Kirim Evaluasi',   group: 'Evaluasi' },
  { key: 'edit_evaluation',   label: 'Edit Evaluasi Tersimpan',  group: 'Evaluasi' },
  { key: 'upload_document',   label: 'Unggah Dokumen',           group: 'Dokumen' },
  { key: 'delete_document',   label: 'Hapus Dokumen',            group: 'Dokumen' },
  { key: 'view_document',     label: 'Lihat Dokumen',            group: 'Dokumen' },
  { key: 'view_rps',          label: 'Akses Halaman RPS',        group: 'RPS' },
  { key: 'manage_rps',        label: 'Manajemen Data RPS',       group: 'RPS' },
  { key: 'manage_users',      label: 'Manajemen Pengguna',       group: 'Administrasi' },
  { key: 'manage_roles',      label: 'Kelola Peran & Izin',      group: 'Administrasi' },
  { key: 'system_settings',   label: 'Pengaturan Sistem',        group: 'Administrasi' },
];

const DEFAULT_PERMISSIONS = {
  'admin':        PERMISSIONS.map(p => p.key),
  'auditor':      ['view_dashboard', 'view_report', 'start_evaluation', 'submit_evaluation', 'edit_evaluation', 'view_document', 'view_rps'],
  'dekan':        ['view_dashboard', 'view_report', 'export_report', 'view_document', 'view_rps'],
  'koprodi':      ['view_dashboard', 'view_report', 'upload_document', 'delete_document', 'view_document', 'view_rps', 'manage_rps'],
  'taskforce':    ['upload_document', 'view_document', 'view_rps', 'manage_rps'],
};


const MOCK_USERS = [
  { id: 1, nama: 'Dr. Ahmad Fauzi, M.Kom',   nip: '197001012000031001', email: 'ahmad@unipgri.ac.id',   role: 'admin',     status: 'aktif',    prodi: '',                           lastLogin: '2026-08-05 08:12' },
  { id: 2, nama: 'Prof. Dr. Siti Rahayu',    nip: '196805152001122001', email: 'siti@unipgri.ac.id',    role: 'dekan',     status: 'aktif',    prodi: '',                           lastLogin: '2026-08-04 14:30' },
  { id: 3, nama: 'Dr. Budi Santoso, M.T',    nip: '198003102005011002', email: 'budi@unipgri.ac.id',    role: 'koprodi',   status: 'aktif',    prodi: 'Teknik Informatika',         lastLogin: '2026-08-03 09:45' },
  { id: 4, nama: 'Rina Wulandari, S.Kom',    nip: '199201052019032001', email: 'rina@unipgri.ac.id',    role: 'taskforce', status: 'aktif',    prodi: 'Teknik Informatika',         lastLogin: '2026-08-05 07:55' },
  { id: 5, nama: 'Dr. Wati Nurhayati, M.M',  nip: '197712282004012002', email: 'wati@unipgri.ac.id',    role: 'auditor',   status: 'aktif',    prodi: 'Pendidikan Matematika',      lastLogin: '2026-08-05 08:01' },
];

const EMPTY_FORM = { nama: '', nip: '', email: '', role: 'taskforce', prodi: '', status: 'aktif', password: '' };
const PRODI_LIST = ['Teknik Informatika', 'Pendidikan Matematika', 'Manajemen', 'Pendidikan Bahasa Inggris', 'Akuntansi', 'Pendidikan IPA', 'Hukum', 'Fakultas Ekonomi', ''];

export default function UserManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'permissions'

  useEffect(() => {
    const load = async () => {
      setDataLoading(true);
      await new Promise(r => setTimeout(r, 600)); // simulated API call
      setUsers(MOCK_USERS);
      setDataLoading(false);
    };
    load();
  }, []);

  /* ─── User list state ─── */
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  /* ─── Modal state ─── */
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPass, setShowPass] = useState(false);

  /* ─── Filtered users ─── */
  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q || u.nama.toLowerCase().includes(q) || u.nip.includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = !filterRole || u.role === filterRole;
      const matchStatus = !filterStatus || u.status === filterStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, filterRole, filterStatus]);

  /* ─── Stats ─── */
  const stats = useMemo(() => ({
    total: users.length,
    aktif: users.filter(u => u.status === 'aktif').length,
    nonaktif: users.filter(u => u.status === 'nonaktif').length,
    byRole: ROLES.map(r => ({ role: r, count: users.filter(u => u.role === r).length })),
  }), [users]);

  /* ─── Form handling ─── */
  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setFormErrors({}); setShowPass(false); setModalOpen(true); };
  const openEdit = (user) => {
    setEditId(user.id);
    setForm({ nama: user.nama, nip: user.nip, email: user.email, role: user.role, prodi: user.prodi, status: user.status, password: '' });
    setFormErrors({});
    setShowPass(false);
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.nama.trim()) errs.nama = 'Nama wajib diisi';
    if (!form.nip.trim()) errs.nip = 'NIP wajib diisi';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email tidak valid';
    if (!editId && !form.password.trim()) errs.password = 'Kata sandi wajib untuk pengguna baru';
    if (form.password && form.password.length < 8) errs.password = 'Kata sandi minimal 8 karakter';
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    if (editId) {
      setUsers(prev => prev.map(u => u.id === editId ? { ...u, ...form } : u));
      addToast(`Data pengguna "${form.nama}" berhasil diperbarui.`, 'success');
    } else {
      const newId = Math.max(...users.map(u => u.id)) + 1;
      setUsers(prev => [...prev, { id: newId, ...form, lastLogin: '-' }]);
      addToast(`Pengguna "${form.nama}" berhasil ditambahkan.`, 'success');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    const name = users.find(u => u.id === deleteTarget)?.nama;
    setUsers(prev => prev.filter(u => u.id !== deleteTarget));
    setDeleteTarget(null);
    addToast(`Pengguna "${name}" berhasil dihapus.`, 'info');
  };

  const toggleStatus = (id) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u;
      const newStatus = u.status === 'aktif' ? 'nonaktif' : 'aktif';
      addToast(`Status ${u.nama} diubah ke "${newStatus}".`, 'info');
      return { ...u, status: newStatus };
    }));
  };

  /* ─── Permission handling ─── */
  const togglePermission = (role, permKey) => {
    setPermissions(prev => {
      const current = prev[role] || [];
      const updated = current.includes(permKey)
        ? current.filter(p => p !== permKey)
        : [...current, permKey];
      return { ...prev, [role]: updated };
    });
  };

  const toggleGroupForRole = (role, group) => {
    const groupKeys = PERMISSIONS.filter(p => p.group === group).map(p => p.key);
    const current = permissions[role] || [];
    const allChecked = groupKeys.every(k => current.includes(k));
    const updated = allChecked
      ? current.filter(k => !groupKeys.includes(k))
      : [...new Set([...current, ...groupKeys])];
    setPermissions(prev => ({ ...prev, [role]: updated }));
  };

  const savePermissions = () => {
    addToast('Pengaturan izin berhasil disimpan.', 'success');
  };

  const resetPermissions = (role) => {
    setPermissions(prev => ({ ...prev, [role]: DEFAULT_PERMISSIONS[role] }));
    addToast(`Izin untuk peran "${role}" direset ke default.`, 'info');
  };

  /* ─── Permission groups ─── */
  const permGroups = [...new Set(PERMISSIONS.map(p => p.group))];
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);

  const roleBadgeClass = (role) => {
    if (role === 'admin') return styles.roleAdmin;
    if (role === 'auditor') return styles.roleAuditor;
    if (role === 'dekan') return styles.roleDekan;
    if (role === 'koprodi') return styles.roleKoprodi;
    return styles.roleStaf;
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <ToastContainer />

      {/* ─── Add/Edit User Modal ─── */}
      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={e => e.target === e.currentTarget && setModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-modal-title"
        >
          <div className={styles.userModalBox}>
            <div className={styles.modalHead}>
              <h2 id="user-modal-title" className={styles.modalTitle}>
                {editId ? '✏️ Edit Pengguna' : '➕ Tambah Pengguna Baru'}
              </h2>
              <button className={styles.modalClose} onClick={() => setModalOpen(false)} aria-label="Tutup dialog">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                {/* Nama */}
                <div className={`form-group ${styles.colSpan2}`}>
                  <label className="form-label" htmlFor="u-nama">Nama Lengkap & Gelar</label>
                  <input id="u-nama" className={`form-input ${formErrors.nama ? styles.inputError : ''}`}
                    placeholder="Contoh: Dr. Ahmad Fauzi, M.Kom"
                    value={form.nama} onChange={e => setForm(f => ({...f, nama: e.target.value}))} />
                  {formErrors.nama && <span className={styles.errMsg}>{formErrors.nama}</span>}
                </div>

                {/* NIP */}
                <div className="form-group">
                  <label className="form-label" htmlFor="u-nip">NIP / NIDN</label>
                  <input id="u-nip" className={`form-input ${formErrors.nip ? styles.inputError : ''}`}
                    placeholder="198501012010011001"
                    value={form.nip} onChange={e => setForm(f => ({...f, nip: e.target.value}))} />
                  {formErrors.nip && <span className={styles.errMsg}>{formErrors.nip}</span>}
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label" htmlFor="u-email">Email Institusi</label>
                  <input id="u-email" type="email" className={`form-input ${formErrors.email ? styles.inputError : ''}`}
                    placeholder="nama@unipgri-bwi.ac.id"
                    value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
                  {formErrors.email && <span className={styles.errMsg}>{formErrors.email}</span>}
                </div>

                {/* Role */}
                <div className="form-group">
                  <label className="form-label" htmlFor="u-role">Peran / Role</label>
                  <select id="u-role" className="form-select"
                    value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
                    {ROLES.map(r => <option key={r} value={r}>{ROLE_MAP[r]}</option>)}
                  </select>
                </div>

                {/* Prodi */}
                <div className="form-group">
                  <label className="form-label" htmlFor="u-prodi">Program Studi</label>
                  <select id="u-prodi" className="form-select"
                    value={form.prodi} onChange={e => setForm(f => ({...f, prodi: e.target.value}))}>
                    {PRODI_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Status */}
                <div className="form-group">
                  <label className="form-label" htmlFor="u-status">Status Akun</label>
                  <select id="u-status" className="form-select"
                    value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Non-aktif</option>
                  </select>
                </div>

                {/* Password */}
                <div className={`form-group ${styles.colSpan2}`}>
                  <label className="form-label" htmlFor="u-pass">
                    {editId ? 'Kata Sandi Baru (kosongkan jika tidak diubah)' : 'Kata Sandi'}
                  </label>
                  <div className={styles.passWrap}>
                    <input id="u-pass" type={showPass ? 'text' : 'password'}
                      className={`form-input ${formErrors.password ? styles.inputError : ''}`}
                      placeholder="Minimal 8 karakter"
                      value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} />
                    <button type="button" className={styles.passToggle}
                      onClick={() => setShowPass(v => !v)} aria-label={showPass ? 'Sembunyikan' : 'Tampilkan'}>
                      {showPass
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  {formErrors.password && <span className={styles.errMsg}>{formErrors.password}</span>}
                </div>
              </div>
            </div>

            <div className={styles.modalFoot}>
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave} aria-label="Simpan data pengguna">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                {editId ? 'Simpan Perubahan' : 'Tambah Pengguna'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm ─── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Hapus Pengguna?"
        message={`Akun "${users.find(u => u.id === deleteTarget)?.nama}" akan dihapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Pengguna"
        cancelLabel="Batal"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        type="danger"
      />

      <main className="main-content">
        <div className="page-wrapper">
          <Breadcrumb items={[
            { label: 'Beranda', href: '/dashboard' },
            { label: 'Administrasi', href: '#' },
            { label: 'Manajemen Pengguna', href: '/admin/users' },
          ]} />

          <div className={`page-header flex items-center justify-between`}>
            <div>
              <h1 className="page-title">Manajemen Pengguna</h1>
              <p className="page-subtitle">Kelola akun, peran, dan hak akses seluruh pengguna sistem SIJAMU</p>
            </div>
            <button className="btn btn-primary" onClick={openAdd} aria-label="Tambah pengguna baru">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Tambah Pengguna
            </button>
          </div>

          {/* ─── Stat Cards ─── */}
          <div className={styles.statRow}>
            <div className={`${styles.statCard} ${styles.statTotal}`}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statNum}>{stats.total}</div>
              <div className={styles.statLbl}>Total Pengguna</div>
            </div>
            <div className={`${styles.statCard} ${styles.statAktif}`}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statNum}>{stats.aktif}</div>
              <div className={styles.statLbl}>Akun Aktif</div>
            </div>
            <div className={`${styles.statCard} ${styles.statNonaktif}`}>
              <div className={styles.statIcon}>⛔</div>
              <div className={styles.statNum}>{stats.nonaktif}</div>
              <div className={styles.statLbl}>Akun Non-aktif</div>
            </div>
            {stats.byRole.slice(0, 2).map(r => (
              <div key={r.role} className={`${styles.statCard} ${styles.statRole}`}>
                <div className={styles.statNum}>{r.count}</div>
                <div className={styles.statLbl}>{r.role}</div>
              </div>
            ))}
          </div>

          {/* ─── Tabs ─── */}
          <div className={styles.tabBar} role="tablist">
            <button role="tab" aria-selected={activeTab === 'users'} className={`${styles.tab} ${activeTab === 'users' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('users')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Daftar Pengguna ({users.length})
            </button>
            <button role="tab" aria-selected={activeTab === 'permissions'} className={`${styles.tab} ${activeTab === 'permissions' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('permissions')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Pengaturan Izin Peran
            </button>
          </div>

          {/* ═══════════════════════════════════════════
              TAB 1: DAFTAR PENGGUNA
          ═══════════════════════════════════════════ */}
          {activeTab === 'users' && (
            <div className="card">
              <div className={styles.filterBar}>
                <div className={styles.searchWrap}>
                  <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="search"
                    className={`form-input ${styles.searchInput}`}
                    placeholder="Cari nama, NIP, atau email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    aria-label="Cari pengguna"
                  />
                </div>
                <select className={`form-select ${styles.filterSelect}`} value={filterRole}
                  onChange={e => setFilterRole(e.target.value)} aria-label="Filter berdasarkan peran">
                  <option value="">Semua Peran</option>
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_MAP[r]}</option>)}
                </select>
                <select className={`form-select ${styles.filterSelect}`} value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)} aria-label="Filter berdasarkan status">
                  <option value="">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Non-aktif</option>
                </select>
                {(search || filterRole || filterStatus) && (
                  <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterRole(''); setFilterStatus(''); }}>
                    Reset Filter
                  </button>
                )}
              </div>

              <div className={styles.resultInfo}>
                Menampilkan <strong>{filtered.length}</strong> dari {users.length} pengguna
              </div>

              {/* Table */}
              <div className="table-wrapper mt-4">
                <table className="data-table" aria-label="Daftar pengguna sistem SIJAMU">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Pengguna</th>
                      <th scope="col">NIP / NIDN</th>
                      <th scope="col">Peran</th>
                      <th scope="col">Program Studi</th>
                      <th scope="col">Status</th>
                      <th scope="col">Login Terakhir</th>
                      <th scope="col" style={{textAlign:'center'}}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataLoading ? (
                      <tr><td colSpan="8" style={{textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)'}}>Memuat data pengguna...</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan="8">
                          <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🔍</div>
                            <div>Tidak ada pengguna yang sesuai filter</div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((u, i) => (
                        <tr key={u.id} className={u.status === 'nonaktif' ? styles.rowDimmed : ''}>
                          <td>{i + 1}</td>
                          <td>
                            <div className={styles.userCell}>
                              <div className={styles.userAvatar} aria-hidden="true" style={{
                                background: u.role === 'admin' ? '#C81E1E'
                                  : u.role === 'auditor' ? '#1A56DB'
                                  : u.role === 'dekan' ? '#057A55'
                                  : u.role === 'koprodi' ? '#C27803'
                                  : '#6B7280'
                              }}>
                                {u.nama.split(' ').slice(-1)[0][0]}
                              </div>
                              <div>
                                <div className={styles.userName}>{u.nama}</div>
                                <div className={styles.userEmail}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className={styles.nipCell}>{u.nip}</td>
                          <td>
                            <span className={`${styles.roleBadge} ${roleBadgeClass(u.role)}`}>
                              {ROLE_MAP[u.role]}
                            </span>
                          </td>
                          <td className={styles.prodiCell}>{u.prodi || '-'}</td>
                          <td>
                            <button
                              className={`${styles.statusToggle} ${u.status === 'aktif' ? styles.statusAktif : styles.statusNonaktif}`}
                              onClick={() => toggleStatus(u.id)}
                              aria-label={`Status ${u.nama}: ${u.status}. Klik untuk mengubah`}
                              title="Klik untuk mengubah status"
                            >
                              <span className={styles.statusDot} />
                              {u.status === 'aktif' ? 'Aktif' : 'Non-aktif'}
                            </button>
                          </td>
                          <td className={styles.loginCell}>{u.lastLogin}</td>
                          <td>
                            <div className={styles.actionBtns}>
                              <button className="btn btn-sm btn-outline"
                                onClick={() => openEdit(u)}
                                aria-label={`Edit pengguna ${u.nama}`}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Edit
                              </button>
                              <button className="btn btn-sm btn-danger"
                                onClick={() => setDeleteTarget(u.id)}
                                disabled={u.id === 1}
                                aria-label={`Hapus pengguna ${u.nama}`}
                                title={u.id === 1 ? 'Administrator utama tidak dapat dihapus' : 'Hapus pengguna'}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
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
          )}

          {/* ═══════════════════════════════════════════
              TAB 2: PENGATURAN IZIN
          ═══════════════════════════════════════════ */}
          {activeTab === 'permissions' && (
            <div className={styles.permissionsLayout}>
              <div className={`card ${styles.roleSelector}`}>
                <h2 className="card-title" style={{fontSize:'var(--font-size-base)'}}>Pilih Peran</h2>
                <div className={styles.roleTabs}>
                  {ROLES.map(r => (
                    <button
                      key={r}
                      className={`${styles.roleTabBtn} ${selectedRole === r ? styles.roleTabActive : ''}`}
                      onClick={() => setSelectedRole(r)}
                    >
                      {ROLE_MAP[r]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Permission Matrix */}
              <div className={`card ${styles.permMatrix}`}>
                <div className={styles.permHead}>
                  <div>
                    <h2 className="card-title" style={{marginBottom:4}}>
                      Izin untuk: <span className={styles.permRoleName}>{ROLE_MAP[selectedRole]}</span>
                    </h2>
                    <p style={{fontSize:'var(--font-size-sm)',color:'var(--color-text-muted)'}}>
                      {(permissions[selectedRole] || []).length} dari {PERMISSIONS.length} izin aktif
                    </p>
                  </div>
                  <div className={styles.permActions}>
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => resetPermissions(selectedRole)}
                      aria-label={`Reset izin ${selectedRole} ke default`}>
                      Reset Default
                    </button>
                    <button className="btn btn-primary btn-sm"
                      onClick={savePermissions}
                      aria-label="Simpan pengaturan izin">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                      </svg>
                      Simpan Izin
                    </button>
                  </div>
                </div>

                <div className={styles.permGroups}>
                  {permGroups.map(group => {
                    const groupPerms = PERMISSIONS.filter(p => p.group === group);
                    const currentPerms = permissions[selectedRole] || [];
                    const allChecked = groupPerms.every(p => currentPerms.includes(p.key));
                    const someChecked = groupPerms.some(p => currentPerms.includes(p.key));
                    return (
                      <div key={group} className={styles.permGroup}>
                        <div className={styles.permGroupHeader}>
                          <label className={styles.permGroupLabel}>
                            <input
                              type="checkbox"
                              className={styles.permCheckbox}
                              checked={allChecked}
                              ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                              onChange={() => toggleGroupForRole(selectedRole, group)}
                              aria-label={`Toggle semua izin grup ${group}`}
                            />
                            <span className={styles.permGroupName}>{group}</span>
                            <span className={styles.permGroupCount}>
                              {groupPerms.filter(p => currentPerms.includes(p.key)).length}/{groupPerms.length}
                            </span>
                          </label>
                        </div>
                        <div className={styles.permItems}>
                          {groupPerms.map(perm => {
                            const checked = currentPerms.includes(perm.key);
                            return (
                              <label
                                key={perm.key}
                                className={`${styles.permItem} ${checked ? styles.permItemChecked : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  className={styles.permCheckbox}
                                  checked={checked}
                                  onChange={() => togglePermission(selectedRole, perm.key)}
                                  aria-label={`Izin: ${perm.label}`}
                                  disabled={selectedRole === 'Administrator'}
                                />
                                <span className={styles.permItemIcon} aria-hidden="true">
                                  {checked ? '🔓' : '🔒'}
                                </span>
                                <span className={styles.permItemLabel}>{perm.label}</span>
                                {checked && <span className={styles.permItemActive}>Aktif</span>}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedRole === 'Administrator' && (
                  <div className={styles.adminNote}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Administrator selalu memiliki semua izin dan tidak dapat diubah.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
