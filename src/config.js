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

/**
 * Stand-in photo for anything the database has no image for yet, and the
 * fallback when an uploaded file 404s. Lives in /public so it is served by
 * the frontend itself and never depends on the API being up.
 */
export const PLACEHOLDER_IMAGE = '/placeholder-car.jpg';

/** Build a full URL for a file stored in the backend uploads folder. */
export function uploadUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}/uploads/${String(path).replace(/^\/+/, '')}`;
}

/**
 * Public-site image URL: same as uploadUrl, but an empty path gives the
 * placeholder photo instead of an empty src. Use this everywhere a visitor
 * sees a picture so a half-filled database still looks finished.
 */
export function imageUrl(path) {
  if (!path) return PLACEHOLDER_IMAGE;
  if (path === PLACEHOLDER_IMAGE || /^(\/|data:)/i.test(path)) return path;
  return uploadUrl(path);
}

/**
 * <img onError={imageFallback}> - swaps a broken upload for the placeholder.
 * Guarded so a missing placeholder can never loop.
 */
export function imageFallback(event) {
  const img = event.currentTarget;
  if (img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = '1';
  img.src = PLACEHOLDER_IMAGE;
}

/** Build a canonical URL for the public site. */
export function siteUrl(path = '') {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`.replace(/\/$/, '') || SITE_URL;
}

export const BRAND = {
  name: 'Swiss Tour & Transfer',
  tagline: 'Explore · Travel · Arrive',
};

export default {
  MODE,
  API_BASE_URL,
  API_URL,
  SITE_URL,
  PLACEHOLDER_IMAGE,
  uploadUrl,
  imageUrl,
  imageFallback,
  siteUrl,
  BRAND,
};
