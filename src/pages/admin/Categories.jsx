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

/** Vehicle categories. Add and edit happen on their own pages. */
export default function Categories() {
  const toast = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(
    () => admin.categories({ q: query, date_from: range.from, date_to: range.to, page, per_page: perPage }),
    [query, range.from, range.to, page, perPage],
  );
  const { data, loading, error, refetch, setData } = useFetch(load, [
    query,
    range.from,
    range.to,
    page,
    perPage,
  ]);

  const categories = data?.categories ?? [];
  const pagination = data?.pagination;

  const refilter = (fn) => (value) => {
    fn(value);
    setPage(1);
  };

  async function doDelete() {
    try {
      await admin.deleteCategory(confirm.id);
      toast.success('Category deleted.');
      refetch();
    } catch (err) {
      // The API refuses while vehicles still use the category.
      toast.error(err.message);
    } finally {
      setConfirm(null);
    }
  }

  async function reorder(next) {
    setData({ categories: next, pagination });
    try {
      // `start` keeps the numbering right when the list spans several pages.
      await admin.reorderCategories(next.map((c) => c.id), pagination?.start ?? 0);
    } catch (err) {
      toast.error(err.message);
      refetch();
    }
  }

  async function toggle(category) {
    try {
      await admin.toggleCategory(category.id, category.is_visible ? 0 : 1);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <>
      <Seo title="Vehicle categories · Admin" noindex bare />

      <AdminPageHead
        title="Vehicle categories"
        subtitle="The classes shown on the homepage and used to group vehicles. Drag to reorder."
      >
        <AdminButton onClick={() => navigate('/admin/categories/new')}>+ Add category</AdminButton>
      </AdminPageHead>

      {error && <Alert tone="error">{error.message}</Alert>}

      <FilterBar
        search={query}
        onSearchChange={(e) => refilter(setQuery)(e.target.value)}
        searchPlaceholder="Search categories"
        activeCount={(range.from || range.to ? 1 : 0)}
        onClear={() => refilter(setRange)({ from: '', to: '' })}
      >
        <DateRangeFilter label="Created between" value={range} onChange={refilter(setRange)} />
      </FilterBar>

      <Card>
        <div className={s.cardPad}>
          {loading ? (
            <Spinner label="Loading categories" />
          ) : categories.length ? (
            <div className={s.categoryList}>
              <SortableList
                items={categories}
                onReorder={reorder}
                renderItem={(c) => (
                  <div className={s.sortWithThumb}>
                    <RowThumb src={c.cover_image} alt={c.name} count={c.photo_count} />
                    <div className={s.categoryInfo}>
                      <div className={s.sortName}>{c.name}</div>
                      <div className={s.sortNote}>
                        {c.vehicle_count} vehicle{Number(c.vehicle_count) === 1 ? '' : 's'}
                        {' · '}
                        {Number(c.photo_count) || 0} photo{Number(c.photo_count) === 1 ? '' : 's'}
                      </div>
                      {c.description && <div className={s.categoryDescription}>{c.description}</div>}
                    </div>
                  </div>
                )}
                right={(c) => (
                  <div className={s.categoryActions}>
                    <StatusBadge on={c.is_visible} />
                    <button
                      type="button"
                      className={s.actionLink}
                      onClick={() => navigate(`/admin/categories/${c.id}`)}
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
            <div className={s.empty}>No categories match these filters.</div>
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
        title="Delete this category?"
        text={`“${confirm?.name}” will be removed. Categories that still have vehicles cannot be deleted.`}
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
