/**
 * middleware.js — Route protection untuk SIJAMU 2.0
 *
 * Cara kerja:
 * - Semua route di `matcher` dicek keberadaan cookie `sijamu_session`
 * - Jika tidak ada → redirect ke halaman login (/)
 * - Halaman publik (/) tidak dicek
 *
 * TODO: Saat backend nyata sudah ada, ganti pengecekan cookie ini
 *       dengan validasi JWT ke endpoint /api/auth/verify menggunakan
 *       NextResponse dari middleware atau edge runtime.
 */

import { NextResponse } from 'next/server';

/** Route yang memerlukan autentikasi */
const PROTECTED = [
  '/dashboard',
  '/rps',
  '/upload',
  '/auditor',
  '/reports',
  '/admin',
];

/** Route yang hanya boleh diakses oleh role tertentu */
const ROLE_ROUTES = {
  '/admin': ['admin'],
  '/auditor': ['auditor', 'admin'],
};

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Cek apakah route ini dilindungi
  const isProtected = PROTECTED.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Baca session cookie (diset oleh AuthContext via document.cookie)
  const sessionCookie = request.cookies.get('sijamu_session');

  if (!sessionCookie) {
    // Belum login → redirect ke halaman login
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Cek role-based restriction
  for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route)) {
      try {
        const session = JSON.parse(decodeURIComponent(sessionCookie.value));
        if (!allowedRoles.includes(session.role)) {
          // Tidak punya akses → redirect ke dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch {
        // Cookie rusak → redirect ke login
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/rps/:path*',
    '/upload/:path*',
    '/auditor/:path*',
    '/reports/:path*',
    '/admin/:path*',
  ],
};
