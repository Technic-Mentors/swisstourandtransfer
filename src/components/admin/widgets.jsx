import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { uploadUrl } from '../../config';
import useAdminTheme from '../../hooks/useAdminTheme';
import s from './admin.module.css';

const cx = (...parts) => parts.filter(Boolean).join(' ');

/* ================================================================ buttons */

const BTN = {
  primary: s.btnPrimary,
  gold: s.btnGold,
  outline: s.btnOutline,
  danger: s.btnDanger,
};

export function AdminButton({ children, variant = 'primary', size, className = '', ...rest }) {
  return (
    <button
      type="button"
      className={cx(s.btn, BTN[variant] || s.btnPrimary, size === 'sm' && s.btnSm, className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ================================================================== cards */

/**
 * A panel. Given `to`, the whole surface opens that screen — except where the
 * click landed on something interactive of its own (a row link, a button, a
 * chart tooltip), which keeps nested actions working.
 */
export function Card({ children, pad = false, className = '', to }) {
  const navigate = useNavigate();

  if (!to) {
    return <div className={cx(s.card, pad && s.cardPad, className)}>{children}</div>;
  }

  const open = (e) => {
    // Anything interactive inside the card handles its own click — but the card
    // itself carries role="button", so it must not match its own guard.
    const inner = e.target.closest('a, button, input, select, textarea, [role="button"]');
    if (inner && inner !== e.currentTarget) return;
    if (window.getSelection && String(window.getSelection())) return; // let people select text
    navigate(to);
  };

  return (
    <div
      className={cx(s.card, s.cardLink, pad && s.cardPad, className)}
      onClick={open}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          navigate(to);
        }
      }}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
}

export function CardHead({ title, children }) {
  return (
    <div className={s.cardHead}>
      <h2 className={s.cardTitle}>{title}</h2>
      {children}
    </div>
  );
}

/* ================================================================= inputs */

function FieldShell({ label, required, error, hint, htmlFor, children }) {
  return (
    <div className={s.field}>
      {label && (
        <label className={s.label} htmlFor={htmlFor}>
          {label}
          {required && <span className={s.req}>*</span>}
        </label>
      )}
      {children}
      {error && <span className={s.errorText}>{error}</span>}
      {!error && hint && <span className={s.hint}>{hint}</span>}
    </div>
  );
}

export function AdminField({ label, required, error, hint, id, ...rest }) {
  const auto = useId();
  const fieldId = id || auto;
  return (
    <FieldShell label={label} required={required} error={error} hint={hint} htmlFor={fieldId}>
      <input id={fieldId} className={s.control} {...rest} />
    </FieldShell>
  );
}

export function AdminTextArea({ label, required, error, hint, id, rows = 4, ...rest }) {
  const auto = useId();
  const fieldId = id || auto;
  return (
    <FieldShell label={label} required={required} error={error} hint={hint} htmlFor={fieldId}>
      <textarea id={fieldId} rows={rows} className={s.control} {...rest} />
    </FieldShell>
  );
}

export function AdminSelect({ label, required, error, hint, id, options = [], placeholder, ...rest }) {
  const auto = useId();
  const fieldId = id || auto;
  return (
    <FieldShell label={label} required={required} error={error} hint={hint} htmlFor={fieldId}>
      <select id={fieldId} className={s.control} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function AdminCheckbox({ label, id, ...rest }) {
  const auto = useId();
  const fieldId = id || auto;
  return (
    <label className={s.checkbox} htmlFor={fieldId}>
      <input id={fieldId} type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  );
}

/** Pill-shaped checkbox, used for the "available in cities" picker. */
export function CheckPill({ label, checked, onChange }) {
  return (
    <label className={cx(s.checkPill, checked && s.checkPillOn)}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

/* ================================================================= badges */

export function StatusBadge({ on, onLabel = 'Live', offLabel = 'Hidden', tone, dot = false }) {
  const marker = dot ? <span className={s.badgeDot} aria-hidden="true" /> : null;

  if (tone) {
    const cls =
      tone === 'live' ? s.badgeLive : tone === 'warn' ? s.badgeWarn : tone === 'info' ? s.badgeInfo : s.badgeOff;
    return (
      <span className={cx(s.badge, cls)}>
        {marker}
        {onLabel}
      </span>
    );
  }

  return (
    <span className={cx(s.badge, on ? s.badgeLive : s.badgeOff)}>
      {marker}
      {on ? onLabel : offLabel}
    </span>
  );
}

/* ================================================================== table */

/**
 * Simple data table.
 * `columns`: [{ key, label, render?(row), width? }]
 */
export function DataTable({ columns, rows, empty = 'Nothing here yet.', activeId = null, rowKey = 'id' }) {
  if (!rows.length) return <div className={s.empty}>{empty}</div>;

  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]} className={activeId === row[rowKey] ? s.rowActive : undefined}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder = 'Search' }) {
  return (
    <div className={s.search}>
      <svg className={s.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        className={s.control}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}

/**
 * Pagination control. Hidden when everything fits on one page, so short
 * lists stay clean.
 */
export function Pagination({ pagination, onChange, perPage, onPerPageChange }) {
  if (!pagination) return null;

  const { page, pages, total, perPage: size } = pagination;
  if (total === 0) return null;

  const first = (page - 1) * size + 1;
  const last = Math.min(page * size, total);

  // Up to five numbers, centred on the current page, so the row stays one line.
  const windowSize = Math.min(5, pages);
  let from = Math.max(1, page - Math.floor(windowSize / 2));
  if (from + windowSize - 1 > pages) from = pages - windowSize + 1;
  const numbers = Array.from({ length: windowSize }, (_, i) => from + i);

  const go = (next) => onChange(Math.min(Math.max(1, next), pages));

  return (
    <div className={s.pagination}>
      {onPerPageChange && (
        <label className={s.perPage}>
          Records per page:
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(e.target.value)}
            aria-label="Records per page"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
            <option value="all">All</option>
          </select>
        </label>
      )}

      <span className={s.pageInfo}>
        {first} - {last} of {total}
      </span>

      <div className={s.pageButtons}>
        <button
          type="button"
          className={s.pageBtn}
          disabled={page <= 1}
          onClick={() => go(1)}
          aria-label="First page"
        >
          «
        </button>
        <button
          type="button"
          className={s.pageBtn}
          disabled={page <= 1}
          onClick={() => go(page - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>

        {numbers.map((n) => (
          <button
            key={n}
            type="button"
            className={cx(s.pageBtn, n === page && s.pageBtnOn)}
            onClick={() => go(n)}
            aria-label={`Page ${n}`}
            aria-current={n === page ? 'page' : undefined}
          >
            {n}
          </button>
        ))}

        <button
          type="button"
          className={s.pageBtn}
          disabled={page >= pages}
          onClick={() => go(page + 1)}
          aria-label="Next page"
        >
          ›
        </button>
        <button
          type="button"
          className={s.pageBtn}
          disabled={page >= pages}
          onClick={() => go(pages)}
          aria-label="Last page"
        >
          »
        </button>
      </div>
    </div>
  );
}

/**
 * From/to date filter with a few common presets.
 * `value` is { from, to }; both sides are optional.
 */
export function DateRangeFilter({ value, onChange, label = 'Date range', presets = true }) {
  const { from = '', to = '' } = value || {};

  const iso = (d) => d.toISOString().slice(0, 10);

  function preset(days) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    onChange({ from: iso(start), to: iso(end) });
  }

  function thisMonth() {
    const now = new Date();
    onChange({ from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: iso(now) });
  }

  const active = Boolean(from || to);

  return (
    <div className={s.dateRange}>
      <span className={s.dateRangeLabel}>{label}</span>

      <div className={s.dateRangeRow}>
        <input
          type="date"
          className={s.control}
          value={from}
          max={to || undefined}
          onChange={(e) => onChange({ from: e.target.value, to })}
          aria-label="From date"
        />
        <span className={s.dateRangeDash}>to</span>
        <input
          type="date"
          className={s.control}
          value={to}
          min={from || undefined}
          onChange={(e) => onChange({ from, to: e.target.value })}
          aria-label="To date"
        />

        {active && (
          <button type="button" className={s.actionLink} onClick={() => onChange({ from: '', to: '' })}>
            Clear
          </button>
        )}
      </div>

      {presets && (
        <div className={s.datePresets}>
          <button type="button" className={s.datePreset} onClick={() => preset(7)}>
            7 days
          </button>
          <button type="button" className={s.datePreset} onClick={() => preset(30)}>
            30 days
          </button>
          <button type="button" className={s.datePreset} onClick={thisMonth}>
            This month
          </button>
          <button type="button" className={s.datePreset} onClick={() => preset(365)}>
            12 months
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * The add/edit form, rendered as a full-width panel ABOVE the table rather
 * than squeezed into a side column. Opening one scrolls it into view so the
 * form is what you are looking at, not something below the fold.
 */
export function FormPanel({ open, title, onClose, children, footer }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open || !ref.current) return;
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [open, title]);

  if (!open) return null;

  return (
    <div className={s.formPanel} ref={ref}>
      <Card>
        <div className={s.cardHead}>
          <h2 className={s.cardTitle}>{title}</h2>
          <button type="button" className={s.panelClose} onClick={onClose} aria-label="Close form">
            ✕
          </button>
        </div>
        <div className={s.cardPad}>
          {children}
          {footer && <div className={s.formFoot}>{footer}</div>}
        </div>
      </Card>
    </div>
  );
}

export function Tabs({ options, value, onChange }) {
  return (
    <div className={s.tabs}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={cx(s.tab, value === o.value && s.tabOn)}
          onClick={() => onChange(o.value)}
        >
          {o.label}
          {o.count !== undefined && ` (${o.count})`}
        </button>
      ))}
    </div>
  );
}

/* ================================================================= alerts */

export function Alert({ tone = 'info', children }) {
  if (!children) return null;
  const cls = tone === 'error' ? s.alertError : tone === 'success' ? s.alertSuccess : s.alertInfo;
  return (
    <div className={cx(s.alert, cls)} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}

export function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;
  return (
    <div className={cx(s.toast, toast.tone === 'error' && s.toastError)} role="status">
      {toast.message}
    </div>
  );
}

export function ConfirmDialog({ open, title, text, confirmLabel = 'Delete', onConfirm, onCancel, busy }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className={s.dialogBackdrop}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div className={s.dialog}>
        <h2 className={s.dialogTitle}>{title}</h2>
        <p className={s.dialogText}>{text}</p>
        <div className={s.dialogActions}>
          <AdminButton variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </AdminButton>
          <AdminButton variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== stats */

export function StatCard({ label, value, note, alert = false }) {
  return (
    <div className={cx(s.stat, alert && s.statAlert)}>
      <div className={s.statLabel}>{label}</div>
      <div className={s.statValue}>{value}</div>
      {note && <div className={s.statNote}>{note}</div>}
    </div>
  );
}

/* =============================================================== uploader */

/**
 * Multi-image uploader with drag-to-reorder, cover selection and delete.
 * `photos`: [{ id, file_path, is_cover }]
 */
export function ImageUploader({
  photos = [],
  onUpload,
  onDelete,
  onSetCover,
  onReorder,
  uploading = false,
  showCover = true,
  accept = 'image/*',
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function pick(files) {
    const list = [...files].filter((f) => f.type.startsWith('image/'));
    if (list.length) onUpload(list);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) return;
    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);
    onReorder(arrayMove(photos, oldIndex, newIndex));
  }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={photos.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className={s.uploader}>
            {photos.map((photo) => (
              <SortablePhoto
                key={photo.id}
                photo={photo}
                onDelete={onDelete}
                onSetCover={onSetCover}
                showCover={showCover}
              />
            ))}

            <button
              type="button"
              className={s.upAdd}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                pick(e.dataTransfer.files);
              }}
              style={dragOver ? { borderColor: 'var(--gold)', background: '#fbf6ec' } : undefined}
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : '+ Upload'}
            </button>
          </div>
        </SortableContext>
      </DndContext>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        hidden
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function SortablePhoto({ photo, onDelete, onSetCover, showCover }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cx(s.upTile, showCover && photo.is_cover && s.upTileCover)}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
      {...attributes}
      {...listeners}
    >
      <img src={uploadUrl(photo.file_path)} alt={photo.alt_text || ''} />
      {showCover && photo.is_cover ? <span className={s.upCoverTag}>Cover</span> : null}

      <div className={s.upTileBar}>
        {showCover && !photo.is_cover && onSetCover ? (
          <span
            className={s.upTileBtn}
            role="button"
            tabIndex={0}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onSetCover(photo)}
            onKeyDown={(e) => e.key === 'Enter' && onSetCover(photo)}
          >
            Cover
          </span>
        ) : (
          <span />
        )}

        <span
          className={s.upTileBtn}
          role="button"
          tabIndex={0}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(photo)}
          onKeyDown={(e) => e.key === 'Enter' && onDelete(photo)}
        >
          Delete
        </span>
      </div>
    </div>
  );
}

