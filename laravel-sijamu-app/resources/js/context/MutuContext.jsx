'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const MutuContext = createContext(null);

export function MutuProvider({ children }) {
  const [mutuDocs, setMutuDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/mutu-documents');
        setMutuDocs(res.data);
      } catch (err) {
        console.error("Gagal mengambil data dokumen mutu", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const addMutuDoc = useCallback(async (prodiId, indicatorId, file) => {
    // Validasi: hanya PDF yang diterima
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      throw new Error('Hanya file PDF yang diizinkan.');
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Ukuran file melebihi batas 10MB.');
    }

    const formData = new FormData();
    formData.append('study_program_id', prodiId);
    formData.append('document_indicator_id', indicatorId);
    formData.append('file', file);

    const res = await axios.post('/api/mutu-documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const newDoc = res.data.document;

    setMutuDocs(prev => {
      const filtered = prev.filter(d => !(d.prodiId == prodiId && d.indicatorId == indicatorId));
      return [...filtered, newDoc];
    });

    return newDoc.file;
  }, []);

  const deleteMutuDoc = useCallback(async (docId) => {
    await axios.delete(`/api/mutu-documents/${docId}`);
    setMutuDocs(prev => prev.filter(d => d.id !== docId));
  }, []);

  return (
    <MutuContext.Provider value={{ mutuDocs, addMutuDoc, deleteMutuDoc, loading }}>
      {children}
    </MutuContext.Provider>
  );
}

export function useMutu() {
  const context = useContext(MutuContext);
  if (!context) {
    throw new Error('useMutu must be used within a MutuProvider');
  }
  return context;
}
