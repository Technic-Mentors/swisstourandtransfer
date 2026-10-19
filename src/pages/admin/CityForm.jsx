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
import SingleImageField from '../../components/admin/SingleImageField';
import { Spinner } from '../../components/ui';
import s from '../../components/admin/admin.module.css';

const BLANK = {
  name: '',
  hub_label: '',
  intro: '',
  description: '',
  image: '',
  lat: '',
  lng: '',
  is_visible: true,
};

/** Add or edit a city landing page on its own page. */
export default function CityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const isNew = !id || id === 'new';

  const [form, setForm] = useState(BLANK);
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const backToList = useCallback(() => navigate('/admin/cities'), [navigate]);

  useEffect(() => {
    if (isNew) {
      setForm(BLANK);
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);

    admin
      .cities({ per_page: 'all' })
      .then(({ cities }) => {
        if (!active) return;
        const found = cities.find((c) => String(c.id) === String(id));
        if (!found) {
          setError('That city no longer exists.');
          return;
        }
        setSlug(found.slug);
        setForm({
          name: found.name,
          hub_label: found.hub_label ?? '',
          intro: found.intro ?? '',
          description: found.description ?? '',
          image: found.image ?? '',
          lat: found.lat ?? '',
          lng: found.lng ?? '',
          is_visible: Boolean(found.is_visible),
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
      setError('Give the city a name.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (isNew) {
        const created = await admin.createCity(form);
        toast.success('City created.');
        navigate(andClose ? '/admin/cities' : `/admin/cities/${created.id}`, { replace: true });
      } else {
        await admin.updateCity(id, form);
        toast.success('City saved.');
        if (andClose) backToList();
      }
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  }

  async function doDelete() {
    try {
      await admin.deleteCity(id);
      toast.success('City deleted.');
      backToList();
    } catch (err) {
      toast.error(err.message);
      setConfirmDelete(false);
    }
  }

  if (loading) return <Spinner label="Loading city" />;

  return (
    <>
      <Seo title={`${isNew ? 'Add' : 'Edit'} city · Admin`} noindex bare />

      <FormPageHead
        title={isNew ? 'Add new city' : `Edit: ${form.name}`}
        subtitle={
          slug
            ? `Landing page: /chauffeur-service/${slug}`
            : 'This becomes a landing page for city searches like “chauffeur service Zurich”.'
        }
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

      <FormSection title="City details" icon={Icons.cities}>
        <div className={s.formCols}>
          <div className={s.formGrid}>
            <AdminField label="City name" required value={form.name} onChange={set('name')} />
            <AdminField
              label="Hub label"
              value={form.hub_label}
              onChange={set('hub_label')}
              hint="Short line under the name, e.g. “ZRH Airport · Hauptbahnhof”."
            />
            <AdminTextArea
              label="Intro"
              rows={4}
              value={form.intro}
              onChange={set('intro')}
              hint="One or two sentences. Also used as the page description for search engines."
            />
          </div>

          <AdminTextArea
            label="Description"
            rows={11}
            value={form.description}
            onChange={set('description')}
            hint="Leave a blank line between paragraphs."
          />
        </div>
      </FormSection>

      <FormSection title="Image & map" icon={Icons.gallery}>
        <SingleImageField
          label="City image"
          folder="cities"
          value={form.image}
          onChange={(path) => setForm((prev) => ({ ...prev, image: path }))}
          onError={toast.error}
        />

        <div className={s.grid2} style={{ marginTop: 16, maxWidth: 520 }}>
          <AdminField label="Latitude" value={form.lat} onChange={set('lat')} placeholder="47.3769" />
          <AdminField label="Longitude" value={form.lng} onChange={set('lng')} placeholder="8.5417" />
        </div>

        <div style={{ marginTop: 16 }}>
          <AdminCheckbox label="Visible on website" checked={form.is_visible} onChange={set('is_visible')} />
        </div>
      </FormSection>

      <FormBar note="Changes go live immediately.">
        <AdminButton variant="outline" onClick={backToList} disabled={saving}>
          Cancel
        </AdminButton>
        <AdminButton variant="gold" onClick={() => save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save & close'}
        </AdminButton>
        <AdminButton onClick={() => save({ andClose: false })} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </AdminButton>
      </FormBar>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this city?"
        text={`“${form.name}” and its landing page will be removed, and it will be unlinked from every vehicle.`}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
