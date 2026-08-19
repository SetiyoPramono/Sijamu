'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UploadConfigContext = createContext(null);

export function UploadConfigProvider({ children }) {
  const [prodiList, setProdiList] = useState([]);
  const [docList, setDocList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodiRes, docRes, catRes] = await Promise.all([
          axios.get('/admin/api/prodis'),
          axios.get('/admin/api/docs'),
          axios.get('/admin/api/categories')
        ]);
        
        const mappedProdis = prodiRes.data.map(p => ({
          id: p.id,
          nama: p.name
        }));
        
        setProdiList(mappedProdis);
        setDocList(docRes.data);
        setCategoryList(catRes.data);
      } catch (err) {
        console.error("Gagal mengambil konfigurasi upload", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <UploadConfigContext.Provider value={{ prodiList, setProdiList, docList, setDocList, categoryList, setCategoryList, loading }}>
      {children}
    </UploadConfigContext.Provider>
  );
}

export function useUploadConfig() {
  const ctx = useContext(UploadConfigContext);
  if (!ctx) throw new Error('useUploadConfig must be used within UploadConfigProvider');
  return ctx;
}