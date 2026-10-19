import { useCallback, useEffect, useState } from 'react';

const KEY = 'stt_admin_theme';
const DEFAULT = 'dark';

/**
 * Admin light/dark theme.
 *
 * The choice is written to <html data-admin-theme> — tokens.css overrides the
 * --admin-* variables for light, so one stylesheet serves both themes. Stored
 * in localStorage so it survives a reload, and shared across components via a
 * tiny subscriber list rather than a context provider.
 */

const listeners = new Set();

function read() {
  try {
    const stored = localStorage.getItem(KEY);
    return stored === 'light' || stored === 'dark' ? stored : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function apply(theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-admin-theme', theme);
}

export function initAdminTheme() {
  apply(read());
}

export default function useAdminTheme() {
  const [theme, setTheme] = useState(read);

  // Keep every mounted toggle in step with the others.
  useEffect(() => {
    const listener = (next) => setTheme(next);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  useEffect(() => {
    apply(theme);
  }, [theme]);

  const set = useCallback((next) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode - the theme just will not persist */
    }
    apply(next);
    setTheme(next);
    listeners.forEach((fn) => fn(next));
  }, []);

  const toggle = useCallback(() => set(read() === 'light' ? 'dark' : 'light'), [set]);

  return { theme, isLight: theme === 'light', setTheme: set, toggle };
}
