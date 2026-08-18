'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

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
        const res = await axios.get('/admin/api/courses');
        setCourses(res.data);
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
    try {
      const res = await axios.post('/admin/api/courses', data);
      setCourses(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      throw err;
    }
  }, []);

  /* ── Update course ──────────────────────────────────────────────
     TODO: await apiPut(`/api/mata-kuliah/${updated.id}`, updated);
   ─────────────────────────────────────────────────────────────── */
  const updateCourse = useCallback(async (updated) => {
    try {
      const res = await axios.put(`/admin/api/courses/${updated.id}`, updated);
      setCourses(prev => prev.map(c => c.id === updated.id ? res.data : c));
    } catch (err) {
      throw err;
    }
  }, []);

  /* ── Delete course ──────────────────────────────────────────────
     TODO: await apiDelete(`/api/mata-kuliah/${id}`);
   ─────────────────────────────────────────────────────────────── */
  const deleteCourse = useCallback(async (id) => {
    try {
      await axios.delete(`/admin/api/courses/${id}`);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      throw err;
    }
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
    const uploadedFiles = [];

    for (const file of fileArray) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('course_id', courseId);

      try {
        const res = await axios.post('/admin/api/rps/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedFiles.push(res.data);
      } catch (err) {
        throw err;
      }
    }

    // Update local state so UI reflects immediately
    setCourses(prev =>
      prev.map(c =>
        c.id === courseId
          ? { ...c, rpsFiles: [...(c.rpsFiles || []), ...uploadedFiles] }
          : c
      )
    );
    return uploadedFiles;
  }, []);

  /* ── Remove RPS file ────────────────────────────────────────────
     TODO: await apiDelete(`/api/rps/${courseId}/file/${fileId}`);
   ─────────────────────────────────────────────────────────────── */
  const removeRpsFile = useCallback(async (courseId, fileId) => {
    try {
      await axios.delete(`/admin/api/rps/${fileId}`);
      setCourses(prev =>
        prev.map(c =>
          c.id === courseId
            ? { ...c, rpsFiles: (c.rpsFiles || []).filter(f => f.id !== fileId) }
            : c
        )
      );
    } catch (err) {
      throw err;
    }
  }, []);

  /* ── Refresh dari server ─────────────────────────────────────── */
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/admin/api/courses');
      setCourses(res.data);
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
