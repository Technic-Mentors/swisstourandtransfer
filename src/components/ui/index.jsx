import { useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import s from './ui.module.css';

const cx = (...parts) => parts.filter(Boolean).join(' ');

/* ----------------------------------------------------------------- layout */

export function Container({ children, narrow = false, className = '', ...rest }) {
  return (
    <div className={cx(s.container, narrow && s.narrow, className)} {...rest}>
      {children}
    </div>
  );
}

export function Section({ children, id, alt = false, tight = false, className = '', ...rest }) {
  return (
    <section
      id={id}
      className={cx(s.section, tight && s.sectionTight, alt && s.sectionAlt, className)}
      {...rest}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children, className = '' }) {
  if (!children) return null;
  return <span className={cx(s.eyebrow, className)}>{children}</span>;
}

/**
 * Standard section header. `as` keeps the h1-per-page rule enforceable:
 * pages pass as="h1" where the section is the page title.
 */
export function SectionHeading({ eyebrow, title, text, center = false, as: Tag = 'h2', id }) {
  return (
    <header className={cx(s.head, center && s.headCenter)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      {title && <Tag id={id}>{title}</Tag>}
      {text && <p className={s.headText}>{text}</p>}
    </header>
  );
}

/* ---------------------------------------------------------------- button */

const VARIANTS = { gold: s.gold, outline: s.outline, ghost: s.ghost, whatsapp: s.whatsapp };
const SIZES = { sm: s.sizeSm, md: '', lg: s.sizeLg };

/**
 * One button for the whole site. Renders an <a>, a react-router <Link> or a
 * <button> depending on which of href / to / onClick is supplied.
 */
export function Button({
  children,
  variant = 'gold',
  size = 'md',
  full = false,
  href,
  to,
  type = 'button',
  className = '',
  icon = null,
  ...rest
}) {
  const classes = cx(s.btn, VARIANTS[variant] || s.gold, SIZES[size], full && s.full, className);

  const content = (
    <>
      {icon}
      {children}
    </>
  );

  if (href) {
    const external = /^https?:\/\//i.test(href);
    return (
      <a
        className={classes}
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <Link className={classes} to={to} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} type={type} {...rest}>
      {content}
    </button>
  );
}

export function WhatsAppIcon({ className = '' }) {
  return (
    <svg className={cx(s.btnIcon, className)} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.7 8.22-8.24 8.22z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ card */

export function Card({ children, hover = false, pad = false, className = '', ...rest }) {
  return (
    <div className={cx(s.card, hover && s.cardHover, pad && s.cardPad, className)} {...rest}>
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------- badge */

export function Badge({ children, tone = 'gold', className = '' }) {
  const toneClass = tone === 'neutral' ? s.badgeNeutral : tone === 'green' ? s.badgeGreen : '';
  return <span className={cx(s.badge, toneClass, className)}>{children}</span>;
}

/* ---------------------------------------------------------------- rating */

export function Rating({ value = 5, max = 5, className = '' }) {
  const rounded = Math.round(Number(value) || 0);
  return (
    <span className={cx(s.rating, className)} aria-label={`${rounded} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < rounded ? undefined : s.ratingDim} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

/* --------------------------------------------------------------- spinner */

export function Spinner({ label = 'Loading' }) {
  return (
    <div className={s.spinnerWrap} role="status" aria-live="polite">
      <span className={s.spinner} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------ emptyState */

export function EmptyState({ title = 'Nothing here yet', children }) {
  return (
    <div className={s.empty}>
      <p className={s.emptyTitle}>{title}</p>
      {children && <p>{children}</p>}
    </div>
  );
}

/* ----------------------------------------------------------------- alert */

export function Alert({ tone = 'info', children }) {
  if (!children) return null;
  const toneClass = tone === 'error' ? s.alertError : tone === 'success' ? s.alertSuccess : s.alertInfo;
  return (
    <div className={cx(s.alert, toneClass)} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------- lightbox */

/**
 * Gallery lightbox. Closes on Escape or backdrop click and supports arrow
 * keys, which is what people reach for once a full-size image is open.
 */
export function Lightbox({ items = [], index = 0, onClose, onIndexChange }) {
  const count = items.length;

  const go = useCallback(
    (delta) => {
      if (!count) return;
      onIndexChange((index + delta + count) % count);
    },
    [count, index, onIndexChange],
  );

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowLeft') go(-1);
      else if (event.key === 'ArrowRight') go(1);
    };

    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [go, onClose]);

  if (!count) return null;

  // An out-of-range index (a caller that mounts the viewer while closed) must
  // not take the page down with it.
  const current = items[index];
  if (!current) return null;

  return (
    <div
      className={s.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button type="button" className={cx(s.lightboxBtn, s.lbClose)} onClick={onClose} aria-label="Close">
        ✕
      </button>

      {count > 1 && (
        <button
          type="button"
          className={cx(s.lightboxBtn, s.lbPrev)}
          onClick={() => go(-1)}
          aria-label="Previous image"
        >
          ‹
        </button>
      )}

      <img className={s.lightboxImg} src={current.src} alt={current.alt || ''} />

      {count > 1 && (
        <button
          type="button"
          className={cx(s.lightboxBtn, s.lbNext)}
          onClick={() => go(1)}
          aria-label="Next image"
        >
          ›
        </button>
      )}

      {(current.caption || count > 1) && (
        <p className={s.lightboxCaption}>
          {current.caption}
          {count > 1 && <span> · {index + 1} / {count}</span>}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ pagination */

/**
 * Pager for the public listings: how many per page, which records are showing,
 * and first / previous / numbered / next / last. Page numbers window around the
 * current page so the row stays one line however many pages there are.
 */
export function Pagination({
  page = 1,
  perPage = 12,
  total = 0,
  onPageChange,
  onPerPageChange,
  perPageOptions = [12, 24, 48],
  label = 'Records per page:',
}) {
  // Nothing to page through: with a short list the control is just clutter, so
  // it only appears once there are more records than the smallest page size.
  if (total <= perPageOptions[0]) return null;

  const pages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), pages);

  const first = total === 0 ? 0 : (current - 1) * perPage + 1;
  const last = Math.min(current * perPage, total);

  // At most five numbers, centred on the current page.
  const windowSize = Math.min(5, pages);
  let start = Math.max(1, current - Math.floor(windowSize / 2));
  if (start + windowSize - 1 > pages) start = pages - windowSize + 1;
  const numbers = Array.from({ length: windowSize }, (_, i) => start + i);

  const go = (next) => onPageChange?.(Math.min(Math.max(1, next), pages));

  return (
    <div className={s.pager}>
      {onPerPageChange && (
        <label className={s.pagerPer}>
          {label}
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            aria-label={label}
          >
            {perPageOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      )}

      <span className={s.pagerRange}>
        {first} - {last} of {total}
      </span>

      <div className={s.pagerBtns}>
        <button
          type="button"
          className={s.pagerBtn}
          onClick={() => go(1)}
          disabled={current === 1}
          aria-label="First page"
        >
          «
        </button>
        <button
          type="button"
          className={s.pagerBtn}
          onClick={() => go(current - 1)}
          disabled={current === 1}
          aria-label="Previous page"
        >
          ‹
        </button>

        {numbers.map((n) => (
          <button
            type="button"
            key={n}
            className={cx(s.pagerBtn, n === current && s.pagerBtnOn)}
            onClick={() => go(n)}
            aria-label={`Page ${n}`}
            aria-current={n === current ? 'page' : undefined}
          >
            {n}
          </button>
        ))}

        <button
          type="button"
          className={s.pagerBtn}
          onClick={() => go(current + 1)}
          disabled={current === pages}
          aria-label="Next page"
        >
          ›
        </button>
        <button
          type="button"
          className={s.pagerBtn}
          onClick={() => go(pages)}
          disabled={current === pages}
          aria-label="Last page"
        >
          »
        </button>
      </div>
    </div>
  );
}

export { cx };