/* =========================================================== sortable list */

/**
 * Drag-to-reorder list used for homepage sections, services, categories,
 * cities, FAQs and albums. `items` need an `id`; `renderItem` draws the body.
 */
export function SortableList({ items, onReorder, renderItem, right }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SortableRow key={item.id} id={item.id}>
            <div className={s.sortBody}>{renderItem(item)}</div>
            {right && right(item)}
          </SortableRow>
        ))}
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cx(s.sortItem, isDragging && s.sortItemDragging)}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <span className={s.dragHandle} {...attributes} {...listeners} aria-label="Drag to reorder">
        ⠿
      </span>
      {children}
    </div>
  );
}

export { s as adminStyles, cx };

/* ============================================================ theme toggle */

/**
 * Switches the admin panel between the dark and light themes.
 * Shows the theme you would switch TO, which is the convention people expect.
 */
export function ThemeToggle({ className = '' }) {
  const { isLight, toggle } = useAdminTheme();

  return (
    <button
      type="button"
      className={cx(s.bellBtn, className)}
      onClick={toggle}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      title={isLight ? 'Dark theme' : 'Light theme'}
    >
      {isLight ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M21 13a8.5 8.5 0 0 1-10-10 8.5 8.5 0 1 0 10 10z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
        </svg>
      )}
    </button>
  );
}

