import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { admin } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import Seo from '../../components/seo/Seo';
import { AdminPageHead } from '../../components/admin/AdminLayout';
import {
  AdminButton,
  AdminCheckbox,
  AdminField,
  AdminSelect,
  Alert,
  Card,
  CardHead,
  ConfirmDialog,
  DataTable,
  DateRangeFilter,
  FilterBar,
  Pagination,
  SearchBox,
  StatusBadge,
  Toast,
} from '../../components/admin/widgets';
import { Spinner } from '../../components/ui';
import s from '../../components/admin/admin.module.css';

const STATUS_TONE = { live: 'live', scheduled: 'info', expired: 'off', paused: 'warn' };
const showDate = (value) => (value ? new Date(value).toLocaleDateString('en-GB') : '—');

/**
 * Where the announcement bar can send people. Writing a URL by hand was easy to
 * get wrong, so it is a list of this site's pages instead; empty means the
 * offers page, which is what the public bar falls back to.
 */
const BAR_PAGES = [
  { value: '/offers', label: 'Offers page (default)' },
  { value: '/vehicles', label: 'Vehicles' },
  { value: '/services', label: 'Services' },
  { value: '/gallery', label: 'Gallery' },
  { value: '/reviews', label: 'Reviews' },
  { value: '/about', label: 'About us' },
  { value: '/contact', label: 'Contact' },
  { value: '/book', label: 'Book a transfer' },
];

/** Never set, or set to the offers page, both mean the default. */
const barValueOf = (current) => current || '/offers';

/** Keeps a link set earlier by hand selectable, so saving never loses it. */
function barDestinations(current) {
  const value = barValueOf(current);
  const known = BAR_PAGES.some((page) => page.value === value);
  return known ? BAR_PAGES : [...BAR_PAGES, { value, label: value }];
}

