import { useEffect, useId, useRef, useState } from 'react';
import { cx } from '../ui';
import s from './forms.module.css';

/** Label + control + error, shared by every input type. */
function Wrapper({ label, required, error, hint, htmlFor, children }) {
  return (
    <div className={s.field}>
      {label && (
        <label className={s.label} htmlFor={htmlFor}>
          {label}
          {required && <span className={s.required}>*</span>}
        </label>
      )}
      {children}
      {error && <span className={s.errorText}>{error}</span>}
      {!error && hint && <span className={s.hint}>{hint}</span>}
    </div>
  );
}

export function Field({ label, required, error, hint, type = 'text', id, ...rest }) {
  const generated = useId();
  const fieldId = id || generated;

  return (
    <Wrapper label={label} required={required} error={error} hint={hint} htmlFor={fieldId}>
      <input
        id={fieldId}
        type={type}
        className={cx(s.control, error && s.error)}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      />
    </Wrapper>
  );
}

/**
 * A text field that filters a list as you type — used for the city inputs,
 * where the list is a help rather than a restriction: anything typed is kept,
 * so a hotel or street address is still valid.
 */
export function SearchField({
  label,
  required,
  error,
  hint,
  id,
  value = '',
  onChange,
  options = [],
  placeholder,
  emptyText = 'No match — your own wording is fine',
  ...rest
}) {
  const generated = useId();
  const fieldId = id || generated;
  const listId = `${fieldId}-list`;

  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapRef = useRef(null);

  const query = String(value || '').trim().toLowerCase();
  const matches = query
    ? options.filter((o) => o.toLowerCase().includes(query))
    : options;

  // Clicking away closes the list without disturbing what was typed.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const choose = (text) => {
    onChange?.({ target: { value: text } });
    setOpen(false);
    setHighlight(-1);
  };

  function onKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setHighlight((h) => {
        const next = h + step;
        if (next < 0) return matches.length - 1;
        if (next >= matches.length) return 0;
        return next;
      });
    } else if (e.key === 'Enter' && open && highlight >= 0 && matches[highlight]) {
      e.preventDefault();
      choose(matches[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlight(-1);
    }
  }

  return (
    <Wrapper label={label} required={required} error={error} hint={hint} htmlFor={fieldId}>
      <div className={s.search} ref={wrapRef}>
        <input
          id={fieldId}
          type="text"
          className={cx(s.control, s.searchInput, error && s.error)}
          value={value}
          onChange={(e) => {
            onChange?.(e);
            setOpen(true);
            setHighlight(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={error ? 'true' : undefined}
          {...rest}
        />

        <svg className={s.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>

        {open && (
          <ul className={s.searchList} id={listId} role="listbox">
            {matches.length ? (
              matches.map((option, i) => (
                <li key={option} role="option" aria-selected={i === highlight}>
                  <button
                    type="button"
                    className={cx(s.searchOption, i === highlight && s.searchOptionOn)}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => choose(option)}
                  >
                    {option}
                  </button>
                </li>
              ))
            ) : (
              <li className={s.searchEmpty}>{emptyText}</li>
            )}
          </ul>
        )}
      </div>
    </Wrapper>
  );
}

export function TextArea({ label, required, error, hint, id, rows = 4, ...rest }) {
  const generated = useId();
  const fieldId = id || generated;

  return (
    <Wrapper label={label} required={required} error={error} hint={hint} htmlFor={fieldId}>
      <textarea
        id={fieldId}
        rows={rows}
        className={cx(s.control, error && s.error)}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      />
    </Wrapper>
  );
}

export function Select({ label, required, error, hint, id, options = [], placeholder, children, ...rest }) {
  const generated = useId();
  const fieldId = id || generated;

  return (
    <Wrapper label={label} required={required} error={error} hint={hint} htmlFor={fieldId}>
      <select
        id={fieldId}
        className={cx(s.control, error && s.error)}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
        {children}
      </select>
    </Wrapper>
  );
}

export function Checkbox({ label, id, ...rest }) {
  const generated = useId();
  const fieldId = id || generated;

  return (
    <label className={s.checkbox} htmlFor={fieldId}>
      <input id={fieldId} type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  );
}

export { s as formStyles };
