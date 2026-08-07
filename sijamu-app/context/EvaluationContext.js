'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const EvaluationContext = createContext(null);

export function EvaluationProvider({ children }) {
  const [evaluations, setEvaluations] = useState([]);
  const [docEvaluations, setDocEvaluations] = useState({}); // { [docId]: { score, catatan, temuan, status } }
  const [loading, setLoading] = useState(true);

  // Initial mockup evaluation data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 400));
      setEvaluations([
        { prodi: 'Teknik Informatika', status: 'success', kelengkapan: 92, missing: 2, auditor: 'Dr. Ahmad F.' },
        { prodi: 'Pendidikan Matematika', status: 'success', kelengkapan: 88, missing: 3, auditor: 'Prof. Siti R.' },
        { prodi: 'Manajemen', status: 'warning', kelengkapan: 61, missing: 12, auditor: 'Dr. Budi S.' },
        { prodi: 'Pendidikan Bahasa Inggris', status: 'warning', kelengkapan: 55, missing: 14, auditor: '-' },
        { prodi: 'Akuntansi', status: 'danger', kelengkapan: 28, missing: 22, auditor: '-' },
        { prodi: 'Pendidikan IPA', status: 'danger', kelengkapan: 15, missing: 27, auditor: '-' },
        { prodi: 'Hukum', status: 'success', kelengkapan: 95, missing: 1, auditor: 'Dr. Wati N.' },
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const updateEvaluation = useCallback(async (prodi, score, maxScore, auditorName = 'Auditor Aktif') => {
    // Simulating API save
    await new Promise(r => setTimeout(r, 800));
    
    // Simple logic to translate score to status
    const percentage = (score / maxScore) * 100;
    let newStatus = 'danger';
    if (percentage > 80) newStatus = 'success';
    else if (percentage > 50) newStatus = 'warning';

    setEvaluations(prev => {
      const existingIdx = prev.findIndex(e => e.prodi === prodi);
      
      const newEval = {
        prodi,
        status: newStatus,
        kelengkapan: Math.round(percentage),
        missing: Math.round(100 - percentage), // Simplified logic
        auditor: auditorName
      };

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = newEval;
        return next;
      }
      return [...prev, newEval];
    });
  }, []);

  const evaluateDocument = useCallback(async (docId, prodi, totalScore, maxScore, catatan = '', temuan = '', auditorName = 'Auditor Aktif') => {
    // Simulating API save
    await new Promise(r => setTimeout(r, 600));

    const percentage = (score, max) => max > 0 ? (score / max) * 100 : 0;
    const pct = percentage(totalScore, maxScore);
    
    // Status logika: Lulus jika di atas 80%, sisanya Perlu Revisi
    let status = pct > 80 ? 'success' : 'warning';
    
    setDocEvaluations(prev => ({
      ...prev,
      [docId]: {
        score: totalScore,
        maxScore,
        catatan,
        temuan,
        status, // 'success' = Lulus, 'warning' = Perlu Revisi
        auditor: auditorName,
        updatedAt: new Date().toISOString()
      }
    }));

    // Update global aggregate for the dashboard
    await updateEvaluation(prodi, totalScore, maxScore, auditorName);
  }, [updateEvaluation]);

  return (
    <EvaluationContext.Provider value={{ evaluations, docEvaluations, updateEvaluation, evaluateDocument, loading }}>
      {children}
    </EvaluationContext.Provider>
  );
}

export function useEvaluation() {
  const context = useContext(EvaluationContext);
  if (!context) {
    throw new Error('useEvaluation must be used within a EvaluationProvider');
  }
  return context;
}
