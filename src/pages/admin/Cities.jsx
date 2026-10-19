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

/** City landing pages. Add and edit happen on their own pages. */
export default function Cities() {
  const toast = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(
    () => admin.cities({ q: query, date_from: range.from, date_to: range.to, page, per_page: perPage }),
    [query, range.from, range.to, page, perPage],
  );
  const { data, loading, error, refetch, setData } = useFetch(load, [
    query,
    range.from,
    range.to,
    page,
    perPage,
  ]);

  const cities = data?.cities ?? [];
  const pagination = data?.pagination;

  const refilter = (fn) => (value) => {
    fn(value);
    setPage(1);
  };

  async function doDelete() {
    try {
      await admin.deleteCity(confirm.id);
      toast.success('City deleted.');
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirm(null);
    }
  }

  async function reorder(next) {
    setData({ cities: next, pagination });
    try {
      await admin.reorderCities(next.map((c) => c.id), pagination?.start ?? 0);
    } catch (err) {
      toast.error(err.message);
      refetch();
    }
  }

  async function toggle(city) {
    try {
      await admin.toggleCity(city.id, city.is_visible ? 0 : 1);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <>
      <Seo title="Cities · Admin" noindex bare />

      <AdminPageHead
        title="Cities"
        subtitle="Each city has its own landing page at /chauffeur-service/… — these are the pages that rank for “chauffeur service Zurich” and similar searches."
      >
        <AdminButton onClick={() => navigate('/admin/cities/new')}>+ Add city</AdminButton>
      </AdminPageHead>

      {error && <Alert tone="error">{error.message}</Alert>}

      <FilterBar
        search={query}
        onSearchChange={(e) => refilter(setQuery)(e.target.value)}
        searchPlaceholder="Search cities"
        activeCount={(range.from || range.to ? 1 : 0)}
        onClear={() => refilter(setRange)({ from: '', to: '' })}
      >
        <DateRangeFilter label="Created between" value={range} onChange={refilter(setRange)} />
      </FilterBar>

      <Card>
        <div className={s.cardPad}>
          {loading ? (
            <Spinner label="Loading cities" />
          ) : cities.length ? (
            <div className={s.cityList}>
              <SortableList
                items={cities}
                onReorder={reorder}
                renderItem={(c) => (
                  <div className={s.cityInfo}>
                    <div className={s.sortName}>{c.name}</div>
                    <div className={s.cityMeta}>
                      <span>{c.hub_label || 'No hub label'}</span>
                      <span>
                        {c.vehicle_count} vehicle{Number(c.vehicle_count) === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className={s.citySlug}>/chauffeur-service/{c.slug}</div>
                  </div>
                )}
                right={(c) => (
                  <div className={s.cityActions}>
                    <StatusBadge on={c.is_visible} />
                    <button
                      type="button"
                      className={s.actionLink}
                      onClick={() => navigate(`/admin/cities/${c.id}`)}
                    >
                      Edit
                    </button>
                    <button type="button" className={s.actionLink} onClick={() => toggle(c)}>
                      {c.is_visible ? 'Hide' : 'Show'}
                    </button>
                    <button
                      type="button"
                      className={`${s.actionLink} ${s.actionDanger}`}
                      onClick={() => setConfirm(c)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              />
            </div>
          ) : (
            <div className={s.empty}>No cities match these filters.</div>
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
        title="Delete this city?"
        text={`“${confirm?.name}” and its landing page will be removed, and it will be unlinked from every vehicle.`}
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
