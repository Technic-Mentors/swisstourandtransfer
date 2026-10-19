import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Fetch-on-mount with loading / error / refetch.
 *
 * `fn` must be stable (wrap it in useCallback) or passed via `deps`, otherwise
 * the effect re-runs on every render.
 */
export default function useFetch(fn, deps = [], { skip = false } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const [nonce, setNonce] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    setError(null);

    Promise.resolve()
      .then(fn)
      .then((result) => {
        if (active && mounted.current) setData(result);
      })
      .catch((err) => {
        if (active && mounted.current) setError(err);
      })
      .finally(() => {
        if (active && mounted.current) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce, skip]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, refetch, setData };
}
