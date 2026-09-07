'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const PeriodContext = createContext(null);

export function PeriodProvider({ children }) {
  const [periods, setPeriods] = useState([]);
  const [activePeriodId, setActivePeriodId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil data periode dari database backend via API
  const fetchPeriods = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/admin/api/periods');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setPeriods(res.data);
        const current = res.data.find(p => p.isCurrent) || res.data[0];
        setActivePeriodId(prev => {
          const stillExists = res.data.some(p => String(p.id) === String(prev));
          return stillExists ? prev : current.id;
        });
      } else {
        setPeriods([]);
      }
    } catch (err) {
      console.error('Gagal memuat data periode akademik dari database:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  // Tambah periode baru ke database
  const createPeriod = useCallback(async (data) => {
    const res = await axios.post('/admin/api/periods', {
      name: data.name,
      semester: data.semester,
      upload_deadline: data.uploadDeadline || null,
    });
    await fetchPeriods();
    return res.data;
  }, [fetchPeriods]);

  // Update periode yang ada di database
  const updatePeriod = useCallback(async (id, data) => {
    const res = await axios.put(`/admin/api/periods/${id}`, {
      name: data.name,
      semester: data.semester,
      upload_deadline: data.uploadDeadline || null,
    });
    await fetchPeriods();
    return res.data;
  }, [fetchPeriods]);

  // Aktifkan periode akademik tertentu
  const activatePeriod = useCallback(async (id) => {
    const res = await axios.patch(`/admin/api/periods/${id}/activate`);
    await fetchPeriods();
    setActivePeriodId(id);
    return res.data;
  }, [fetchPeriods]);

  // Hapus periode akademik arsip
  const deletePeriod = useCallback(async (id) => {
    const res = await axios.delete(`/admin/api/periods/${id}`);
    await fetchPeriods();
    return res.data;
  }, [fetchPeriods]);

  // Hitung periode aktif yang sedang dipilih di sesi
  const currentPeriod = periods.find(p => p.isCurrent) || periods[0] || null;
  const activePeriod = periods.find(p => String(p.id) === String(activePeriodId)) || currentPeriod || {
    id: null,
    name: '—',
    semester: '—',
    isCurrent: false,
    uploadDeadline: null,
  };

  const isArchive = activePeriod?.isCurrent !== undefined ? !activePeriod.isCurrent : false;
  
  const isDeadlinePassed = activePeriod?.uploadDeadline
    ? new Date() > new Date(activePeriod.uploadDeadline)
    : false;

  return (
    <PeriodContext.Provider
      value={{
        periods,
        setPeriods,
        activePeriod,
        activePeriodId,
        setActivePeriodId,
        isArchive,
        isDeadlinePassed,
        loading,
        fetchPeriods,
        createPeriod,
        updatePeriod,
        activatePeriod,
        deletePeriod,
      }}
    >
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod() {
  const ctx = useContext(PeriodContext);
  if (!ctx) throw new Error('usePeriod must be used within <PeriodProvider>');
  return ctx;
}
