import { useEffect, useRef, useState } from 'react';

/**
 * Splits "15+", "24/7" or "4.9" into the part that can count up and the text
 * around it, so a label keeps its shape while the number animates.
 */
export function parseStat(raw) {
  const match = String(raw ?? '').match(/^(\D*?)(\d+(?:[.,]\d+)?)(.*)$/);
  if (!match) return { prefix: String(raw ?? ''), value: null, suffix: '', decimals: 0 };

  const [, prefix, digits, suffix] = match;
  const normalised = digits.replace(',', '.');
  const decimals = normalised.includes('.') ? normalised.split('.')[1].length : 0;
  return { prefix, value: Number(normalised), suffix, decimals };
}

/**
 * Counts from zero to the figure once, the first time it is scrolled to.
 * Anything that is not a number is printed as it is.
 */
export default function CountUp({ raw, duration = 1100 }) {
  const { prefix, value, suffix, decimals } = parseStat(raw);
  const ref = useRef(null);
  const [shown, setShown] = useState(value === null ? null : 0);

  useEffect(() => {
    const el = ref.current;
    if (!el || value === null) return undefined;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      setShown(value);
      return undefined;
    }

    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();

        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          // Ease out, so it slows into the final figure instead of stopping dead.
          setShown(value * (1 - (1 - t) ** 3));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  if (value === null) return <span ref={ref}>{prefix}</span>;

  return (
    <span ref={ref}>
      {prefix}
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}
