'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './HelpTooltip.module.css';

export default function HelpTooltip({ title, content }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <span className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Bantuan: ${title}`}
        aria-expanded={open}
        type="button"
      >
        ?
      </button>
      {open && (
        <div className={styles.popup} role="tooltip">
          <div className={styles.popupHeader}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <strong>{title}</strong>
          </div>
          <p className={styles.popupBody}>{content}</p>
          <button
            className={styles.closeBtn}
            onClick={() => setOpen(false)}
            aria-label="Tutup bantuan"
          >
            Tutup
          </button>
        </div>
      )}
    </span>
  );
}
