'use client';

import { useState, useCallback } from 'react';
import styles from './Toast.module.css';

let toastId = 0;

// Singleton state via module-level variable + listeners
const listeners = new Set();
let toasts = [];

function notifyListeners() {
  listeners.forEach((fn) => fn([...toasts]));
}

export function addToast(message, type = 'info', duration = 3500) {
  const id = ++toastId;
  toasts = [...toasts, { id, message, type }];
  notifyListeners();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notifyListeners();
  }, duration);
}

export function ToastContainer() {
  const [items, setItems] = useState([]);

  const subscribe = useCallback((fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);

  useState(() => {
    const unsub = subscribe(setItems);
    return unsub;
  });

  // Use useEffect to subscribe
  if (typeof window !== 'undefined') {
    // Register listener if not registered
  }

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {items.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type}`}
          role="alert"
        >
          {t.type === 'success' && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          )}
          {t.type === 'error' && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          )}
          {t.type === 'warning' && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          )}
          {t.type === 'info' && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