/* ========================================================= full-page form */

/**
 * Header for a form that occupies the whole page: back arrow, title, actions.
 * Used where add/edit is its own route rather than a panel over the list.
 */
export function FormPageHead({ title, subtitle, onBack, children }) {
  return (
    <header className={s.formPageHead}>
      <button type="button" className={s.backBtn} onClick={onBack} aria-label="Back to the list">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
        </svg>
      </button>

      <div>
        <h1 className={s.formPageTitle}>{title}</h1>
        {subtitle && <p className={s.formPageSub}>{subtitle}</p>}
      </div>

      {children && <div className={s.formPageActions}>{children}</div>}
    </header>
  );
}

/** A titled block inside a full-page form. */
export function FormSection({ title, icon, children }) {
  return (
    <div className={s.formSection}>
      <Card>
        <div className={s.formSectionHead}>
          {icon && <span className={s.formSectionIcon}>{icon}</span>}
          <h2 className={s.formSectionTitle}>{title}</h2>
        </div>
        <div className={s.cardPad}>{children}</div>
      </Card>
    </div>
  );
}

/** Sticky save/cancel bar for the foot of a long form. */
export function FormBar({ note, children }) {
  return (
    <div className={s.formBar}>
      {note && <span className={s.formBarNote}>{note}</span>}
      <div className={s.formBarActions}>{children}</div>
    </div>
  );
}

