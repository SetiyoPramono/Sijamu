'use client';

import { usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { useAuth } from '@/context/AuthContext';
import { usePeriod } from '@/context/PeriodContext';
import { useState, useEffect } from 'react';

/* ── Nav groups dengan kontrol akses per role ─────────────────
   allowedRoles: undefined → semua role bisa akses
   allowedRoles: ['admin', 'dekan'] → hanya role tersebut
──────────────────────────────────────────────────────────────── */
const navGroups = [
  {
    label: 'Menu Utama',
    items: [
      {
        href: '/dashboard',
        label: 'Beranda',
        requiredPermission: 'view_dashboard',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        ),
      },
      {
        href: '/rps',
        label: 'RPS (Mata Kuliah)',
        requiredPermission: 'view_rps',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        ),
      },
      {
        href: '/auditor',
        label: 'Ruang Evaluasi',
        requiredPermission: 'start_evaluation',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        ),
      },
      {
        href: '/upload',
        label: 'Unggah Dokumen',
        requiredPermission: 'upload_document',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        ),
      },
      {
        href: '/reports',
        label: 'Laporan',
        requiredPermission: 'view_report',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Administrasi',
    requiredPermission: 'manage_users', // grup ini tampil jika punya minimal manage_users
    items: [
      {
        href: '/admin/rps',
        label: 'Manajemen RPS',
        requiredPermission: 'manage_rps',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        ),
      },
      {
        href: '/admin/users',
        label: 'Pengguna',
        requiredPermission: 'manage_users',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        ),
      },
      {
        href: '/admin/upload',
        label: 'Manajemen Upload',
        requiredPermission: 'manage_upload',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
            <circle cx="19" cy="5" r="3" fill="currentColor" stroke="none"/>
            <line x1="19" y1="4" x2="19" y2="6" stroke="white" strokeWidth="1.5"/>
            <line x1="18" y1="5" x2="20" y2="5" stroke="white" strokeWidth="1.5"/>
          </svg>
        ),
      },
      {
        href: '/admin/settings',
        label: 'Pengaturan',
        requiredPermission: 'system_settings',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.07 4.93A10 10 0 0 1 21 12a10 10 0 0 1-10 10 10 10 0 0 1-8.07-4.07"/>
            <path d="M4.93 4.93A10 10 0 0 1 12 3"/>
          </svg>
        ),
      },
    ],
  },
];

/** Label role yang ramah tampilan */
const ROLE_LABELS = {
  admin:     'Administrator',
  dekan:     'Dekan / Pimpinan',
  koprodi:   'Koordinator Prodi',
  taskforce: 'Staf / Task Force',
  auditor:   'Auditor',
};

export default function Sidebar() {
  const { url: pathname } = usePage();
  const { user, logout, hasPermission } = useAuth();
  const { periods, activePeriodId, setActivePeriodId } = usePeriod();
  const userRole    = user?.role;
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Filter grup dan item berdasarkan izin (permissions)
  const visibleGroups = navGroups
    .filter(g => !g.requiredPermission || (user && hasPermission(g.requiredPermission)))
    .map(g => ({
      ...g,
      items: g.items.filter(
        item => !item.requiredPermission || (user && hasPermission(item.requiredPermission))
      ),
    }))
    .filter(g => g.items.length > 0);

  return (
    <>
      {/* Mobile Top Header (only visible on max-lg) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-gray-200 z-[90] flex items-center justify-between px-4 shadow-sm" aria-label="Bilah navigasi seluler">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-md flex items-center justify-center shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div className="font-extrabold text-[var(--color-primary)] tracking-tight">SIJAMU 2.0</div>
        </div>
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Buka menu navigasi"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[95] transition-opacity" 
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 w-[var(--sidebar-width)] h-screen bg-[var(--sidebar-bg)] flex flex-col p-5 z-[100] overflow-y-auto overflow-x-hidden shadow-[4px_0_20px_rgba(0,0,0,0.15)] transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : 'max-lg:-translate-x-full'}`} aria-label="Menu navigasi utama">
        {/* Logo */}
        <div className="flex items-center gap-3 py-3 px-1 mb-6 border-b border-white/10 pb-5">
          <div className="w-11 h-11 bg-[var(--color-primary)] rounded-md flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(26,86,219,0.4)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-lg font-extrabold text-white leading-[1.2] tracking-[-0.01em]">SIJAMU 2.0</div>
            <div className="text-xs text-[var(--sidebar-text)] opacity-75 leading-[1.3]">UNIPGRI Banyuwangi</div>
          </div>
          {/* Close button inside sidebar for mobile */}
          <button 
            className="lg:hidden w-8 h-8 rounded-md flex items-center justify-center bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors ml-auto"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Tutup menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Period Selector */}
        <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '4px',
            background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase' }}>
              Periode Akademik
            </label>
            <select 
              value={activePeriodId}
              onChange={(e) => setActivePeriodId(e.target.value)}
              style={{
                background: 'transparent', color: '#fff', border: 'none', 
                fontSize: '13px', fontWeight: 500, outline: 'none', cursor: 'pointer',
                width: '100%', padding: '0'
              }}
            >
              {periods.map(p => (
                <option key={p.id} value={p.id} style={{ color: '#000' }}>
                  {p.name} - {p.semester} {p.isCurrent ? '(Aktif)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-6" role="navigation">
          {visibleGroups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#c8d8f880] px-3 mb-2">{group.label}</span>
              <ul className="list-none flex flex-col gap-1 m-0 p-0">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <li key={item.href + item.label}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3 py-3 px-3 rounded-md text-[var(--sidebar-text)] text-base font-medium transition-colors hover:bg-white/10 hover:text-white relative no-underline ${isActive ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-semibold shadow-[0_4px_12px_rgba(26,86,219,0.35)]' : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className="flex items-center justify-center shrink-0 w-[22px]" aria-hidden="true">{item.icon}</span>
                        <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User info */}
        <div className="flex items-center gap-3 p-3 bg-white/10 rounded-md border-t border-white/10 pt-4 mt-auto shrink-0">
          <div className="w-[38px] h-[38px] bg-[var(--color-primary)] rounded-full flex items-center justify-center font-bold text-white text-base shrink-0" aria-hidden="true">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis">{user?.name ?? 'Pengguna'}</div>
            <div className="text-xs text-[var(--sidebar-text)] opacity-75">{ROLE_LABELS[userRole] ?? userRole ?? '—'}</div>
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-md text-[var(--sidebar-text)] transition-colors hover:bg-red-500/30 hover:text-red-300 shrink-0"
            onClick={() => { setIsMobileOpen(false); logout(); }}
            aria-label="Keluar dari sistem"
            title="Keluar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}

