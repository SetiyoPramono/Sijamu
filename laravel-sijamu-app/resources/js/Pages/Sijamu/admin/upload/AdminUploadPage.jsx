'use client';

import { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import ConfirmModal from '@/components/ConfirmModal';
import { ToastContainer, addToast } from '@/components/Toast';
import { useUploadConfig } from '@/context/UploadConfigContext';

import axios from 'axios';

const emptyProdiForm = { id: '', nama: '' };
const emptyDocForm   = { id: '', kode: '', nama: '', help: '', document_category_id: '' };
const emptyCategoryForm = { id: '', name: '', description: '' };

export default function AdminUploadPage() {
  const { prodiList, setProdiList, docList, setDocList, categoryList, setCategoryList, loading } = useUploadConfig();

  const [activeTab, setActiveTab] = useState('prodi');

  const [prodiForm, setProdiForm]           = useState(emptyProdiForm);
  const [prodiEditing, setProdiEditing]     = useState(false);
  const [showProdiModal, setShowProdiModal] = useState(false);
  const [deleteProdiId, setDeleteProdiId]   = useState(null);
  const [prodiSearch, setProdiSearch]       = useState('');
  const prodiInputRef = useRef(null);

  const [docForm, setDocForm]           = useState(emptyDocForm);
  const [docEditing, setDocEditing]     = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [deleteDocId, setDeleteDocId]   = useState(null);
  const [docSearch, setDocSearch]       = useState('');
  const [docFilter, setDocFilter]       = useState('');
  const docInputRef = useRef(null);
  const [categoryForm, setCategoryForm]           = useState(emptyCategoryForm);
  const [categoryEditing, setCategoryEditing]     = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId]   = useState(null);
  const [categorySearch, setCategorySearch]       = useState('');
  const categoryInputRef = useRef(null);

  useEffect(() => { if (showProdiModal) setTimeout(() => prodiInputRef.current?.focus(), 50); }, [showProdiModal]);
  useEffect(() => { if (showDocModal)   setTimeout(() => docInputRef.current?.focus(),   50); }, [showDocModal]);
  useEffect(() => { if (showCategoryModal) setTimeout(() => categoryInputRef.current?.focus(), 50); }, [showCategoryModal]);

  const filteredProdis = prodiList.filter(p => p.nama.toLowerCase().includes(prodiSearch.toLowerCase()));

  const openAddProdi = () => { setProdiForm(emptyProdiForm); setProdiEditing(false); setShowProdiModal(true); };
  const openEditProdi = (p) => { setProdiForm({ ...p }); setProdiEditing(true); setShowProdiModal(true); };

  const handleProdiSubmit = async (e) => {
    e.preventDefault();
    const nama = prodiForm.nama.trim();
    if (!nama) { addToast('Nama program studi tidak boleh kosong.', 'warning'); return; }
    
    // Validasi duplikasi (client-side)
    if (!prodiEditing && prodiList.some(p => p.nama.toLowerCase() === nama.toLowerCase())) {
      addToast('Program studi dengan nama tersebut sudah ada.', 'warning'); return;
    }

    try {
      if (prodiEditing) {
        const res = await axios.put(`/admin/api/prodis/${prodiForm.id}`, { nama });
        setProdiList(prev => prev.map(p => p.id === prodiForm.id ? { id: res.data.id, nama: res.data.name } : p));
        addToast('Program studi berhasil diperbarui.', 'success');
      } else {
        const res = await axios.post('/admin/api/prodis', { nama });
        setProdiList(prev => [...prev, { id: res.data.id, nama: res.data.name }]);
        addToast('Program studi berhasil ditambahkan.', 'success');
      }
      setShowProdiModal(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menyimpan program studi.', 'error');
    }
  };

  const confirmDeleteProdi = async () => {
    const nama = prodiList.find(p => p.id === deleteProdiId)?.nama || '';
    try {
      await axios.delete(`/admin/api/prodis/${deleteProdiId}`);
      setProdiList(prev => prev.filter(p => p.id !== deleteProdiId));
      addToast('Program studi "' + nama + '" telah dihapus.', 'info');
    } catch (err) {
      addToast('Gagal menghapus program studi.', 'error');
    } finally {
      setDeleteProdiId(null);
    }
  };

  const filteredCategories = categoryList.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()));

  const openAddCategory = () => { setCategoryForm(emptyCategoryForm); setCategoryEditing(false); setShowCategoryModal(true); };
  const openEditCategory = (c) => { setCategoryForm({ ...c }); setCategoryEditing(true); setShowCategoryModal(true); };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const name = categoryForm.name.trim();
    const description = categoryForm.description?.trim() || '';
    if (!name) { addToast('Nama kategori tidak boleh kosong.', 'warning'); return; }
    
    if (!categoryEditing && categoryList.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      addToast('Kategori dengan nama tersebut sudah ada.', 'warning'); return;
    }

    try {
      if (categoryEditing) {
        const res = await axios.put(`/admin/api/categories/${categoryForm.id}`, { name, description });
        setCategoryList(prev => prev.map(c => c.id === categoryForm.id ? res.data : c));
        addToast('Kategori berhasil diperbarui.', 'success');
      } else {
        const res = await axios.post('/admin/api/categories', { name, description });
        setCategoryList(prev => [...prev, res.data]);
        addToast('Kategori berhasil ditambahkan.', 'success');
      }
      setShowCategoryModal(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menyimpan kategori.', 'error');
    }
  };

  const confirmDeleteCategory = async () => {
    const name = categoryList.find(c => c.id === deleteCategoryId)?.name || '';
    try {
      await axios.delete(`/admin/api/categories/${deleteCategoryId}`);
      setCategoryList(prev => prev.filter(c => c.id !== deleteCategoryId));
      addToast('Kategori "' + name + '" telah dihapus.', 'info');
    } catch (err) {
      addToast('Gagal menghapus kategori.', 'error');
    } finally {
      setDeleteCategoryId(null);
    }
  };

  const filteredDocs = docList.filter(d => {
    const matchSearch = d.nama.toLowerCase().includes(docSearch.toLowerCase()) || d.kode.toLowerCase().includes(docSearch.toLowerCase());
    const matchFilter = docFilter ? String(d.document_category_id) === String(docFilter) : true;
    return matchSearch && matchFilter;
  });

  const openAddDoc  = () => { setDocForm(emptyDocForm); setDocEditing(false); setShowDocModal(true); };
  const openEditDoc = (d) => { setDocForm({ ...d }); setDocEditing(true); setShowDocModal(true); };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    const kode = docForm.kode.trim();
    const nama = docForm.nama.trim();
    const help = docForm.help.trim();
    const document_category_id = docForm.document_category_id || null;
    if (!kode || !nama) { addToast('Kode dan nama dokumen wajib diisi.', 'warning'); return; }
    
    if (!docEditing && docList.some(d => d.kode.toLowerCase() === kode.toLowerCase())) {
      addToast('Kode dokumen tersebut sudah digunakan.', 'warning'); return;
    }

    try {
      if (docEditing) {
        const res = await axios.put(`/admin/api/docs/${docForm.id}`, { kode, nama, help, document_category_id });
        setDocList(prev => prev.map(d => d.id === docForm.id ? res.data : d));
        addToast('Indikator dokumen berhasil diperbarui.', 'success');
      } else {
        const res = await axios.post('/admin/api/docs', { kode, nama, help, document_category_id });
        setDocList(prev => [...prev, res.data]);
        addToast('Dokumen ' + kode + ' berhasil ditambahkan.', 'success');
      }
      setShowDocModal(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Gagal menyimpan dokumen.', 'error');
    }
  };

  const confirmDeleteDoc = async () => {
    const nama = docList.find(d => d.id === deleteDocId)?.nama || '';
    try {
      await axios.delete(`/admin/api/docs/${deleteDocId}`);
      setDocList(prev => prev.filter(d => d.id !== deleteDocId));
      addToast('Dokumen "' + nama + '" telah dihapus.', 'info');
    } catch (err) {
      addToast('Gagal menghapus dokumen.', 'error');
    } finally {
      setDeleteDocId(null);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <ToastContainer />

      {showCategoryModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCategoryModal(false); }} role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-[440px] animate-[scaleIn_0.2s_ease]">
            <div className="flex items-center justify-between mb-6">
              <h2 id="category-modal-title" className="text-xl font-bold text-[var(--color-text)]">
                {categoryEditing ? 'Edit Kategori Dokumen' : 'Tambah Kategori Dokumen'}
              </h2>
              <button className="w-9 h-9 rounded-md flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] transition-colors bg-transparent border-none cursor-pointer" onClick={() => setShowCategoryModal(false)} aria-label="Tutup">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="category-name-input">Nama Kategori <span className="text-[var(--color-danger)]">*</span></label>
                <input ref={categoryInputRef} id="category-name-input" type="text" className="form-input" placeholder="contoh: Standar Pendidikan" value={categoryForm.name} onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="category-desc-input">Keterangan</label>
                <textarea id="category-desc-input" className="form-textarea" placeholder="Opsional..." value={categoryForm.description} onChange={e => setCategoryForm(f => ({ ...f, description: e.target.value }))} rows={2} />
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCategoryModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">{categoryEditing ? 'Simpan Perubahan' : 'Tambah Kategori'}</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {showProdiModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowProdiModal(false); }} role="dialog" aria-modal="true" aria-labelledby="prodi-modal-title">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-[440px] animate-[scaleIn_0.2s_ease]">
            <div className="flex items-center justify-between mb-6">
              <h2 id="prodi-modal-title" className="text-xl font-bold text-[var(--color-text)]">
                {prodiEditing ? 'Edit Program Studi' : 'Tambah Program Studi'}
              </h2>
              <button className="w-9 h-9 rounded-md flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] transition-colors bg-transparent border-none cursor-pointer" onClick={() => setShowProdiModal(false)} aria-label="Tutup">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleProdiSubmit} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="prodi-nama-input">Nama Program Studi <span className="text-[var(--color-danger)]">*</span></label>
                <input ref={prodiInputRef} id="prodi-nama-input" type="text" className="form-input" placeholder="contoh: Teknik Informatika" value={prodiForm.nama} onChange={e => setProdiForm(f => ({ ...f, nama: e.target.value }))} required />
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button type="button" className="btn btn-ghost" onClick={() => setShowProdiModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">{prodiEditing ? 'Simpan Perubahan' : 'Tambah Prodi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDocModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDocModal(false); }} role="dialog" aria-modal="true" aria-labelledby="doc-modal-title">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-[580px] animate-[scaleIn_0.2s_ease]">
            <div className="flex items-center justify-between mb-6">
              <h2 id="doc-modal-title" className="text-xl font-bold text-[var(--color-text)]">
                {docEditing ? 'Edit Dokumen Wajib' : 'Tambah Dokumen Wajib'}
              </h2>
              <button className="w-9 h-9 rounded-md flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] transition-colors bg-transparent border-none cursor-pointer" onClick={() => setShowDocModal(false)} aria-label="Tutup">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleDocSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-kode-input">Kode <span className="text-[var(--color-danger)]">*</span></label>
                  <input ref={docInputRef} id="doc-kode-input" type="text" className="form-input font-mono" placeholder="contoh: C1.1" value={docForm.kode} onChange={e => setDocForm(f => ({ ...f, kode: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="doc-nama-input">Nama Dokumen <span className="text-[var(--color-danger)]">*</span></label>
                  <input id="doc-nama-input" type="text" className="form-input" placeholder="contoh: Visi, Misi..." value={docForm.nama} onChange={e => setDocForm(f => ({ ...f, nama: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="doc-category-input">Kategori</label>
                <select id="doc-category-input" className="form-input" value={docForm.document_category_id || ''} onChange={e => setDocForm(f => ({ ...f, document_category_id: e.target.value }))}>
                  <option value="">-- Pilih Kategori (Opsional) --</option>
                  {categoryList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="doc-help-input">
                  Panduan Upload
                  <span className="text-xs font-normal text-[var(--color-text-muted)] ml-2">(Opsional)</span>
                </label>
                <textarea id="doc-help-input" className="form-textarea" placeholder="Tuliskan panduan singkat bagi pengguna saat mengunggah dokumen ini..." value={docForm.help} onChange={e => setDocForm(f => ({ ...f, help: e.target.value }))} rows={3} />
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button type="button" className="btn btn-ghost" onClick={() => setShowDocModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">{docEditing ? 'Simpan Perubahan' : 'Tambah Dokumen'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteProdiId}
        title="Hapus Program Studi?"
        message={'Menghapus "' + (prodiList.find(p => p.id === deleteProdiId)?.nama || '') + '" akan menghapusnya dari daftar pilihan pada halaman Unggah Dokumen.'}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={confirmDeleteProdi}
        onCancel={() => setDeleteProdiId(null)}
        type="danger"
      />

      <ConfirmModal
        isOpen={!!deleteDocId}
        title="Hapus Dokumen Wajib?"
        message={'Menghapus dokumen "' + (docList.find(d => d.id === deleteDocId)?.nama || '') + '" akan menghilangkannya dari checklist upload semua prodi.'}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={confirmDeleteDoc}
        onCancel={() => setDeleteDocId(null)}
        type="danger"
      />

      
      <ConfirmModal
        isOpen={!!deleteCategoryId}
        title="Hapus Kategori?"
        message={'Menghapus kategori "' + (categoryList.find(c => c.id === deleteCategoryId)?.name || '') + '" tidak akan menghapus dokumen di dalamnya, tapi akan melepaskan tautan kategorinya.'}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={confirmDeleteCategory}
        onCancel={() => setDeleteCategoryId(null)}
        type="danger"
      />


      <main className="main-content">
        <div className="page-wrapper">
          <Breadcrumb items={[
            { label: 'Beranda', href: '/dashboard' },
            { label: 'Administrasi' },
            { label: 'Manajemen Upload Dokumen', href: '/admin/upload' },
          ]} />

          <div className="page-header">
            <div>
              <h1 className="page-title">Manajemen Unggah Dokumen</h1>
              <p className="page-subtitle">Kelola daftar Program Studi dan indikator dokumen wajib yang muncul di halaman Unggah Dokumen.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Program Studi', value: prodiList.length, icon: '🏛️' },
              { label: 'Total Dokumen Wajib', value: docList.length, icon: '📄' },
              { label: 'Kategori Dokumen', value: categoryList.length, icon: '🗂️' },
              { label: 'Dokumen per Prodi', value: docList.length, icon: '📊' },
            ].map((s, i) => (
              <div key={i} className="card !p-4 flex items-center gap-4">
                <div className="text-3xl leading-none">{s.icon}</div>
                <div>
                  <div className="text-2xl font-extrabold text-[var(--color-text)] leading-none">{s.value}</div>
                  <div className="text-xs text-[var(--color-text-muted)] font-semibold mt-1 leading-tight">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-1 bg-[var(--color-bg)] p-1 rounded-lg mb-6 w-fit border border-[var(--color-border)]" role="tablist">
            {[
              { id: 'prodi',   label: 'Program Studi', count: prodiList.length },
              { id: 'kategori', label: 'Kategori Dokumen', count: categoryList.length },
              { id: 'dokumen', label: 'Dokumen Wajib',  count: docList.length },
            ].map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={'flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer border-none ' + (activeTab === tab.id ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]')}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                <span className={'text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center ' + (activeTab === tab.id ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'bg-[var(--color-border)] text-[var(--color-text-muted)]')}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20 text-[var(--color-primary)]">
               <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            </div>
          ) : activeTab === 'prodi' && (
            <div className="card animate-[fadeIn_0.3s_ease]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <h2 className="card-title !mb-0">Daftar Program Studi</h2>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex items-center gap-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 focus-within:border-[var(--color-primary)] focus-within:shadow-[0_0_0_3px_var(--color-primary-light)] transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-muted)] shrink-0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" className="bg-transparent border-none outline-none py-2 text-sm text-[var(--color-text)] w-[180px] placeholder:text-[var(--color-text-muted)]" placeholder="Cari program studi..." value={prodiSearch} onChange={e => setProdiSearch(e.target.value)} aria-label="Cari program studi" />
                  </div>
                  <button className="btn btn-primary" onClick={openAddProdi}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Tambah Prodi
                  </button>
                </div>
              </div>

              {filteredProdis.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--color-text-muted)]">
                  <div className="text-5xl">🔍</div>
                  <p className="font-semibold">{prodiSearch ? 'Prodi tidak ditemukan.' : 'Belum ada program studi.'}</p>
                  {!prodiSearch && <button className="btn btn-primary mt-2" onClick={openAddProdi}>+ Tambah Prodi Pertama</button>}
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table" aria-label="Daftar program studi">
                    <thead>
                      <tr>
                        <th scope="col" style={{ width: 50 }}>No</th>
                        <th scope="col">Nama Program Studi</th>
                        <th scope="col" style={{ width: 150 }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProdis.map((prodi, idx) => (
                        <tr key={prodi.id}>
                          <td className="text-[var(--color-text-muted)]">{idx + 1}</td>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] font-extrabold text-sm shrink-0">
                                {prodi.nama.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-[var(--color-text)]">{prodi.nama}</span>
                            </div>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button className="btn btn-sm btn-outline" onClick={() => openEditProdi(prodi)} aria-label={'Edit ' + prodi.nama}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Edit
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => setDeleteProdiId(prodi.id)} aria-label={'Hapus ' + prodi.nama}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
                Menampilkan <strong>{filteredProdis.length}</strong> dari <strong>{prodiList.length}</strong> program studi
              </div>
            </div>
          )}


          {!loading && activeTab === 'kategori' && (
            <div className="card animate-[fadeIn_0.3s_ease]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <h2 className="card-title !mb-0">Daftar Kategori Dokumen</h2>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex items-center gap-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 focus-within:border-[var(--color-primary)] focus-within:shadow-[0_0_0_3px_var(--color-primary-light)] transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-muted)] shrink-0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" className="bg-transparent border-none outline-none py-2 text-sm text-[var(--color-text)] w-[180px] placeholder:text-[var(--color-text-muted)]" placeholder="Cari kategori..." value={categorySearch} onChange={e => setCategorySearch(e.target.value)} aria-label="Cari kategori" />
                  </div>
                  <button className="btn btn-primary" onClick={openAddCategory}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Tambah Kategori
                  </button>
                </div>
              </div>

              {filteredCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--color-text-muted)]">
                  <div className="text-5xl">🗂️</div>
                  <p className="font-semibold">{categorySearch ? 'Kategori tidak ditemukan.' : 'Belum ada kategori dokumen.'}</p>
                  {!categorySearch && <button className="btn btn-primary mt-2" onClick={openAddCategory}>+ Tambah Kategori Pertama</button>}
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table" aria-label="Daftar kategori">
                    <thead>
                      <tr>
                        <th scope="col" style={{ width: 50 }}>No</th>
                        <th scope="col">Nama Kategori</th>
                        <th scope="col">Keterangan</th>
                        <th scope="col" style={{ width: 150 }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCategories.map((cat, idx) => (
                        <tr key={cat.id}>
                          <td className="text-[var(--color-text-muted)]">{idx + 1}</td>
                          <td>
                            <span className="font-semibold text-[var(--color-text)]">{cat.name}</span>
                          </td>
                          <td>
                            <span className="text-sm text-[var(--color-text-muted)]">{cat.description || '-'}</span>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button className="btn btn-sm btn-outline" onClick={() => openEditCategory(cat)}>
                                Edit
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => setDeleteCategoryId(cat.id)}>
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'dokumen' && (
            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <h2 className="card-title !mb-0">Daftar Dokumen Wajib</h2>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex items-center gap-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 focus-within:border-[var(--color-primary)] focus-within:shadow-[0_0_0_3px_var(--color-primary-light)] transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-muted)] shrink-0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" className="bg-transparent border-none outline-none py-2 text-sm text-[var(--color-text)] w-[180px] placeholder:text-[var(--color-text-muted)]" placeholder="Cari kode atau nama..." value={docSearch} onChange={e => setDocSearch(e.target.value)} aria-label="Cari dokumen" />
                  </div>
                  <select className="h-10 px-3 border border-[var(--color-border)] rounded-lg bg-white text-sm text-[var(--color-text)] cursor-pointer focus:outline-none focus:border-[var(--color-primary)]" value={docFilter} onChange={e => setDocFilter(e.target.value)}>
                    <option value="">Semua Kategori</option>
                    {categoryList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button className="btn btn-primary" onClick={openAddDoc}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Tambah Dokumen
                  </button>
                </div>
              </div>

              {filteredDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--color-text-muted)]">
                  <div className="text-5xl">📂</div>
                  <p className="font-semibold">{docSearch || docFilter ? 'Dokumen tidak ditemukan.' : 'Belum ada dokumen wajib.'}</p>
                  {!docSearch && !docFilter && <button className="btn btn-primary mt-2" onClick={openAddDoc}>+ Tambah Dokumen Pertama</button>}
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table" aria-label="Daftar dokumen wajib">
                    <thead>
                      <tr>
                        <th scope="col" style={{ width: 50 }}>No</th>
                        <th scope="col" style={{ width: 90 }}>Kode</th>
                        <th scope="col">Nama Dokumen / Indikator</th>
                        <th scope="col">Panduan Upload</th>
                        <th scope="col" style={{ width: 150 }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocs.map((doc, idx) => (
                        <tr key={doc.id}>
                          <td className="text-[var(--color-text-muted)]">{idx + 1}</td>
                          <td>
                            <span className="font-mono text-xs font-bold bg-[var(--color-primary-light)] text-[var(--color-primary)] px-2 py-1 rounded">{doc.kode}</span>
                          </td>
                          <td><span className="font-semibold text-[var(--color-text)]">{doc.nama}</span><div className="text-xs text-[var(--color-text-muted)] mt-1">{doc.category?.name || '<Tanpa Kategori>'}</div></td>
                          <td>
                            <span className="text-sm text-[var(--color-text-muted)] line-clamp-2" title={doc.help}>
                              {doc.help || <em className="italic text-[var(--color-text-light)]">—</em>}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button className="btn btn-sm btn-outline" onClick={() => openEditDoc(doc)} aria-label={'Edit ' + doc.kode}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Edit
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => setDeleteDocId(doc.id)} aria-label={'Hapus ' + doc.kode}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
                Menampilkan <strong>{filteredDocs.length}</strong> dari <strong>{docList.length}</strong> dokumen wajib
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}