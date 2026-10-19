import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadUrl } from '../../config';
import { admin } from '../../api/resources';
import useToast from '../../hooks/useToast';
import Seo from '../../components/seo/Seo';
import { Icons } from '../../components/admin/AdminLayout';
import {
  AdminButton,
  AdminCheckbox,
  AdminField,
  AdminSelect,
  Alert,
  ConfirmDialog,
  FormBar,
  FormPageHead,
  FormSection,
  Toast,
} from '../../components/admin/widgets';
import { Spinner } from '../../components/ui';
import s from '../../components/admin/admin.module.css';

/**
 * Edit a gallery photo on its own page, so every Edit in the admin behaves
 * the same way. Photos are uploaded from the Gallery screen.
 */
export default function PhotoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ caption: '', alt_text: '', album_id: '', is_visible: true });
  const [filePath, setFilePath] = useState('');
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const backToList = useCallback(() => navigate('/admin/gallery'), [navigate]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([admin.albums({ per_page: 'all' }), admin.photos({ per_page: 'all' })])
      .then(([albumRes, photoRes]) => {
        if (!active) return;
        setAlbums(albumRes.albums);

        const found = photoRes.photos.find((p) => String(p.id) === String(id));
        if (!found) {
          setError('That photo no longer exists.');
          return;
        }

        setFilePath(found.file_path);
        setForm({
          caption: found.caption ?? '',
          alt_text: found.alt_text ?? '',
          album_id: found.album_id,
          is_visible: Boolean(found.is_visible),
        });
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function save() {
    setSaving(true);
    setError('');
    try {
      await admin.updatePhoto(id, {
        caption: form.caption,
        alt_text: form.alt_text || form.caption,
        album_id: form.album_id,
        is_visible: form.is_visible ? 1 : 0,
      });
      toast.success('Photo updated.');
      backToList();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function doDelete() {
    try {
      await admin.deletePhoto(id);
      toast.success('Photo deleted.');
      backToList();
    } catch (err) {
      toast.error(err.message);
      setConfirmDelete(false);
    }
  }

  if (loading) return <Spinner label="Loading photo" />;

  return (
    <>
      <Seo title="Edit photo · Admin" noindex bare />

      <FormPageHead
        title={form.caption ? `Edit: ${form.caption}` : 'Edit photo'}
        subtitle="The caption shows under the photo in the gallery lightbox."
        onBack={backToList}
      >
        <AdminButton variant="danger" onClick={() => setConfirmDelete(true)} disabled={saving}>
          Delete
        </AdminButton>
        <AdminButton variant="outline" onClick={backToList} disabled={saving}>
          Cancel
        </AdminButton>
        <AdminButton variant="gold" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save & publish'}
        </AdminButton>
      </FormPageHead>

      {error && <Alert tone="error">{error}</Alert>}

      <FormSection title="Photo" icon={Icons.gallery}>
        <div className={s.formCols}>
          {filePath && (
            <img
              src={uploadUrl(filePath)}
              alt={form.alt_text || form.caption || ''}
              style={{
                width: '100%',
                maxWidth: 420,
                borderRadius: 12,
                border: '1px solid var(--admin-border)',
              }}
            />
          )}

          <div className={s.formGrid}>
            <AdminField
              label="Caption"
              value={form.caption}
              onChange={set('caption')}
              placeholder="S-Class at Lake Zurich"
            />
            <AdminField
              label="Alt text"
              value={form.alt_text}
              onChange={set('alt_text')}
              hint="Describes the photo for screen readers and search engines. Defaults to the caption."
            />
            <AdminSelect
              label="Album"
              value={form.album_id}
              onChange={set('album_id')}
              options={albums.map((a) => ({ value: a.id, label: a.name }))}
            />
            <AdminCheckbox
              label="Visible on website"
              checked={form.is_visible}
              onChange={set('is_visible')}
            />
          </div>
        </div>
      </FormSection>

      <FormBar note="Moving a photo changes which filter chip it appears under.">
        <AdminButton variant="outline" onClick={backToList} disabled={saving}>
          Cancel
        </AdminButton>
        <AdminButton variant="gold" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save & close'}
        </AdminButton>
      </FormBar>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this photo?"
        text="The photo and its file will be permanently removed."
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
