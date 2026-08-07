'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePeriod } from '@/context/PeriodContext';
import styles from './Sidebar.module.css';

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
        allowedRoles: ['admin', 'dekan', 'koprodi'],
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
        allowedRoles: ['admin', 'dekan', 'koprodi', 'taskforce'],
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
        allowedRoles: ['auditor', 'admin'],
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
        allowedRoles: ['admin', 'koprodi', 'taskforce'],
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
        allowedRoles: ['admin', 'dekan', 'koprodi'],
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
    allowedRoles: ['admin'], // grup ini hanya tampil untuk admin
    items: [
      {
        href: '/admin/rps',
        label: 'Manajemen RPS',
        allowedRoles: ['admin'],
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
        allowedRoles: ['admin'],
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
        href: '/admin/settings',
        label: 'Pengaturan',
        allowedRoles: ['admin'],
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
  const pathname    = usePathname();
  const { user, logout } = useAuth();
  const { periods, activePeriodId, setActivePeriodId } = usePeriod();
  const userRole    = user?.role;

  // Filter grup dan item berdasarkan role
  const visibleGroups = navGroups
    .filter(g => !g.allowedRoles || !userRole || g.allowedRoles.includes(userRole))
    .map(g => ({
      ...g,
      items: g.items.filter(
        item => !item.allowedRoles || !userRole || item.allowedRoles.includes(userRole)
      ),
    }))
    .filter(g => g.items.length > 0);

  return (
    <aside className={styles.sidebar} aria-label="Menu navigasi utama">
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        <div>
          <div className={styles.logoName}>SIJAMU 2.0</div>
          <div className={styles.logoSub}>UNIPGRI Banyuwangi</div>
        </div>
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
      <nav className={styles.nav} role="navigation">
        {visibleGroups.map((group) => (
          <div key={group.label} className={styles.navSection}>
            <span className={styles.navSectionLabel}>{group.label}</span>
            <ul className={styles.navList}>
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.href + item.label}>
                    <Link
                      href={item.href}
                      className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                      <span className={styles.navLabel}>{item.label}</span>
                      {isActive && <span className={styles.activeIndicator} />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User info */}
      <div className={styles.userCard}>
        <div className={styles.userAvatar} aria-hidden="true">
          {user?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user?.name ?? 'Pengguna'}</div>
          <div className={styles.userRole}>{ROLE_LABELS[userRole] ?? userRole ?? '—'}</div>
        </div>
        <button
          className={styles.logoutBtn}
          onClick={logout}
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
  );
}
