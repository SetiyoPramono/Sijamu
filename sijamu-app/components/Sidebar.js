'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './Sidebar.module.css';

const navGroups = [
  {
    label: 'Menu Utama',
    items: [
      {
        href: '/dashboard',
        label: 'Beranda',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        ),
      },
      {
        href: '/auditor',
        label: 'Ruang Evaluasi',
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
    items: [
      {
        href: '/admin/users',
        label: 'Pengguna',
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

export default function Sidebar() {
  const pathname = usePathname();

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

      {/* Nav */}
      <nav className={styles.nav} role="navigation">
        {navGroups.map((group) => (
          <div key={group.label} className={styles.navSection}>
            <span className={styles.navSectionLabel}>{group.label}</span>
            <ul className={styles.navList}>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
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
        <div className={styles.userAvatar} aria-hidden="true">A</div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>Dr. Ahmad Fauzi</div>
          <div className={styles.userRole}>Administrator</div>
        </div>
        <Link href="/" className={styles.logoutBtn} aria-label="Keluar dari sistem" title="Keluar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </Link>
      </div>
    </aside>
  );
}
