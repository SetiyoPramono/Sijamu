'use client';

import { useState, useRef, useEffect } from 'react';

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
    <span className="relative inline-block align-middle" ref={ref}>
      <button
        className="w-[22px] h-[22px] rounded-full bg-[var(--color-primary)] text-white text-[13px] font-bold border-none cursor-pointer inline-flex items-center justify-center transition-all duration-150 shrink-0 ml-2 hover:bg-[var(--color-primary-dark)] hover:scale-110 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Bantuan: ${title}`}
        aria-expanded={open}
        type="button"
      >
        ?
      </button>
      {open && (
        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border border-[var(--color-border)] p-4 min-w-[280px] max-w-[340px] z-[500]" role="tooltip">
          <div className="flex items-center gap-2 mb-3 text-base font-semibold text-[var(--color-text)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <strong>{title}</strong>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] leading-[1.7] mb-3">{content}</p>
          <button
            className="text-sm font-semibold text-[var(--color-primary)] bg-transparent border-none cursor-pointer p-0 underline hover:text-[var(--color-primary-dark)]"
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

