'use client';

import Link from 'next/link';
import styles from './Breadcrumb.module.css';

export default function Breadcrumb({ items }) {
  return (
    <nav className={styles.breadcrumb} aria-label="Jejak navigasi (Breadcrumb)">
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className={styles.item}>
              {isLast ? (
                <span className={styles.current} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link href={item.href} className={styles.link}>
                    {item.label}
                  </Link>
                  <span className={styles.separator} aria-hidden="true">›</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