/* ==================================================== collapsible filters */

/**
 * Compact filter bar: search sits on one line with a Filters button, and the
 * rest (date range, status tabs, whatever a page passes as children) expands
 * underneath only when asked for.
 *
 * `activeCount` drives the badge, so it is obvious a hidden filter is still
 * narrowing the list. Opens automatically when a filter is already applied.
 */
export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search',
  activeCount = 0,
  onClear,
  children,
  inline = null,
}) {
  const [open, setOpen] = useState(activeCount > 0);

  return (
    <div className={s.filters}>
      <div className={s.filtersRow}>
        {onSearchChange && (
          <SearchBox value={search} onChange={onSearchChange} placeholder={searchPlaceholder} />
        )}

        {inline}

        {children && (
          <button
            type="button"
            className={cx(s.filtersToggle, (open || activeCount > 0) && s.filtersToggleOn)}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 6h18M7 12h10M10 18h4" />
            </svg>
            Filters
            {activeCount > 0 && <span className={s.filtersCount}>{activeCount}</span>}
            <svg
              className={cx(s.filtersChevron, open && s.filtersChevronOpen)}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        )}
      </div>

      {open && children && (
        <div className={s.filtersPanel}>
          {children}
          {activeCount > 0 && onClear && (
            <button type="button" className={cx(s.actionLink, s.filtersClear)} onClick={onClear}>
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
