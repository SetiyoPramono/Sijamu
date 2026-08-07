'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const MutuContext = createContext(null);

export function MutuProvider({ children }) {
  const [mutuDocs, setMutuDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 400));
      setMutuDocs([
        { id: 1, prodi: 'Teknik Informatika', indicatorId: 1, file: { name: 'SK_VMTS_TI.pdf', url: '/dummy.pdf', type: 'application/pdf', size: 102400 } }
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const addMutuDoc = useCallback(async (prodi, indicatorId, file) => {
    await new Promise(r => setTimeout(r, 1000));
    const savedFile = { 
      name: file.name, 
      size: file.size, 
      type: file.type, 
      url: URL.createObjectURL(file) 
    };
    
    const newDoc = {
      id: Date.now() + Math.random(),
      prodi,
      indicatorId,
      file: savedFile
    };

    setMutuDocs(prev => {
      const filtered = prev.filter(d => !(d.prodi === prodi && d.indicatorId === indicatorId));
      return [...filtered, newDoc];
    });

    return savedFile;
  }, []);

  const deleteMutuDoc = useCallback(async (docId) => {
    await new Promise(r => setTimeout(r, 500));
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
