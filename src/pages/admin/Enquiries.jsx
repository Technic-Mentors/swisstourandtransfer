import { useCallback, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { admin } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import Seo from '../../components/seo/Seo';
import { AdminPageHead } from '../../components/admin/AdminLayout';
import {
  AdminButton,
  Alert,
  Card,
  ConfirmDialog,
  DataTable,
  DateRangeFilter,
  FilterBar,
  Pagination,
  StatusBadge,
  Tabs,
  Toast,
} from '../../components/admin/widgets';
import { Spinner, WhatsAppIcon } from '../../components/ui';
import s from '../../components/admin/admin.module.css';

const STATUSES = ['new', 'contacted', 'confirmed', 'closed'];
const TONE = { new: 'warn', contacted: 'info', confirmed: 'live', closed: 'off' };

const dt = (value) =>
  value
    ? new Date(value).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

/* ---------------------------------------------------------------- StatusCell */
/* Clickable status badge that opens a dropdown of all statuses. The menu is
   rendered through a portal into document.body so table/card overflow can
   never clip it — that is what was hiding the last row's dropdown. */

function StatusCell({ row, isOpen, onToggle, onClose, onChange }) {
  const triggerRef = useRef(null);
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setPos(null);
      return;
    }
    const update = () => {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      const menuH = 4 * 42 + 12; // 4 items + padding, rough height
      const spaceBelow = window.innerHeight - r.bottom;
      const openUp = spaceBelow < menuH + 12;
      setPos({
        top: openUp ? r.top - menuH - 6 : r.bottom + 6,
        left: r.left,
      });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen]);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Click to change status"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 8px 3px 3px',
          border: '1px solid transparent',
          borderRadius: '999px',
          background: 'none',
          cursor: 'pointer',
          lineHeight: 1,
          transition: 'border-color 120ms ease, background 120ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--admin-accent-line)';
          e.currentTarget.style.background = 'var(--admin-accent-wash)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'transparent';
          e.currentTarget.style.background = 'none';
        }}
      >
        <StatusBadge tone={TONE[row.status]} onLabel={row.status} />
        <svg
          viewBox="0 0 12 8"
          aria-hidden="true"
          style={{
            width: 10,
            height: 10,
            flex: 'none',
            color: 'var(--admin-text-muted)',
            transition: 'transform 120ms ease, color 120ms ease',
            transform: isOpen ? 'rotate(180deg)' : 'none',
          }}
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen &&
        pos &&
        createPortal(
          <>
            <div
              onClick={onClose}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9998,
              }}
            />
            <ul
              role="listbox"
              style={{
                position: 'fixed',
                top: pos.top,
                left: pos.left,
                zIndex: 9999,
                margin: 0,
                padding: 6,
                listStyle: 'none',
                minWidth: 160,
                background: 'var(--admin-raised)',
                border: '1px solid var(--admin-border-strong)',
                borderRadius: 12,
                boxShadow: 'var(--admin-shadow)',
              }}
            >
              {STATUSES.map((st) => (
                <li key={st}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={st === row.status}
                    onClick={() => onChange(st)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '7px 9px',
                      border: 0,
                      borderRadius: 8,
                      background: st === row.status ? 'var(--admin-accent-wash)' : 'transparent',
                      font: 'inherit',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 120ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (st !== row.status)
                        e.currentTarget.style.background = 'var(--admin-nav-hover-bg)';
                    }}
                    onMouseLeave={(e) => {
                      if (st !== row.status) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <StatusBadge tone={TONE[st]} onLabel={st} />
                  </button>
                </li>
              ))}
            </ul>
          </>,
          document.body
        )}
    </div>
  );
}

/* ------------------------------------------------------------------ Enquiries */