/** Offers list plus the announcement bar. Add and edit happen on their own pages. */
export default function Promotions() {
  const toast = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [confirm, setConfirm] = useState(null);

  // The announcement bar lives in settings but is managed from this screen.
  const load = useCallback(
    () =>
      Promise.all([
        admin.promotions({ q: query, date_from: range.from, date_to: range.to, page, per_page: perPage }),
        admin.settings(),
      ]),
    [query, range.from, range.to, page, perPage],
  );
  const { data, loading, error, refetch } = useFetch(load, [query, range.from, range.to, page, perPage]);

  const promotions = data?.[0]?.promotions ?? [];
  const pagination = data?.[0]?.pagination;
  const settings = data?.[1]?.settings ?? {};

  const [bar, setBar] = useState(null);
  const barValue = bar ?? {
    announcement_enabled: settings.announcement_enabled === '1',
    announcement_text: settings.announcement_text || '',
    announcement_link: settings.announcement_link || '',
  };

  const refilter = (fn) => (value) => {
    fn(value);
    setPage(1);
  };

  async function saveBar() {
    try {
      await admin.saveSettings({
        announcement_enabled: barValue.announcement_enabled ? '1' : '0',
        announcement_text: barValue.announcement_text,
        announcement_link: barValue.announcement_link,
      });
      setBar(null);
      refetch();
      toast.success('Announcement bar updated.');
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function duplicate(row) {
    try {
      await admin.duplicatePromotion(row.id);
      refetch();
      toast.success('Offer duplicated — the copy is paused until you publish it.');
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function toggle(row) {
    try {
      await admin.togglePromotion(row.id, row.is_active ? 0 : 1);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function doDelete() {
    try {
      await admin.deletePromotion(confirm.id);
      toast.success('Offer deleted.');
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirm(null);
    }
  }

  const columns = [
    {
      key: 'title',
      label: 'Offer',
      width: '24%',
      render: (row) => (
        <>
          <div className={s.cellStrong}>{row.title}</div>
          <div className={s.cellMuted}>{row.placement.replace('_', ' ')}</div>
        </>
      ),
    },
    { key: 'code', label: 'Code', width: '14%', render: (row) => row.code || '—' },
    {
      key: 'valid',
      label: 'Valid',
      width: '22%',
      render: (row) => (
        <span className={s.cellMuted}>
          {showDate(row.starts_at)} → {showDate(row.ends_at)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '14%',
      render: (row) => <StatusBadge tone={STATUS_TONE[row.status] || 'off'} onLabel={row.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '26%',
      render: (row) => (
        <div className={s.promotionActions}>
          <button
            type="button"
            className={s.actionLink}
            onClick={() => navigate(`/admin/promotions/${row.id}`)}
          >
            Edit
          </button>
          <button type="button" className={s.actionLink} onClick={() => duplicate(row)}>
            Duplicate
          </button>
          <button type="button" className={s.actionLink} onClick={() => toggle(row)}>
            {row.is_active ? 'Pause' : 'Activate'}
          </button>
          <button type="button" className={`${s.actionLink} ${s.actionDanger}`} onClick={() => setConfirm(row)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Seo title="Promotions · Admin" noindex bare />

      <AdminPageHead
        title="Promotions"
        subtitle="Offers, the homepage banner and the announcement bar. Offers past their end date hide themselves automatically."
      >
        <AdminButton onClick={() => navigate('/admin/promotions/new')}>+ New offer</AdminButton>
      </AdminPageHead>

      {error && <Alert tone="error">{error.message}</Alert>}

      {loading ? (
        <Spinner label="Loading offers" />
      ) : (
        <>
          <Card style={{ marginBottom: 16 }}>
            <CardHead title="Announcement bar" />
            <div className={s.cardPad}>
              <div className={s.formCols}>
                <AdminField
                  label="Bar text"
                  value={barValue.announcement_text}
                  onChange={(e) => setBar({ ...barValue, announcement_text: e.target.value })}
                  placeholder="Winter season ski transfers now bookable"
                />
                <AdminSelect
                  label="Clicking the bar opens"
                  value={barValueOf(barValue.announcement_link)}
                  onChange={(e) => setBar({ ...barValue, announcement_link: e.target.value })}
                  options={barDestinations(barValue.announcement_link)}
                  hint="Leave it on the offers page unless the bar is about something else."
                />
              </div>

              <div className={s.formFoot}>
                <AdminCheckbox
                  label="Show the announcement bar"
                  checked={barValue.announcement_enabled}
                  onChange={(e) => setBar({ ...barValue, announcement_enabled: e.target.checked })}
                />
                <div className={s.formFootActions}>
                  <AdminButton variant="gold" onClick={saveBar} disabled={!bar}>
                    Save bar
                  </AdminButton>
                </div>
              </div>
            </div>
          </Card>

          <FilterBar
            search={query}
            onSearchChange={(e) => refilter(setQuery)(e.target.value)}
            searchPlaceholder="Search offers"
            activeCount={range.from || range.to ? 1 : 0}
            onClear={() => refilter(setRange)({ from: '', to: '' })}
          >
            <DateRangeFilter label="Running between" value={range} onChange={refilter(setRange)} />
          </FilterBar>

          <Card>
            {promotions.length === 0 ? (
              <DataTable columns={columns} rows={promotions} empty="No offers match these filters." />
            ) : (
              <>
                <div className={s.promotionsDesktop}>
                  <DataTable columns={columns} rows={promotions} />
                </div>
                <div className={s.promotionCards}>
                  {promotions.map((row) => (
                    <article className={s.promotionCard} key={row.id}>
                      <div className={s.promotionCardHead}>
                        <div className={s.promotionCardTitle}>
                          <div className={s.cellStrong}>{row.title}</div>
                          <div className={s.promotionPlacement}>
                            {String(row.placement || '').replace(/_/g, ' ') || 'Offer'}
                          </div>
                        </div>
                        <StatusBadge
                          tone={STATUS_TONE[row.status] || 'off'}
                          onLabel={row.status}
                        />
                      </div>

                      <div className={s.promotionCardMeta}>
                        <span>
                          <strong>Code</strong> {row.code || '—'}
                        </span>
                        <span>
                          <strong>Valid</strong> {showDate(row.starts_at)} → {showDate(row.ends_at)}
                        </span>
                      </div>

                      <div className={s.promotionCardActions}>
                        <button
                          type="button"
                          className={s.actionLink}
                          onClick={() => navigate(`/admin/promotions/${row.id}`)}
                        >
                          Edit
                        </button>
                        <button type="button" className={s.actionLink} onClick={() => duplicate(row)}>
                          Duplicate
                        </button>
                        <button type="button" className={s.actionLink} onClick={() => toggle(row)}>
                          {row.is_active ? 'Pause' : 'Activate'}
                        </button>
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
              </>
            )}
            <Pagination
              pagination={pagination}
              onChange={setPage}
              perPage={perPage}
              onPerPageChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
            />
          </Card>
        </>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete this offer?"
        text={`“${confirm?.title}” will be removed from the website.`}
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
