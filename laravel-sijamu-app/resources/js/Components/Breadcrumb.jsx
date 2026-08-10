'use client';

import { Link } from '@inertiajs/react';

export default function Breadcrumb({ items }) {
  return (
    <nav className="mb-5" aria-label="Jejak navigasi (Breadcrumb)">
      <ol className="list-none flex items-center flex-wrap gap-1 m-0 p-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1">
              {isLast ? (
                <span className="text-sm text-[var(--color-text-muted)] font-semibold" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  {item.href ? (
                    <Link href={item.href} className="text-sm text-[var(--color-primary)] font-medium transition-colors hover:text-[var(--color-primary-dark)] hover:underline">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-sm text-[var(--color-primary)] font-medium transition-colors hover:text-[var(--color-primary-dark)] hover:underline">{item.label}</span>
                  )}
                  <span className="text-sm text-[var(--color-text-light)] select-none leading-none" aria-hidden="true">›</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

