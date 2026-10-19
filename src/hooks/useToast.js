import { useCallback, useState } from 'react';

/** Minimal toast queue for admin save/delete feedback. */
export default function useToast() {
  const [toast, setToast] = useState(null);

  const show = useCallback((message, tone = 'success') => {
    setToast({ message, tone, id: Date.now() });
  }, []);

  const dismiss = useCallback(() => setToast(null), []);

  return {
    toast,
    dismiss,
    success: (message) => show(message, 'success'),
    error: (message) => show(message, 'error'),
    info: (message) => show(message, 'info'),
  };
}
