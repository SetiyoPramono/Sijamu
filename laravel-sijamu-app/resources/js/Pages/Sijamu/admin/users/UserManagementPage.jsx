// Halaman Manajemen Pengguna (CRUD + Permissions) — route: /admin/users
'use client';

import { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import ConfirmModal from '@/components/ConfirmModal';
import { ToastContainer, addToast } from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';

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
  { key: 'manage_upload',     label: 'Manajemen Upload',         group: 'Administrasi' },
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
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const load = async () => {
      setDataLoading(true);
      await new Promise(r => setTimeout(r, 600));
      setUsers(MOCK_USERS);
      setDataLoading(false);
    };
    load();
  }, []);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPass, setShowPass] = useState(false);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q || u.nama.toLowerCase().includes(q) || u.nip.includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = !filterRole || u.role === filterRole;
      const matchStatus = !filterStatus || u.status === filterStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, filterRole, filterStatus]);

  const stats = useMemo(() => ({
    total: users.length,
    aktif: users.filter(u => u.status === 'aktif').length,
    nonaktif: users.filter(u => u.status === 'nonaktif').length,
    byRole: ROLES.map(r => ({ role: r, count: users.filter(u => u.role === r).length })),
  }), [users]);

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

  const togglePermission = (role, permKey) => {
    setPermissions(prev => {
      const current = prev[role] || [];
      const updated = current.includes(permKey) ? current.filter(p => p !== permKey) : [...current, permKey];
      return { ...prev, [role]: updated };
    });
  };

  const toggleGroupForRole = (role, group) => {
    const groupKeys = PERMISSIONS.filter(p => p.group === group).map(p => p.key);
    const current = permissions[role] || [];
    const allChecked = groupKeys.every(k => current.includes(k));
    const updated = allChecked ? current.filter(k => !groupKeys.includes(k)) : [...new Set([...current, ...groupKeys])];
    setPermissions(prev => ({ ...prev, [role]: updated }));
  };

  const savePermissions = () => { addToast('Pengaturan izin berhasil disimpan.', 'success'); };
  const resetPermissions = (role) => { setPermissions(prev => ({ ...prev, [role]: DEFAULT_PERMISSIONS[role] })); addToast(`Izin untuk peran "${role}" direset ke default.`, 'info'); };

  const permGroups = [...new Set(PERMISSIONS.map(p => p.group))];
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);

  const roleBadgeClass = (role) => {
    if (role === 'admin') return 'bg-[#FDE8E8] text-[#C81E1E]';
    if (role === 'auditor') return 'bg-[#EBF2FF] text-[#1A56DB]';
    if (role === 'dekan') return 'bg-[#DEF7EC] text-[#057A55]';
    if (role === 'koprodi') return 'bg-[#FDF6B2] text-[#92400E]';
    return 'bg-[#F3F4F6] text-[#374151]';
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <ToastContainer />
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModalOpen(false)} role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-5 md:p-6 md:px-8 border-b border-gray-200 shrink-0">
              <h2 id="user-modal-title" className="text-xl font-bold text-gray-900">{editId ? '✏️ Edit Pengguna' : '➕ Tambah Pengguna Baru'}</h2>
              <button className="w-9 h-9 rounded-md flex items-center justify-center text-gray-400 cursor-pointer bg-transparent border-none transition-colors hover:bg-gray-100 hover:text-gray-900" onClick={() => setModalOpen(false)} aria-label="Tutup dialog">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-5 md:p-6 md:px-8 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="form-group col-span-1 md:col-span-2">
                  <label className="form-label" htmlFor="u-nama">Nama Lengkap & Gelar</label>
                  <input id="u-nama" className={`form-input ${formErrors.nama ? '!border-red-600 !shadow-[0_0_0_3px_rgba(200,30,30,0.12)]' : ''}`} placeholder="Contoh: Dr. Ahmad Fauzi, M.Kom" value={form.nama} onChange={e => setForm(f => ({...f, nama: e.target.value}))} />
                  {formErrors.nama && <span className="text-sm text-red-600 font-medium mt-0.5">{formErrors.nama}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="u-nip">NIP / NIDN</label>
                  <input id="u-nip" className={`form-input ${formErrors.nip ? '!border-red-600 !shadow-[0_0_0_3px_rgba(200,30,30,0.12)]' : ''}`} placeholder="198501012010011001" value={form.nip} onChange={e => setForm(f => ({...f, nip: e.target.value}))} />
                  {formErrors.nip && <span className="text-sm text-red-600 font-medium mt-0.5">{formErrors.nip}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="u-email">Email Institusi</label>
                  <input id="u-email" type="email" className={`form-input ${formErrors.email ? '!border-red-600 !shadow-[0_0_0_3px_rgba(200,30,30,0.12)]' : ''}`} placeholder="nama@unipgri-bwi.ac.id" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
                  {formErrors.email && <span className="text-sm text-red-600 font-medium mt-0.5">{formErrors.email}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="u-role">Peran / Role</label>
                  <select id="u-role" className="form-select" value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>{ROLES.map(r => <option key={r} value={r}>{ROLE_MAP[r]}</option>)}</select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="u-prodi">Program Studi</label>
                  <select id="u-prodi" className="form-select" value={form.prodi} onChange={e => setForm(f => ({...f, prodi: e.target.value}))}>{PRODI_LIST.map(p => <option key={p} value={p}>{p}</option>)}</select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="u-status">Status Akun</label>
                  <select id="u-status" className="form-select" value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}><option value="aktif">Aktif</option><option value="nonaktif">Non-aktif</option></select>
                </div>
                <div className="form-group col-span-1 md:col-span-2">
                  <label className="form-label" htmlFor="u-pass">{editId ? 'Kata Sandi Baru (kosongkan jika tidak diubah)' : 'Kata Sandi'}</label>
                  <div className="relative flex items-center">
                    <input id="u-pass" type={showPass ? 'text' : 'password'} className={`form-input ${formErrors.password ? '!border-red-600 !shadow-[0_0_0_3px_rgba(200,30,30,0.12)]' : ''}`} placeholder="Minimal 8 karakter" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} />
                    <button type="button" className="absolute right-3 bg-transparent border-none cursor-pointer p-1 text-gray-400 flex items-center rounded-sm transition-colors hover:text-gray-900" onClick={() => setShowPass(v => !v)} aria-label={showPass ? 'Sembunyikan' : 'Tampilkan'}>
                      {showPass ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                  </div>
                  {formErrors.password && <span className="text-sm text-red-600 font-medium mt-0.5">{formErrors.password}</span>}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 md:p-5 md:px-8 border-t border-gray-200 shrink-0">
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave} aria-label="Simpan data pengguna">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                {editId ? 'Simpan Perubahan' : 'Tambah Pengguna'}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal isOpen={!!deleteTarget} title="Hapus Pengguna?" message={`Akun "${users.find(u => u.id === deleteTarget)?.nama}" akan dihapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.`} confirmLabel="Ya, Hapus Pengguna" cancelLabel="Batal" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} type="danger" />
      <main className="main-content">
        <div className="page-wrapper">
          <Breadcrumb items={[{ label: 'Beranda', href: '/dashboard' }, { label: 'Administrasi', href: '#' }, { label: 'Manajemen Pengguna', href: '/admin/users' }]} />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
              <p className="text-gray-500">Kelola akun, peran, dan hak akses seluruh pengguna sistem SIJAMU</p>
            </div>
            <button className="btn btn-primary" onClick={openAdd} aria-label="Tambah pengguna baru">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Tambah Pengguna
            </button>
          </div>
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-[130px] bg-white rounded-lg p-5 shadow-sm border border-gray-200 border-t-4 flex flex-col gap-1 transition-all hover:-translate-y-0.5 hover:shadow-md border-t-blue-600">
              <div className="text-2xl mb-1">👥</div>
              <div className="text-4xl font-extrabold tracking-tight leading-none text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-500 font-semibold">Total Pengguna</div>
            </div>
            <div className="flex-1 min-w-[130px] bg-white rounded-lg p-5 shadow-sm border border-gray-200 border-t-4 flex flex-col gap-1 transition-all hover:-translate-y-0.5 hover:shadow-md border-t-green-600">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-4xl font-extrabold tracking-tight leading-none text-green-600">{stats.aktif}</div>
              <div className="text-sm text-gray-500 font-semibold">Akun Aktif</div>
            </div>
            <div className="flex-1 min-w-[130px] bg-white rounded-lg p-5 shadow-sm border border-gray-200 border-t-4 flex flex-col gap-1 transition-all hover:-translate-y-0.5 hover:shadow-md border-t-red-600">
              <div className="text-2xl mb-1">⛔</div>
              <div className="text-4xl font-extrabold tracking-tight leading-none text-red-600">{stats.nonaktif}</div>
              <div className="text-sm text-gray-500 font-semibold">Akun Non-aktif</div>
            </div>
            {stats.byRole.slice(0, 2).map(r => (
              <div key={r.role} className="flex-1 min-w-[130px] bg-white rounded-lg p-5 shadow-sm border border-gray-200 border-t-4 flex flex-col gap-1 transition-all hover:-translate-y-0.5 hover:shadow-md border-t-yellow-500">
                <div className="text-4xl font-extrabold tracking-tight leading-none text-gray-900">{r.count}</div>
                <div className="text-sm text-gray-500 font-semibold">{r.role}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-b-2 border-gray-200 mb-5" role="tablist">
            <button role="tab" aria-selected={activeTab === 'users'} className={`inline-flex items-center gap-2 py-3 px-5 text-base font-semibold text-gray-500 bg-transparent border-b-[3px] border-transparent -mb-[2px] cursor-pointer transition-colors whitespace-nowrap hover:text-blue-600 ${activeTab === 'users' ? '!text-blue-600 !border-blue-600' : ''}`} onClick={() => setActiveTab('users')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Daftar Pengguna ({users.length})
            </button>
            <button role="tab" aria-selected={activeTab === 'permissions'} className={`inline-flex items-center gap-2 py-3 px-5 text-base font-semibold text-gray-500 bg-transparent border-b-[3px] border-transparent -mb-[2px] cursor-pointer transition-colors whitespace-nowrap hover:text-blue-600 ${activeTab === 'permissions' ? '!text-blue-600 !border-blue-600' : ''}`} onClick={() => setActiveTab('permissions')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Pengaturan Izin Peran
            </button>
          </div>
          {activeTab === 'users' && (
            <div className="card">
              <div className="flex gap-3 items-center flex-wrap mb-2 md:flex-row flex-col md:items-center items-stretch">
                <div className="relative flex-1 min-w-[200px]">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="search" className="form-input !pl-[42px]" placeholder="Cari nama, NIP, atau email..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Cari pengguna" />
                </div>
                <select className="form-select min-w-0 md:min-w-[160px] w-auto shrink-0" value={filterRole} onChange={e => setFilterRole(e.target.value)} aria-label="Filter berdasarkan peran"><option value="">Semua Peran</option>{ROLES.map(r => <option key={r} value={r}>{ROLE_MAP[r]}</option>)}</select>
                <select className="form-select min-w-0 md:min-w-[160px] w-auto shrink-0" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} aria-label="Filter berdasarkan status"><option value="">Semua Status</option><option value="aktif">Aktif</option><option value="nonaktif">Non-aktif</option></select>
                {(search || filterRole || filterStatus) && <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterRole(''); setFilterStatus(''); }}>Reset Filter</button>}
              </div>
              <div className="text-sm text-gray-500 mb-2">Menampilkan <strong>{filtered.length}</strong> dari {users.length} pengguna</div>
              <div className="table-wrapper mt-4">
                <table className="data-table">
                  <thead><tr><th scope="col">#</th><th scope="col">Pengguna</th><th scope="col">NIP / NIDN</th><th scope="col">Peran</th><th scope="col">Program Studi</th><th scope="col">Status</th><th scope="col">Login Terakhir</th><th scope="col" style={{textAlign:'center'}}>Aksi</th></tr></thead>
                  <tbody>
                    {dataLoading ? <tr><td colSpan="8" style={{textAlign: 'center', padding: '24px', color: '#6B7280'}}>Memuat data pengguna...</td></tr> : filtered.length === 0 ? <tr><td colSpan="8"><div className="flex flex-col items-center justify-center p-10 gap-3 text-gray-500 text-base font-medium"><div className="text-5xl">🔍</div><div>Tidak ada pengguna yang sesuai filter</div></div></td></tr> : filtered.map((u, i) => (
                      <tr key={u.id} className={u.status === 'nonaktif' ? 'opacity-60' : ''}>
                        <td>{i + 1}</td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center font-bold text-base text-white shrink-0 uppercase" aria-hidden="true" style={{ background: u.role === 'admin' ? '#C81E1E' : u.role === 'auditor' ? '#1A56DB' : u.role === 'dekan' ? '#057A55' : u.role === 'koprodi' ? '#C27803' : '#6B7280' }}>{u.nama.split(' ').slice(-1)[0][0]}</div>
                            <div>
                              <div className="text-base font-semibold text-gray-900 leading-snug">{u.nama}</div>
                              <div className="text-sm text-gray-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="font-mono text-sm text-gray-500 whitespace-nowrap">{u.nip}</td>
                        <td><span className={`inline-flex items-center py-1 px-2.5 rounded-full text-xs font-bold whitespace-nowrap ${roleBadgeClass(u.role)}`}>{ROLE_MAP[u.role]}</span></td>
                        <td className="text-sm text-gray-500 max-w-[180px]">{u.prodi || '-'}</td>
                        <td>
                          <button className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-sm font-semibold cursor-pointer border-2 transition-all ${u.status === 'aktif' ? 'bg-green-100 text-green-700 border-green-700/20 hover:bg-[#B7F0DA]' : 'bg-red-100 text-red-700 border-red-700/20 hover:bg-[#FCCACA]'}`} onClick={() => toggleStatus(u.id)} aria-label={`Status ${u.nama}: ${u.status}. Klik untuk mengubah`} title="Klik untuk mengubah status">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${u.status === 'aktif' ? 'bg-green-600' : 'bg-red-600'}`} />
                            {u.status === 'aktif' ? 'Aktif' : 'Non-aktif'}
                          </button>
                        </td>
                        <td className="text-sm text-gray-400 whitespace-nowrap">{u.lastLogin}</td>
                        <td>
                          <div className="flex gap-2 justify-center">
                            <button className="btn btn-sm btn-outline" onClick={() => openEdit(u)} aria-label={`Edit pengguna ${u.nama}`}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => setDeleteTarget(u.id)} disabled={u.id === 1} aria-label={`Hapus pengguna ${u.nama}`} title={u.id === 1 ? 'Administrator utama tidak dapat dihapus' : 'Hapus pengguna'}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>Hapus</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'permissions' && (
            <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5 items-start">
              <div className="card xl:sticky xl:top-4">
                <h2 className="card-title text-base">Pilih Peran</h2>
                <div className="flex flex-row xl:flex-col gap-2 mt-3 flex-wrap">
                  {ROLES.map(r => (
                    <button key={r} className={`flex items-center gap-3 w-auto xl:w-full flex-1 xl:flex-none min-w-[180px] xl:min-w-0 py-3 px-3.5 rounded-md border-2 border-gray-200 bg-gray-50 cursor-pointer text-left text-sm font-semibold text-gray-900 transition-all hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 ${selectedRole === r ? '!border-blue-600 !bg-blue-50 !text-blue-600 shadow-[0_0_0_3px_rgba(26,86,219,0.12)]' : ''}`} onClick={() => setSelectedRole(r)}>{ROLE_MAP[r]}</button>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
                  <div>
                    <h2 className="card-title mb-1">Izin untuk: <span className="text-blue-600 font-extrabold">{ROLE_MAP[selectedRole]}</span></h2>
                    <p className="text-sm text-gray-500">{(permissions[selectedRole] || []).length} dari {PERMISSIONS.length} izin aktif</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm" onClick={() => resetPermissions(selectedRole)} aria-label={`Reset izin ${selectedRole} ke default`}>Reset Default</button>
                    <button className="btn btn-primary btn-sm" onClick={savePermissions} aria-label="Simpan pengaturan izin"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Simpan Izin</button>
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  {permGroups.map(group => {
                    const groupPerms = PERMISSIONS.filter(p => p.group === group);
                    const currentPerms = permissions[selectedRole] || [];
                    const allChecked = groupPerms.every(p => currentPerms.includes(p.key));
                    const someChecked = groupPerms.some(p => currentPerms.includes(p.key));
                    return (
                      <div key={group}>
                        <div className="mb-3 pb-2 border-b-2 border-gray-200">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-[18px] h-[18px] accent-blue-600 cursor-pointer shrink-0" checked={allChecked} ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }} onChange={() => toggleGroupForRole(selectedRole, group)} aria-label={`Toggle semua izin grup ${group}`} />
                            <span className="text-base font-bold text-gray-900">{group}</span>
                            <span className="text-xs text-gray-400 font-semibold bg-gray-50 py-0.5 px-2 rounded-full border border-gray-200">{groupPerms.filter(p => currentPerms.includes(p.key)).length}/{groupPerms.length}</span>
                          </label>
                        </div>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2">
                          {groupPerms.map(perm => {
                            const checked = currentPerms.includes(perm.key);
                            return (
                              <label key={perm.key} className={`flex items-center gap-3 py-3 px-3.5 border-2 border-gray-200 rounded-md cursor-pointer transition-all bg-gray-50 hover:border-blue-600 hover:bg-blue-50 ${checked ? '!bg-green-50 !border-green-600/30' : ''}`}>
                                <input type="checkbox" className="w-[18px] h-[18px] accent-blue-600 cursor-pointer shrink-0" checked={checked} onChange={() => togglePermission(selectedRole, perm.key)} aria-label={`Izin: ${perm.label}`} disabled={selectedRole === 'admin'} />
                                <span className="text-base shrink-0" aria-hidden="true">{checked ? '🔓' : '🔒'}</span>
                                <span className="text-sm font-semibold text-gray-900 flex-1">{perm.label}</span>
                                {checked && <span className="text-xs font-bold text-green-700 bg-white py-0.5 px-2 rounded-full border border-green-700/30 whitespace-nowrap">Aktif</span>}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {selectedRole === 'admin' && (
                  <div className="flex items-center gap-2 mt-6 p-4 bg-blue-50 border border-blue-600/20 rounded-md text-sm text-blue-600 font-semibold">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
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
