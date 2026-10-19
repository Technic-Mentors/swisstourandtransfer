import { API_URL } from '../config';

const TOKEN_KEY = 'stt_admin_token';
const ADMIN_KEY = 'stt_admin_user';

/* ------------------------------------------------------------------ token */
/* sessionStorage only - no cookies anywhere in this app. */

export function getToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setSession(token, admin) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  } catch {
    /* private mode - the session simply will not persist across reloads */
  }
}

export function getStoredAdmin() {
  try {
    const raw = sessionStorage.getItem(ADMIN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Anything that needs to react to an expired session subscribes here.
 * AuthContext uses it to drop the admin back to the login screen the moment
 * the API rejects a token, rather than leaving a half-broken panel on screen.
 */
const unauthorizedHandlers = new Set();

export function onUnauthorized(handler) {
  unauthorizedHandlers.add(handler);
  return () => unauthorizedHandlers.delete(handler);
}

function fireUnauthorized(reason) {
  clearSession();
  unauthorizedHandlers.forEach((fn) => {
    try {
      fn(reason);
    } catch {
      /* a broken listener must not break the request flow */
    }
  });
}

/* ----------------------------------------------------------------- error */

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/* --------------------------------------------------------------- request */

/**
 * One fetch wrapper for the whole app.
 *  - prefixes API_URL from src/config.js
 *  - attaches the bearer token when `auth` is set
 *  - turns a 401 into a session clear + redirect signal
 *  - lets FormData through untouched so the browser sets the boundary
 */
async function request(path, { method = 'GET', body, auth = false, signal } = {}) {
  const headers = {};
  let payload;

  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  if (auth) {
    const token = getToken();
    if (!token) {
      fireUnauthorized('no_token');
      throw new ApiError('Your session has ended. Please sign in again.', 401, 'no_token');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { method, headers, body: payload, signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(
      'Cannot reach the server. Check that the backend is running.',
      0,
      'network_error',
    );
  }

  if (response.status === 204) return null;

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    const message = data?.error?.message || `Request failed (${response.status})`;
    const code = data?.error?.code || 'error';

    // Expired or invalid token: drop the session immediately.
    if (response.status === 401 && auth) fireUnauthorized(code);

    throw new ApiError(message, response.status, code);
  }

  return data;
}

/* Public (no token) */
export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
};

/* Admin (bearer token attached, 401 clears the session) */
export const adminApi = {
  get: (path, opts) => request(path, { ...opts, method: 'GET', auth: true }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body, auth: true }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body, auth: true }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body, auth: true }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE', auth: true }),
};

export default api;
