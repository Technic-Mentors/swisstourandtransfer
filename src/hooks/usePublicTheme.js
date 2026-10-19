import { useCallback, useEffect, useState } from 'react';

const KEY = 'stt_public_theme';
const DEFAULT = 'dark';
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
  document.body.setAttribute('data-public-theme', theme);
}

export function initPublicTheme() {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) return;
  apply(read());
}

export default function usePublicTheme() {
  const [theme, setTheme] = useState(read);

  useEffect(() => {
    const listener = (next) => setTheme(next);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  useEffect(() => {
    apply(theme);
    return () => document.body.removeAttribute('data-public-theme');
  }, [theme]);

  const set = useCallback((next) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode - the theme just will not persist */
    }
    apply(next);
    setTheme(next);
    listeners.forEach((listener) => listener(next));
  }, []);

  const toggle = useCallback(() => set(read() === 'light' ? 'dark' : 'light'), [set]);

  return { theme, isLight: theme === 'light', setTheme: set, toggle };
}
