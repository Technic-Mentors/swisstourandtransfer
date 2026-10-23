import { useEffect } from 'react';

function apply(theme) {
  if (typeof document === 'undefined') return;
  document.body.setAttribute('data-public-theme', theme);
}

export function initPublicTheme() {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) return;
  apply('dark');
}

export default function usePublicTheme() {
  useEffect(() => {
    apply('dark');
    return () => document.body.removeAttribute('data-public-theme');
  }, []);

  return { theme: 'dark', isLight: false };
}
