/**
 * Single source of truth for the backend location.
 *
 * Switching between local and live is a ONE LINE change: edit MODE below.
 * Every API call and every image URL in the app reads from this file —
 * nothing else is allowed to hardcode a host.
 */

// ── Switch environment here ─────────────────────────────────────────────
const MODE = 'local'; // 'local' | 'live'

const URLS = {
  local: 'http://localhost:3010',
  live: 'https://api.swisstourtransfer.ch',
};

const SITE_URLS = {
  local: 'http://localhost:5173',
  live: 'https://www.swisstourtransfer.ch',
};
// ────────────────────────────────────────────────────────────────────────

export const API_BASE_URL = URLS[MODE];
export const API_URL = `${API_BASE_URL}/api`;
export const SITE_URL = SITE_URLS[MODE];

/** Build a full URL for a file stored in the backend uploads folder. */
export function uploadUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}/uploads/${String(path).replace(/^\/+/, '')}`;
}

/** Build a canonical URL for the public site. */
export function siteUrl(path = '') {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`.replace(/\/$/, '') || SITE_URL;
}

export const BRAND = {
  name: 'Swiss Tour & Transfer',
  tagline: 'Explore · Travel · Arrive',
};

export default { MODE, API_BASE_URL, API_URL, SITE_URL, uploadUrl, siteUrl, BRAND };
