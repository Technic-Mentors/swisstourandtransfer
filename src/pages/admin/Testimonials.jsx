import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  SearchBox,
  StatusBadge,
  Tabs,
  Toast,
} from '../../components/admin/widgets';
import { Rating, Spinner } from '../../components/ui';
import s from '../../components/admin/admin.module.css';

/** Testimonials list. Add and edit happen on their own pages. */
export default function Testimonials() {
  const toast = useToast();
  const navigate = useNavigate();

  const [filter, setFilter] = useState('');
  const [query, setQuery] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(
    () =>
      admin.testimonials({
        status: filter,
        q: query,
        date_from: range.from,
        date_to: range.to,
        page,
        per_page: perPage,
      }),
    [filter, query, range.from, range.to, page, perPage],
  );
  const { data, loading, error, refetch } = useFetch(load, [
    filter,
    query,
    range.from,
    range.to,
    page,
    perPage,
  ]);

  const testimonials = data?.testimonials ?? [];
  const pagination = data?.pagination;

  const refilter = (fn) => (value) => {
    fn(value);
    setPage(1);
  };

  async function toggleApprove(row) {
    try {
      await admin.approveTestimonial(row.id, row.is_approved ? 0 : 1);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function toggleFeature(row) {
    try {
      await admin.featureTestimonial(row.id, row.is_featured ? 0 : 1);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function doDelete() {
    try {
      await admin.deleteTestimonial(confirm.id);
      toast.success('Testimonial deleted.');
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirm(null);
    }
  }

  const columns = [
    {
      key: 'customer_name',
      label: 'Customer',
      width: '18%',
      render: (row) => (
        <>
          <div className={s.cellStrong}>{row.customer_name}</div>
          <div className={s.cellMuted}>{row.country || '—'}</div>
        </>
      ),
    },
    { key: 'service_label', label: 'Service', width: '16%', render: (row) => row.service_label || '—' },
    { key: 'rating', label: 'Rating', width: '12%', render: (row) => <Rating value={row.rating} /> },
    {
      key: 'source',
      label: 'Source',
      width: '12%',
      render: (row) => <StatusBadge tone={row.source === 'google' ? 'info' : 'off'} onLabel={row.source} />,
    },
    {
      key: 'status',
      label: 'Status',
      width: '18%',
      render: (row) => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <StatusBadge on={row.is_approved} onLabel="Approved" offLabel="Pending" />
          {row.is_featured ? <StatusBadge tone="live" onLabel="Featured" /> : null}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '24%',
      render: (row) => (
        <div className={s.testimonialActions}>
          <button
            type="button"
            className={s.actionLink}
            onClick={() => navigate(`/admin/testimonials/${row.id}`)}
          >
            Edit
          </button>
          <button type="button" className={s.actionLink} onClick={() => toggleApprove(row)}>
            {row.is_approved ? 'Unapprove' : 'Approve'}
          </button>
          <button type="button" className={s.actionLink} onClick={() => toggleFeature(row)}>
            {row.is_featured ? 'Unfeature' : 'Feature'}
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
      <Seo title="Testimonials · Admin" noindex bare />

      <AdminPageHead
        title="Testimonials"
        subtitle="Add, approve and feature reviews. Featured reviews appear on the homepage; approved ones on the reviews page."
      >
        <AdminButton onClick={() => navigate('/admin/testimonials/new')}>+ Add testimonial</AdminButton>
      </AdminPageHead>

      {error && <Alert tone="error">{error.message}</Alert>}

      <FilterBar
        search={query}
        onSearchChange={(e) => refilter(setQuery)(e.target.value)}
        searchPlaceholder="Search reviews"
        activeCount={(filter ? 1 : 0) + (range.from || range.to ? 1 : 0)}
        onClear={() => {
          refilter(setFilter)('');
          refilter(setRange)({ from: '', to: '' });
        }}
      >
        <div className={s.field}>
          <span className={s.dateRangeLabel}>Status</span>
          <Tabs
            options={[
              { value: '', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
            ]}
            value={filter}
            onChange={refilter(setFilter)}
          />
        </div>
        <DateRangeFilter label="Received between" value={range} onChange={refilter(setRange)} />
      </FilterBar>

      <Card>
        {loading ? (
          <Spinner label="Loading testimonials" />
        ) : testimonials.length === 0 ? (
          <DataTable columns={columns} rows={testimonials} empty="No testimonials match these filters." />
        ) : (
          <>
            <div className={s.testimonialsDesktop}>
              <DataTable columns={columns} rows={testimonials} />
            </div>
            <div className={s.testimonialCards}>
              {testimonials.map((row) => (
                <article className={s.testimonialCard} key={row.id}>
                  <div className={s.testimonialCardHead}>
                    <div className={s.testimonialCardCustomer}>
                      <div className={s.cellStrong}>{row.customer_name}</div>
                      <div className={s.testimonialCardCountry}>{row.country || '—'}</div>
                    </div>
                    <StatusBadge
                      on={row.is_approved}
                      onLabel="Approved"
                      offLabel="Pending"
                    />
                  </div>

                  <div className={s.testimonialCardInfo}>
                    <span>{row.service_label || 'Service not specified'}</span>
                    <Rating value={row.rating} />
                    <StatusBadge
                      tone={row.source === 'google' ? 'info' : 'off'}
                      onLabel={row.source}
                    />
                    {row.is_featured ? <StatusBadge tone="live" onLabel="Featured" /> : null}
                  </div>

                  {row.review_text && <p className={s.testimonialQuote}>{row.review_text}</p>}

                  <div className={s.testimonialCardActions}>
                    <button
                      type="button"
                      className={s.actionLink}
                      onClick={() => navigate(`/admin/testimonials/${row.id}`)}
                    >
                      Edit
                    </button>
                    <button type="button" className={s.actionLink} onClick={() => toggleApprove(row)}>
                      {row.is_approved ? 'Unapprove' : 'Approve'}
                    </button>
                    <button type="button" className={s.actionLink} onClick={() => toggleFeature(row)}>
                      {row.is_featured ? 'Unfeature' : 'Feature'}
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

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete this testimonial?"
        text={`The review from ${confirm?.customer_name} will be permanently removed.`}
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