export default function Enquiries() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [range, setRange] = useState({ from: '', to: '' });
  const [dateField, setDateField] = useState('created');
  const [open, setOpen] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [statusMenuFor, setStatusMenuFor] = useState(null);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState('');
  const [activityRevision, setActivityRevision] = useState(0);

  useEffect(() => {
    if (!open) {
      setActivity([]);
      setActivityError('');
      return undefined;
    }

    let cancelled = false;
    setActivityLoading(true);
    setActivityError('');

    admin
      .activity(open.id)
      .then((res) => {
        if (!cancelled) setActivity(res.activity || []);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg =
            err?.response?.data?.message || err?.message || 'Unknown error';
          setActivityError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setActivityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open?.id, activityRevision]);

  const load = useCallback(
    () =>
      admin.enquiries({
        status,
        q: query,
        date_from: range.from,
        date_to: range.to,
        date_field: dateField,
        page,
        per_page: perPage,
      }),
    [status, query, range.from, range.to, dateField, page, perPage],
  );
  const { data, loading, error, refetch } = useFetch(load, [
    status,
    query,
    range.from,
    range.to,
    dateField,
    page,
    perPage,
  ]);

  const refilter = (fn) => (value) => {
    fn(value);
    setPage(1);
  };

  const enquiries = data?.enquiries ?? [];
  const pagination = data?.pagination ?? { page: 1, pages: 1, total: 0 };
  const counts = data?.counts ?? {};

  async function setEnquiryStatus(row, next) {
    setStatusMenuFor(null);
    if (next === row.status) return;
    try {
      await admin.setEnquiryStatus(row.id, next);
      if (open?.id === row.id) {
        setOpen((current) => (current ? { ...current, status: next } : current));
        setActivityRevision((revision) => revision + 1);
      }
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function recordWhatsAppContact(row) {
    try {
      await admin.logWhatsAppContact(row.id);
      if (row.status === 'new') {
        setOpen((current) =>
          current?.id === row.id ? { ...current, status: 'contacted' } : current,
        );
      }
      if (open?.id === row.id) setActivityRevision((revision) => revision + 1);
      refetch();
    } catch (err) {
      toast.error(`Could not record the WhatsApp contact: ${err.message}`);
    }
  }

  async function doDelete() {
    try {
      await admin.deleteEnquiry(confirm.id);
      toast.success('Enquiry deleted.');
      if (open?.id === confirm.id) setOpen(null);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirm(null);
    }
  }

  const columns = [
    {
      key: 'full_name',
      label: 'Customer',
      width: '18%',
      render: (row) => (
        <>
          <div className={s.cellStrong}>{row.full_name}</div>
          <div className={s.cellMuted}>
            <a href={`tel:${row.phone}`}>{row.phone}</a>
          </div>
        </>
      ),
    },
    {
      key: 'journey',
      label: 'Journey',
      width: '22%',
      render: (row) => (
        <>
          <div>{row.service_type || row.vehicle_name || '—'}</div>
          <div className={s.cellMuted}>
            {row.pickup || '?'} → {row.dropoff || '?'}
          </div>
        </>
      ),
    },
    { key: 'travel_datetime', label: 'Travel', width: '12%', render: (row) => dt(row.travel_datetime) },
    { key: 'created_at', label: 'Received', width: '12%', render: (row) => dt(row.created_at) },
    {
      key: 'actions',
      label: 'Actions',
      width: '36%',
      render: (row) => (
        <div className={s.actionCell}>
          <button type="button" className={s.actionLink} onClick={() => setOpen(row)}>
            View
          </button>

          <StatusCell
            row={row}
            isOpen={statusMenuFor === row.id}
            onToggle={() => setStatusMenuFor(statusMenuFor === row.id ? null : row.id)}
            onClose={() => setStatusMenuFor(null)}
            onChange={(next) => setEnquiryStatus(row, next)}
          />

          <a
            className={s.actionWhatsApp}
            href={`https://wa.me/${String(row.phone || '').replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Reply to ${row.full_name} on WhatsApp`}
            title="Reply on WhatsApp"
            onClick={() => recordWhatsAppContact(row)}
          >
            <WhatsAppIcon />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            className={`${s.actionLink} ${s.actionDanger}`}
            onClick={() => setConfirm(row)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Seo title="Enquiries · Admin" noindex bare />

      <AdminPageHead
        title="Enquiries"
        subtitle="Every enquiry sent through the booking and contact forms. WhatsApp conversations are not captured here."
      />

      {error && <Alert tone="error">{error.message}</Alert>}

      <FilterBar
        search={query}
        onSearchChange={(e) => refilter(setQuery)(e.target.value)}
        searchPlaceholder="Search name, phone or route"
        activeCount={(status ? 1 : 0) + (range.from || range.to ? 1 : 0)}
        onClear={() => {
          refilter(setStatus)('');
          refilter(setRange)({ from: '', to: '' });
        }}
        inline={
          <Tabs
            options={[
              { value: '', label: 'All', count: pagination.total },
              ...STATUSES.map((st) => ({ value: st, label: st, count: counts[st] })),
            ]}
            value={status}
            onChange={refilter(setStatus)}
          />
        }
      >
        <DateRangeFilter
          label={dateField === 'travel' ? 'Travelling between' : 'Received between'}
          value={range}
          onChange={refilter(setRange)}
        />

        <div className={s.field}>
          <span className={s.dateRangeLabel}>Filter on</span>
          <select
            className={s.control}
            value={dateField}
            onChange={(e) => refilter(setDateField)(e.target.value)}
            aria-label="Which date to filter on"
          >
            <option value="created">Date received</option>
            <option value="travel">Date of travel</option>
          </select>
        </div>
      </FilterBar>

      <Card>
        {loading ? (
          <Spinner label="Loading enquiries" />
        ) : enquiries.length === 0 ? (
          <DataTable columns={columns} rows={enquiries} empty="No enquiries match these filters." />
        ) : (
          <>
            <div className={s.enquiriesDesktop}>
              <DataTable columns={columns} rows={enquiries} />
            </div>
            <div className={s.enquiryCards}>
              {enquiries.map((row) => (
                <article className={s.enquiryCard} key={row.id}>
                  <div className={s.enquiryCardHead}>
                    <div className={s.enquiryCardCustomer}>
                      <div className={s.cellStrong}>{row.full_name}</div>
                      <a className={s.enquiryCardPhone} href={`tel:${row.phone}`}>
                        {row.phone}
                      </a>
                    </div>
                    <StatusCell
                      row={row}
                      isOpen={statusMenuFor === row.id}
                      onToggle={() => setStatusMenuFor(statusMenuFor === row.id ? null : row.id)}
                      onClose={() => setStatusMenuFor(null)}
                      onChange={(next) => setEnquiryStatus(row, next)}
                    />
                  </div>

                  <div className={s.enquiryCardRoute}>
                    <span>{row.pickup || 'Pickup not specified'}</span>
                    <span aria-hidden="true">→</span>
                    <span>{row.dropoff || 'Drop-off not specified'}</span>
                  </div>

                  <div className={s.enquiryCardMeta}>
                    <span>{row.service_type || row.vehicle_name || 'Service not specified'}</span>
                    <span>Travel: {dt(row.travel_datetime)}</span>
                    <span>Received: {dt(row.created_at)}</span>
                  </div>

                  <div className={s.enquiryCardActions}>
                    <button type="button" className={s.actionLink} onClick={() => setOpen(row)}>
                      View details
                    </button>
                    <a
                      className={s.enquiryCardWhatsApp}
                      href={`https://wa.me/${String(row.phone || '').replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => recordWhatsAppContact(row)}
                    >
                      <WhatsAppIcon />
                      WhatsApp
                    </a>
                    <button
                      type="button"
                      className={`${s.actionLink} ${s.actionDanger}`}
                      onClick={() => setConfirm(row)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <Pagination
              pagination={pagination}
              onChange={setPage}
              perPage={perPage}
              onPerPageChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
            />
          </>
        )}
      </Card>

      {open && (
        <div className={s.dialogBackdrop} onClick={(e) => e.target === e.currentTarget && setOpen(null)}>
          <div
            className={s.dialog}
            style={{
              maxWidth: 580,
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* ---- Scrollable content ---- */}
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
              <h2 className={s.dialogTitle}>{open.full_name}</h2>

              <section className={s.enquiryDetailSection}>
                <h3 className={s.enquiryDetailHeading}>Customer</h3>
                <dl className={s.enquiryDetailGrid}>
                  <div className={s.enquiryDetailItem}>
                    <dt className={s.enquiryDetailLabel}>Phone</dt>
                    <dd className={s.enquiryDetailValue}>
                      <a href={`tel:${open.phone}`}>{open.phone}</a>
                    </dd>
                  </div>
                  {open.email && (
                    <div className={s.enquiryDetailItem}>
                      <dt className={s.enquiryDetailLabel}>Email</dt>
                      <dd className={s.enquiryDetailValue}>
                        <a href={`mailto:${open.email}`}>{open.email}</a>
                      </dd>
                    </div>
                  )}
                  <div className={s.enquiryDetailItem}>
                    <dt className={s.enquiryDetailLabel}>Received</dt>
                    <dd className={s.enquiryDetailValue}>{dt(open.created_at)}</dd>
                  </div>
                  <div className={s.enquiryDetailItem}>
                    <dt className={s.enquiryDetailLabel}>Status</dt>
                    <dd className={s.enquiryDetailValue}>
                      <StatusBadge tone={TONE[open.status]} onLabel={open.status} />
                    </dd>
                  </div>
                  {open.source_page && (
                    <div className={s.enquiryDetailItem}>
                      <dt className={s.enquiryDetailLabel}>Source page</dt>
                      <dd className={s.enquiryDetailValue}>{open.source_page}</dd>
                    </div>
                  )}
                </dl>
              </section>

              <section className={s.enquiryDetailSection}>
                <h3 className={s.enquiryDetailHeading}>Journey</h3>
                <dl className={s.enquiryDetailGrid}>
                  <div className={s.enquiryDetailItem}>
                    <dt className={s.enquiryDetailLabel}>Pickup</dt>
                    <dd className={s.enquiryDetailValue}>{open.pickup || '—'}</dd>
                  </div>
                  <div className={s.enquiryDetailItem}>
                    <dt className={s.enquiryDetailLabel}>Drop-off</dt>
                    <dd className={s.enquiryDetailValue}>{open.dropoff || '—'}</dd>
                  </div>
                  <div className={s.enquiryDetailItem}>
                    <dt className={s.enquiryDetailLabel}>Travel</dt>
                    <dd className={s.enquiryDetailValue}>{dt(open.travel_datetime)}</dd>
                  </div>
                  <div className={s.enquiryDetailItem}>
                    <dt className={s.enquiryDetailLabel}>Service</dt>
                    <dd className={s.enquiryDetailValue}>{open.service_type || '—'}</dd>
                  </div>
                  <div className={s.enquiryDetailItem}>
                    <dt className={s.enquiryDetailLabel}>Vehicle</dt>
                    <dd className={s.enquiryDetailValue}>{open.vehicle_name || 'Any'}</dd>
                  </div>
                  <div className={s.enquiryDetailItem}>
                    <dt className={s.enquiryDetailLabel}>Passengers & luggage</dt>
                    <dd className={s.enquiryDetailValue}>
                      {open.passengers || '?'} passengers · {open.suitcases || '?'} suitcases
                      {open.return_trip ? ' · return trip' : ''}
                    </dd>
                  </div>
                  {open.flight_number && (
                    <div className={s.enquiryDetailItem}>
                      <dt className={s.enquiryDetailLabel}>Flight</dt>
                      <dd className={s.enquiryDetailValue}>{open.flight_number}</dd>
                    </div>
                  )}
                </dl>
              </section>

              <section className={s.enquiryDetailSection}>
                <h3 className={s.enquiryDetailHeading}>Message</h3>
                <p className={s.enquiryMessage}>{open.message || 'No message provided.'}</p>
              </section>

              {/* ---------------------------------------- Activity timeline */}
              <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--admin-border-soft)' }}>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 16,
                  color: 'var(--admin-heading)',
                  marginBottom: 12,
                }}>
                  Activity
                </h3>

                {activityLoading ? (
                  <div style={{ fontSize: 15, color: 'var(--admin-text-muted)' }}>Loading…</div>
                ) : activityError ? (
                  <div role="alert" style={{ fontSize: 15, color: 'var(--admin-red)' }}>
                    Could not load activity: {activityError}
                  </div>
                ) : activity.length === 0 ? (
                  <div style={{ fontSize: 15, color: 'var(--admin-text-muted)' }}>No activity yet.</div>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {activity.map((a) => (
                      <li key={a.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%', flex: 'none', marginTop: 6,
                          background: activityDotColor(a.action),
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, color: 'var(--admin-text)' }}>
                            {activityText(a)}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--admin-text-faint)', marginTop: 2 }}>
                            {formatActivityTime(a.created_at)}
                            {a.actor_name ? ` · by ${a.actor_name}` : ''}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* ---- Sticky footer ---- */}
            <div
              className={s.dialogActions}
              style={{
                marginTop: 22,
                paddingTop: 16,
                borderTop: '1px solid var(--admin-border-soft)',
                flexShrink: 0,
              }}
            >
              <AdminButton variant="outline" onClick={() => setOpen(null)}>
                Close
              </AdminButton>
              <a
                className={s.enquiryCardWhatsApp}
                href={`https://wa.me/${String(open.phone || '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordWhatsAppContact(open)}
              >
                <WhatsAppIcon />
                Reply on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete this enquiry?"
        text={`The enquiry from ${confirm?.full_name} will be permanently removed.`}
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}

/* -------------------------------------------------- Activity helpers */

function activityDotColor(action) {
  switch (action) {
    case 'received':           return 'var(--badge-info-fg)';
    case 'status_changed':     return 'var(--admin-accent)';
    case 'whatsapp_contacted': return 'var(--whatsapp)';
    case 'deleted':            return 'var(--admin-red)';
    default:                   return 'var(--admin-text-faint)';
  }
}

function activityText(a) {
  switch (a.action) {
    case 'received':
      return `Enquiry received${a.meta ? ` — ${a.meta}` : ''}`;
    case 'status_changed':
      return `Status changed from "${a.old_value}" to "${a.new_value}"${a.meta ? ` — ${a.meta}` : ''}`;
    case 'whatsapp_contacted':
      return 'Contacted on WhatsApp';
    case 'deleted':
      return `Enquiry deleted${a.meta ? ` — ${a.meta}` : ''}`;
    default:
      return a.action;
  }
}

function formatActivityTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const date = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return `${date}, ${time}`;
}