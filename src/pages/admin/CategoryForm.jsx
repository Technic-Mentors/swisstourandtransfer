import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { admin } from '../../api/resources';
import useToast from '../../hooks/useToast';
import Seo from '../../components/seo/Seo';
import { Icons } from '../../components/admin/AdminLayout';
import {
  AdminButton,
  AdminCheckbox,
  AdminField,
  AdminTextArea,
  Alert,
  ConfirmDialog,
  FormBar,
  FormPageHead,
  FormSection,
  Toast,
} from '../../components/admin/widgets';
import PhotosField from '../../components/admin/PhotosField';
import { Spinner } from '../../components/ui';
import s from '../../components/admin/admin.module.css';

const BLANK = { name: '', description: '', is_visible: true };

/** Add or edit a vehicle category on its own page. */
export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const isNew = !id || id === 'new';

  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const backToList = useCallback(() => navigate('/admin/categories'), [navigate]);

  const loadPhotos = useCallback(
    (categoryId) => admin.category(categoryId).then(({ category }) => category.photos || []),
    [],
  );

  useEffect(() => {
    if (isNew) {
      setForm(BLANK);
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);

    admin
      .category(id)
      .then(({ category }) => {
        if (!active) return;
        setForm({
          name: category.name,
          description: category.description ?? '',
          is_visible: Boolean(category.is_visible),
        });
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id, isNew]);

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function save({ andClose = true } = {}) {
    if (!form.name.trim()) {
      setError('Give the category a name.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (isNew) {
        const created = await admin.createCategory(form);
        toast.success('Category created.');
        navigate(andClose ? '/admin/categories' : `/admin/categories/${created.id}`, { replace: true });
      } else {
        await admin.updateCategory(id, form);
        toast.success('Category saved.');
        if (andClose) backToList();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function doDelete() {
    try {
      await admin.deleteCategory(id);
      toast.success('Category deleted.');
      backToList();
    } catch (err) {
      // Refused while vehicles still use it.
      toast.error(err.message);
      setConfirmDelete(false);
    }
  }

  if (loading) return <Spinner label="Loading category" />;

  return (
    <>
      <Seo title={`${isNew ? 'Add' : 'Edit'} category · Admin`} noindex bare />

      <FormPageHead
        title={isNew ? 'Add new category' : `Edit: ${form.name}`}
        subtitle="Categories group the vehicles and appear on the homepage."
        onBack={backToList}
      >
        {!isNew && (
          <AdminButton variant="danger" onClick={() => setConfirmDelete(true)} disabled={saving}>
            Delete
          </AdminButton>
        )}
        <AdminButton variant="outline" onClick={backToList} disabled={saving}>
          Cancel
        </AdminButton>
        <AdminButton variant="gold" onClick={() => save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save & publish'}
        </AdminButton>
      </FormPageHead>

      {error && <Alert tone="error">{error}</Alert>}

      <FormSection title="Category details" icon={Icons.categories}>
        <div className={s.formGrid} style={{ maxWidth: 720 }}>
          <AdminField label="Name" required value={form.name} onChange={set('name')} />
          <AdminTextArea
            label="Description"
            rows={4}
            value={form.description}
            onChange={set('description')}
            hint="Shown on the category page and under the homepage card."
          />
          <AdminCheckbox label="Visible on website" checked={form.is_visible} onChange={set('is_visible')} />
        </div>
      </FormSection>

      <FormSection title="Photos" icon={Icons.gallery}>
        <PhotosField
          id={id}
          isNew={isNew}
          load={loadPhotos}
          upload={admin.uploadCategoryPhotos}
          remove={admin.deleteCategoryPhoto}
          reorder={admin.reorderCategoryPhotos}
          setCover={admin.setCategoryCover}
          toast={toast}
          emptyHint="Save the category first, then add photos here."
        />
      </FormSection>

      <FormBar note="Changes go live immediately.">
        <AdminButton variant="outline" onClick={backToList} disabled={saving}>
          Cancel
        </AdminButton>
        <AdminButton variant="gold" onClick={() => save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save & close'}
        </AdminButton>
      </FormBar>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this category?"
        text={`“${form.name}” will be removed. Categories that still have vehicles cannot be deleted.`}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
