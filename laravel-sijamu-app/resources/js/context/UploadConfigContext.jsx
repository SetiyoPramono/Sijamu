'use client';

import { createContext, useContext, useState } from 'react';

const initialProdis = [
  { id: 'prodi-1', nama: 'Teknik Informatika' },
  { id: 'prodi-2', nama: 'Pendidikan Matematika' },
  { id: 'prodi-3', nama: 'Manajemen' },
  { id: 'prodi-4', nama: 'Pendidikan Bahasa Inggris' },
  { id: 'prodi-5', nama: 'Akuntansi' },
  { id: 'prodi-6', nama: 'Pendidikan IPA' },
  { id: 'prodi-7', nama: 'Hukum' },
];

const initialDocs = [
  { id: 'doc-1',  kode: 'C1.1', nama: 'Visi, Misi, Tujuan, dan Strategi (VMTS)', help: 'Unggah dokumen VMTS yang telah disahkan Rektor. Format: PDF, maks. 10MB.' },
  { id: 'doc-2',  kode: 'C1.2', nama: 'Tata Pamong dan Tata Kelola', help: 'Dokumen SOP, SK Pengangkatan, dan Struktur Organisasi. Format: PDF.' },
  { id: 'doc-3',  kode: 'C1.3', nama: 'Sistem Penjaminan Mutu Internal', help: 'Bukti pelaksanaan audit mutu internal: notulen, laporan, tindak lanjut.' },
  { id: 'doc-4',  kode: 'C2.1', nama: 'Profil Dosen Tetap', help: 'CV dosen, SK dosen tetap, dan data PDDIKTI. Kumpulkan dalam 1 file ZIP.' },
  { id: 'doc-5',  kode: 'C2.2', nama: 'Kinerja Dosen (Tri Dharma)', help: 'Laporan kinerja dosen: pengajaran, penelitian, pengabdian masyarakat.' },
  { id: 'doc-6',  kode: 'C3.1', nama: 'Kurikulum', help: 'Dokumen kurikulum yang didalamnya memuat profil lulusan, CPL, dan RPS.' },
  { id: 'doc-7',  kode: 'C3.2', nama: 'Pelaksanaan Proses Pembelajaran', help: 'Berita acara perkuliahan, absensi, dan hasil evaluasi pembelajaran.' },
  { id: 'doc-8',  kode: 'C4.1', nama: 'Penelitian Dosen', help: 'Daftar penelitian, kontrak penelitian, dan laporan akhir. Maks. 2 tahun terakhir.' },
  { id: 'doc-9',  kode: 'C4.2', nama: 'Pengabdian Kepada Masyarakat', help: 'Dokumen PKM: proposal, laporan, dan foto kegiatan.' },
  { id: 'doc-10', kode: 'C5.1', nama: 'Hasil Studi Mahasiswa (IPK dan Lama Studi)', help: 'Data lulusan 3 tahun terakhir: IPK rata-rata dan rata-rata lama studi.' },
  { id: 'doc-11', kode: 'C5.2', nama: 'Kepuasan Pengguna Lulusan', help: 'Hasil tracer study atau kuesioner kepuasan pengguna lulusan.' },
  { id: 'doc-12', kode: 'C6.1', nama: 'Keuangan dan Sarana Prasarana', help: 'Laporan keuangan prodi dan daftar inventaris sarana-prasarana.' },
];

const UploadConfigContext = createContext(null);

export function UploadConfigProvider({ children }) {
  const [prodiList, setProdiList] = useState(initialProdis);
  const [docList,   setDocList]   = useState(initialDocs);

  return (
    <UploadConfigContext.Provider value={{ prodiList, setProdiList, docList, setDocList }}>
      {children}
    </UploadConfigContext.Provider>
  );
}

export function useUploadConfig() {
  const ctx = useContext(UploadConfigContext);
  if (!ctx) throw new Error('useUploadConfig must be used within UploadConfigProvider');
  return ctx;
}