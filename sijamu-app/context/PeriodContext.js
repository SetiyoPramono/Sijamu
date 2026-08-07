'use client';

import { createContext, useContext, useState } from 'react';

const MOCK_PERIODS = [
  { id: '2026-ganjil', name: '2026/2027', semester: 'Ganjil', isCurrent: true },
  { id: '2025-genap',  name: '2025/2026', semester: 'Genap',  isCurrent: false },
  { id: '2025-ganjil', name: '2025/2026', semester: 'Ganjil', isCurrent: false },
];

const PeriodContext = createContext(null);

export function PeriodProvider({ children }) {
  const [periods] = useState(MOCK_PERIODS);
  
  // Default ke periode berjalan (isCurrent = true)
  const currentPeriod = MOCK_PERIODS.find(p => p.isCurrent) || MOCK_PERIODS[0];
  const [activePeriodId, setActivePeriodId] = useState(currentPeriod.id);

  const activePeriod = periods.find(p => p.id === activePeriodId) || periods[0];
  const isArchive = !activePeriod.isCurrent;

  return (
    <PeriodContext.Provider value={{ periods, activePeriod, activePeriodId, setActivePeriodId, isArchive }}>
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod() {
  const ctx = useContext(PeriodContext);
  if (!ctx) throw new Error('usePeriod must be used within <PeriodProvider>');
  return ctx;
}
