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
  Alert,
  ConfirmDialog,
  FormBar,
  FormPageHead,
  FormSection,
  Toast,
} from '../../components/admin/widgets';
import { Spinner } from '../../components/ui';
import s from '../../components/admin/admin.module.css';

const BLANK = { name: '', is_visible: true };

/**
 * Add or edit a gallery album. Albums are the categories visitors filter the
 * public gallery by, so the name is what they see.
 */
export default function AlbumForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const isNew = !id || id === 'new';

  const [form, setForm] = useState(BLANK);
  const [photoCount, setPhotoCount] = useState(0);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const backToList = useCallback(() => navigate('/admin/gallery'), [navigate]);

  useEffect(() => {
    if (isNew) {
      setForm(BLANK);
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);

    admin
      .albums({ per_page: 'all' })
      .then(({ albums }) => {
        if (!active) return;
        const found = albums.find((a) => String(a.id) === String(id));
        if (!found) {
          setError('That album no longer exists.');
          return;
        }
        setForm({ name: found.name, is_visible: Boolean(found.is_visible) });
        setPhotoCount(Number(found.photo_count || 0));
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id, isNew]);

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function save() {
    if (!form.name.trim()) {
      setError('Give the album a name.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (isNew) await admin.createAlbum(form);
      else await admin.updateAlbum(id, form);
      toast.success('Album saved.');
      backToList();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function doDelete() {
    try {
      await admin.deleteAlbum(id);
      toast.success('Album and its photos deleted.');
      backToList();
    } catch (err) {
      toast.error(err.message);
      setConfirmDelete(false);
    }
  }

  if (loading) return <Spinner label="Loading album" />;

  return (
    <>
      <Seo title={`${isNew ? 'Add' : 'Edit'} album · Admin`} noindex bare />

      <FormPageHead
        title={isNew ? 'Add new album' : `Edit: ${form.name}`}
        subtitle="Albums are the filter chips visitors see on the gallery page."
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
        <AdminButton variant="gold" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save & publish'}
        </AdminButton>
      </FormPageHead>

      {error && <Alert tone="error">{error}</Alert>}

      <FormSection title="Album details" icon={Icons.gallery}>
        <div className={s.formGrid} style={{ maxWidth: 620 }}>
          <AdminField
            label="Album name"
            required
            value={form.name}
            onChange={set('name')}
            placeholder="Weddings"
          />
          <AdminCheckbox label="Visible on website" checked={form.is_visible} onChange={set('is_visible')} />
          {!isNew && (
            <p className={s.hint}>
              This album holds {photoCount} photo{photoCount === 1 ? '' : 's'}. Upload more from the
              Gallery screen.
            </p>
          )}
        </div>
      </FormSection>

      <FormBar note="Photos are uploaded from the Gallery screen.">
        <AdminButton variant="outline" onClick={backToList} disabled={saving}>
          Cancel
        </AdminButton>
        <AdminButton variant="gold" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save & close'}
        </AdminButton>
      </FormBar>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this album?"
        text={`“${form.name}” and all ${photoCount} photo(s) in it will be deleted.`}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
