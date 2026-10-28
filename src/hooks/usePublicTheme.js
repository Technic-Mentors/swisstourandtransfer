import { useCallback, useEffect, useState } from 'react';

const KEY = 'public-theme';
const DEFAULT = 'dark';

function stored() {
  try {
    const saved = window.localStorage.getItem(KEY);
    return saved === 'dark' || saved === 'light' ? saved : DEFAULT;
  } catch {
    // Private windows and blocked site data both throw here.
    return DEFAULT;
  }
}

function apply(theme) {
  if (typeof document === 'undefined') return;
  document.body.setAttribute('data-public-theme', theme);
}

/** Runs before first paint, so a dark-theme visitor never sees a light flash. */
export function initPublicTheme() {
  if (typeof window === 'undefined') return;
  if (window.location.pathname.startsWith('/admin')) return;
  apply(stored());
}

export default function usePublicTheme() {
  const [theme, setTheme] = useState(() =>
    (typeof window === 'undefined' ? DEFAULT : stored()),
  );

  useEffect(() => {
    apply(theme);
    try {
      window.localStorage.setItem(KEY, theme);
    } catch {
      // The choice simply does not survive the session; the page still works.
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, isLight: theme === 'light', toggle };
}
