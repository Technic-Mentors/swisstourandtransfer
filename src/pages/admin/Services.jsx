import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadUrl } from '../../config';
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
  DateRangeFilter,
  FilterBar,
  Pagination,
  SearchBox,
  SortableList,
  StatusBadge,
  Toast,
} from '../../components/admin/widgets';
import { Spinner } from '../../components/ui';
import s from '../../components/admin/admin.module.css';

/** The cover photo, or a placeholder when a record has none yet. */
function RowThumb({ src, alt, count }) {
  return (
    <span className={s.sortThumb}>
      {src ? <img src={uploadUrl(src)} alt={alt} loading="lazy" /> : <span className={s.sortThumbEmpty}>No photo</span>}
      {Number(count) > 1 && <span className={s.sortThumbCount}>{count}</span>}
    </span>
  );
}

/** Services list. Add and edit happen on their own pages. */
export default function Services() {
  const toast = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(
    () => admin.services({ q: query, date_from: range.from, date_to: range.to, page, per_page: perPage }),
    [query, range.from, range.to, page, perPage],
  );
  const { data, loading, error, refetch, setData } = useFetch(load, [
    query,
    range.from,
    range.to,
    page,
    perPage,
  ]);

  const services = data?.services ?? [];
  const pagination = data?.pagination;

  const refilter = (fn) => (value) => {
    fn(value);
    setPage(1);
  };

  async function doDelete() {
    try {
      await admin.deleteService(confirm.id);
      toast.success('Service deleted.');
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirm(null);
    }
  }

  async function reorder(next) {
    setData({ services: next, pagination });
    try {
      await admin.reorderServices(next.map((x) => x.id), pagination?.start ?? 0);
    } catch (err) {
      toast.error(err.message);
      refetch();
    }
  }

  async function toggle(service) {
    try {
      await admin.toggleService(service.id, service.is_visible ? 0 : 1);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <>
      <Seo title="Services · Admin" noindex bare />

      <AdminPageHead
        title="Services"
        subtitle="Add, edit, reorder or hide services. Each service gets its own page on the website."
      >
        <AdminButton onClick={() => navigate('/admin/services/new')}>+ Add service</AdminButton>
      </AdminPageHead>

      {error && <Alert tone="error">{error.message}</Alert>}

      <FilterBar
        search={query}
        onSearchChange={(e) => refilter(setQuery)(e.target.value)}
        searchPlaceholder="Search services"
        activeCount={(range.from || range.to ? 1 : 0)}
        onClear={() => refilter(setRange)({ from: '', to: '' })}
      >
        <DateRangeFilter label="Created between" value={range} onChange={refilter(setRange)} />
      </FilterBar>

      <Card>
        <div className={s.cardPad}>
          {loading ? (
            <Spinner label="Loading services" />
          ) : services.length ? (
            <div className={s.serviceList}>
              <SortableList
                items={services}
                onReorder={reorder}
                renderItem={(x) => (
                  <div className={s.sortWithThumb}>
                    <RowThumb src={x.cover_image} alt={x.name} count={x.photo_count} />
                    <div className={s.serviceInfo}>
                      <div className={s.sortName}>{x.name}</div>
                      <div className={s.sortNote}>
                        {Number(x.photo_count) || 0} photo{Number(x.photo_count) === 1 ? '' : 's'}
                      </div>
                      {x.short_description && (
                        <div className={s.serviceDescription}>{x.short_description}</div>
                      )}
                    </div>
                  </div>
                )}
                right={(x) => (
                  <div className={s.serviceActions}>
                    <span className={s.serviceFlag}>
                      {x.show_on_homepage ? (
                        <StatusBadge tone="info" onLabel="Homepage" />
                      ) : (
                        <span className={s.serviceFlagOff}>Not on homepage</span>
                      )}
                    </span>
                    <span className={s.serviceFlag}>
                      <StatusBadge on={x.is_visible} />
                    </span>
                    <button
                      type="button"
                      className={s.actionLink}
                      onClick={() => navigate(`/admin/services/${x.id}`)}
                    >
                      Edit
                    </button>
                    <button type="button" className={s.actionLink} onClick={() => toggle(x)}>
                      {x.is_visible ? 'Hide' : 'Show'}
                    </button>
                    <button
                      type="button"
                      className={`${s.actionLink} ${s.actionDanger}`}
                      onClick={() => setConfirm(x)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              />
            </div>
          ) : (
            <div className={s.empty}>No services match these filters.</div>
          )}
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
      </Card>

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete this service?"
        text={`“${confirm?.name}” and its page will be removed from the website.`}
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
