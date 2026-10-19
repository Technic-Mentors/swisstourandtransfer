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

/**
 * The vehicle list.
 *
 * Adding and editing happen on their own pages (/admin/vehicles/new and
 * /admin/vehicles/:id), so the form never has to share the screen with
 * the table.
 */
export default function Vehicles() {
  const toast = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(
    () => admin.vehicles({ q: query, date_from: range.from, date_to: range.to, page, per_page: perPage }),
    [query, range.from, range.to, page, perPage],
  );
  const { data, loading, error, refetch } = useFetch(load, [query, range.from, range.to, page, perPage]);

  const vehicles = data?.vehicles ?? [];
  const pagination = data?.pagination;

  // Any filter change invalidates the current page number.
  const refilter = (fn) => (value) => {
    fn(value);
    setPage(1);
  };

  async function toggleVisible(vehicle) {
    try {
      await admin.toggleVehicle(vehicle.id, vehicle.is_visible ? 0 : 1);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function toggleFeatured(vehicle) {
    try {
      await admin.featureVehicle(vehicle.id, vehicle.is_featured ? 0 : 1);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function doDelete() {
    try {
      await admin.deleteVehicle(confirm.id);
      toast.success('Vehicle deleted.');
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirm(null);
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Vehicle',
      width: '30%',
      render: (row) => (
        <div className={s.rowMedia}>
          {row.cover_image ? (
            <img className={s.thumb} src={uploadUrl(row.cover_image)} alt="" loading="lazy" />
          ) : (
            <span className={s.thumbEmpty} />
          )}
          <div>
            <div className={s.cellStrong}>{row.name}</div>
            <div className={s.cellMuted}>
              {row.photo_count} photo{Number(row.photo_count) === 1 ? '' : 's'}
              {row.is_featured ? ' · Featured' : ''}
            </div>
          </div>
        </div>
      ),
    },
    { key: 'category_name', label: 'Category', width: '16%', render: (row) => row.category_name || '—' },
    {
      key: 'cities',
      label: 'Cities',
      width: '14%',
      render: (row) => <span className={s.cellMuted}>{row.cities ? row.cities.split(', ').length : 0} cities</span>,
    },
    { key: 'status', label: 'Status', width: '12%', render: (row) => <StatusBadge on={row.is_visible} /> },
    {
      key: 'actions',
      label: 'Actions',
      width: '28%',
      render: (row) => (
        <div className={s.vehicleActionCell}>
          <button type="button" className={s.actionLink} onClick={() => navigate(`/admin/vehicles/${row.id}`)}>
            Edit
          </button>
          <button type="button" className={s.actionLink} onClick={() => toggleVisible(row)}>
            {row.is_visible ? 'Hide' : 'Show'}
          </button>
          <button type="button" className={s.actionLink} onClick={() => toggleFeatured(row)}>
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
      <Seo title="Vehicles · Admin" noindex bare />

      <AdminPageHead
        title="Vehicles"
        subtitle="Add, edit or remove vehicles. Each one gets its own page and WhatsApp button automatically."
      >
        <AdminButton onClick={() => navigate('/admin/vehicles/new')}>+ Add vehicle</AdminButton>
      </AdminPageHead>

      {error && <Alert tone="error">{error.message}</Alert>}

      <FilterBar
        search={query}
        onSearchChange={(e) => refilter(setQuery)(e.target.value)}
        searchPlaceholder="Search vehicles"
        activeCount={(range.from || range.to ? 1 : 0)}
        onClear={() => refilter(setRange)({ from: '', to: '' })}
      >
        <DateRangeFilter label="Added between" value={range} onChange={refilter(setRange)} />
      </FilterBar>

      <Card>
        {loading ? (
          <Spinner label="Loading vehicles" />
        ) : vehicles.length === 0 ? (
          <DataTable columns={columns} rows={vehicles} empty="No vehicles match these filters." />
        ) : (
          <>
            <div className={s.vehiclesDesktop}>
              <DataTable columns={columns} rows={vehicles} />
            </div>
            <div className={s.vehicleCards}>
              {vehicles.map((vehicle) => (
                <article className={s.vehicleCard} key={vehicle.id}>
                  <div className={s.vehicleCardHead}>
                    {vehicle.cover_image ? (
                      <img
                        className={s.vehicleCardImage}
                        src={uploadUrl(vehicle.cover_image)}
                        alt=""
                        loading="lazy"
                      />
                    ) : (
                      <span className={s.vehicleCardImageEmpty} aria-hidden="true" />
                    )}
                    <div className={s.vehicleCardIdentity}>
                      <div className={s.cellStrong}>{vehicle.name}</div>
                      <div className={s.vehicleCardCategory}>{vehicle.category_name || 'Uncategorised'}</div>
                    </div>
                    <StatusBadge on={vehicle.is_visible} />
                  </div>

                  <div className={s.vehicleCardMeta}>
                    <span>
                      {vehicle.photo_count} photo{Number(vehicle.photo_count) === 1 ? '' : 's'}
                    </span>
                    <span>{vehicle.cities ? vehicle.cities.split(', ').length : 0} cities</span>
                    {vehicle.is_featured ? <span className={s.vehicleFeatured}>Featured</span> : null}
                  </div>

                  <div className={s.vehicleCardActions}>
                    <button
                      type="button"
                      className={s.actionLink}
                      onClick={() => navigate(`/admin/vehicles/${vehicle.id}`)}
                    >
                      Edit
                    </button>
                    <button type="button" className={s.actionLink} onClick={() => toggleVisible(vehicle)}>
                      {vehicle.is_visible ? 'Hide' : 'Show'}
                    </button>
                    <button type="button" className={s.actionLink} onClick={() => toggleFeatured(vehicle)}>
                      {vehicle.is_featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button
                      type="button"
                      className={`${s.actionLink} ${s.actionDanger}`}
                      onClick={() => setConfirm(vehicle)}
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
        title="Delete this vehicle?"
        text={`“${confirm?.name}” and all of its photos and specifications will be removed. This cannot be undone.`}
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
