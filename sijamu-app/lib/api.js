/**
 * lib/api.js — Centralized API helper untuk SIJAMU 2.0
 *
 * Semua panggilan ke backend melewati helper ini agar:
 * - Token JWT disertakan otomatis
 * - Error handling terpusat
 * - Base URL mudah diganti (cukup ganti API_BASE)
 *
 * TODO: Set API_BASE ke URL backend nyata saat production,
 *       misalnya: 'https://api.sijamu.unipgri.ac.id'
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

function getToken() {
  try {
    const raw = localStorage.getItem('sijamu_token');
    return raw ? JSON.parse(raw).value : null;
  } catch {
    return null;
  }
}

/**
 * Wrapper utama untuk semua API call.
 * @param {string}  path    - Endpoint path, misal: '/api/mata-kuliah'
 * @param {object}  options - Fetch options (method, body, dll)
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body instanceof FormData
      ? options.body
      : options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message ?? `Request gagal: ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

/* ── Convenience methods ─────────────────────────────────────── */
export const apiGet    = (path)         => apiFetch(path);
export const apiPost   = (path, body)   => apiFetch(path, { method: 'POST',   body });
export const apiPut    = (path, body)   => apiFetch(path, { method: 'PUT',    body });
export const apiDelete = (path)         => apiFetch(path, { method: 'DELETE' });
export const apiUpload = (path, form)   => apiFetch(path, { method: 'POST',   body: form });
