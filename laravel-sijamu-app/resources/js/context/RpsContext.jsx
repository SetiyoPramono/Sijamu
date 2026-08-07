'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

/* ── Initial seed data (mock — diganti fetch dari API saat backend siap) ──── */
const MOCK_COURSES = [
  { id: 1, code: 'MK101', name: 'Pemrograman Web Lanjut',  sks: 3, semester: 4, dosen: 'Dr. Ahmad Fauzi, M.Kom', prodi: 'Teknik Informatika',    rpsFiles: [] },
  { id: 2, code: 'MK102', name: 'Kecerdasan Buatan',       sks: 3, semester: 5, dosen: 'Dr. Siti Rahayu, M.T',   prodi: 'Teknik Informatika',    rpsFiles: [] },
  { id: 3, code: 'MK201', name: 'Statistika Terapan',      sks: 2, semester: 3, dosen: 'Prof. Budi Santoso, Dr.',prodi: 'Pendidikan Matematika', rpsFiles: [] },
];

const RpsContext = createContext(null);

export function RpsProvider({ children }) {
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  /* ── Initial fetch ──────────────────────────────────────────────
     TODO: Ganti dengan fetch ke backend:
       const data = await apiGet('/api/mata-kuliah');
       setCourses(data);
   ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulasi network delay — hapus saat sudah ada backend
        await new Promise(r => setTimeout(r, 400));
        setCourses(MOCK_COURSES);
      } catch (err) {
        setError(err.message ?? 'Gagal memuat data mata kuliah.');
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  /* ── Add course ─────────────────────────────────────────────────
     TODO: const saved = await apiPost('/api/mata-kuliah', data);
           setCourses(prev => [...prev, saved]);
   ─────────────────────────────────────────────────────────────── */
  const addCourse = useCallback(async (data) => {
    const newCourse = {
      ...data,
      id: Date.now(),
      sks: Number(data.sks),
      semester: Number(data.semester),
      rpsFiles: [],
    };
    setCourses(prev => [...prev, newCourse]);
    return newCourse;
  }, []);

  /* ── Update course ──────────────────────────────────────────────
     TODO: await apiPut(`/api/mata-kuliah/${updated.id}`, updated);
   ─────────────────────────────────────────────────────────────── */
  const updateCourse = useCallback(async (updated) => {
    setCourses(prev =>
      prev.map(c =>
        c.id === updated.id
          ? { ...c, ...updated, sks: Number(updated.sks), semester: Number(updated.semester) }
          : c
      )
    );
  }, []);

  /* ── Delete course ──────────────────────────────────────────────
     TODO: await apiDelete(`/api/mata-kuliah/${id}`);
   ─────────────────────────────────────────────────────────────── */
  const deleteCourse = useCallback(async (id) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  }, []);

  /* ── Upload RPS files ────────────────────────────────────────────
     TODO: const formData = new FormData();
           files.forEach(f => formData.append('files', f));
           formData.append('courseId', courseId);
           const savedFiles = await apiUpload('/api/rps/upload', formData);
           // savedFiles = [{ id, name, size, type, url, uploadedAt }]
   ─────────────────────────────────────────────────────────────── */
  const uploadRpsFile = useCallback(async (courseId, files) => {
    const fileArray = Array.from(files);
    const newFileObjs = fileArray.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file), // TODO: ganti dengan URL dari server
      uploadedAt: new Date().toISOString(),
    }));

    setCourses(prev =>
      prev.map(c => 
        c.id === courseId 
          ? { ...c, rpsFiles: [...(c.rpsFiles || []), ...newFileObjs] } 
          : c
      )
    );
    return newFileObjs;
  }, []);

  /* ── Remove RPS file ────────────────────────────────────────────
     TODO: await apiDelete(`/api/rps/${courseId}/file/${fileId}`);
   ─────────────────────────────────────────────────────────────── */
  const removeRpsFile = useCallback(async (courseId, fileId) => {
    setCourses(prev =>
      prev.map(c => 
        c.id === courseId 
          ? { ...c, rpsFiles: (c.rpsFiles || []).filter(f => f.id !== fileId) } 
          : c
      )
    );
  }, []);

  /* ── Refresh dari server ─────────────────────────────────────── */
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 400));
      setCourses(MOCK_COURSES); // TODO: fetch dari API
    } catch (err) {
      setError(err.message ?? 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <RpsContext.Provider
      value={{ courses, loading, error, addCourse, updateCourse, deleteCourse, uploadRpsFile, removeRpsFile, refetch }}
    >
      {children}
    </RpsContext.Provider>
  );
}

export function useRps() {
  const ctx = useContext(RpsContext);
  if (!ctx) throw new Error('useRps must be used inside <RpsProvider>');
  return ctx;
}
