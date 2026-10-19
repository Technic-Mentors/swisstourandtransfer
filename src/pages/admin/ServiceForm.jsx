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

const BLANK = {
  name: '',
  short_description: '',
  full_description: '',
  included: '',
  price_text: '',
  is_visible: true,
  show_on_homepage: true,
};

/** Add or edit a service on its own page. */
export default function ServiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const isNew = !id || id === 'new';

  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const backToList = useCallback(() => navigate('/admin/services'), [navigate]);

  // PhotosField reloads from the service's own endpoint after every change.
  const loadPhotos = useCallback(
    (serviceId) => admin.service(serviceId).then(({ service }) => service.photos || []),
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
      .service(id)
      .then(({ service }) => {
        if (!active) return;
        setForm({
          name: service.name,
          short_description: service.short_description ?? '',
          full_description: service.full_description ?? '',
          included: service.included ?? '',
          price_text: service.price_text ?? '',
          is_visible: Boolean(service.is_visible),
          show_on_homepage: Boolean(service.show_on_homepage),
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
      setError('Give the service a name.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (isNew) {
        const created = await admin.createService(form);
        toast.success('Service created.');
        navigate(andClose ? '/admin/services' : `/admin/services/${created.id}`, { replace: true });
      } else {
        await admin.updateService(id, form);
        toast.success('Service saved.');
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
      await admin.deleteService(id);
      toast.success('Service deleted.');
      backToList();
    } catch (err) {
      toast.error(err.message);
      setConfirmDelete(false);
    }
  }

  if (loading) return <Spinner label="Loading service" />;

  return (
    <>
      <Seo title={`${isNew ? 'Add' : 'Edit'} service · Admin`} noindex bare />

      <FormPageHead
        title={isNew ? 'Add new service' : `Edit: ${form.name}`}
        subtitle="Each service gets its own page on the website."
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

      <FormSection title="Service details" icon={Icons.services}>
        <div className={s.formCols}>
          <div className={s.formGrid}>
            <AdminField label="Service name" required value={form.name} onChange={set('name')} />
            <AdminTextArea
              label="Short description"
              rows={4}
              value={form.short_description}
              onChange={set('short_description')}
              hint="Shown on the homepage card and services list."
            />
            <AdminField
              label="Price text"
              value={form.price_text}
              onChange={set('price_text')}
              hint="Free text, e.g. “Fixed price per journey”."
            />
          </div>

          <AdminTextArea
            label="Full description"
            rows={11}
            value={form.full_description}
            onChange={set('full_description')}
            hint="Leave a blank line between paragraphs."
          />
        </div>
      </FormSection>

      <FormSection title="What is included" icon={Icons.content}>
        <AdminTextArea
          label="Included items"
          rows={7}
          value={form.included}
          onChange={set('included')}
          hint="One item per line. Each becomes a ticked point on the service page."
        />
      </FormSection>

      <FormSection title="Photos" icon={Icons.gallery}>
        <PhotosField
          id={id}
          isNew={isNew}
          load={loadPhotos}
          upload={admin.uploadServicePhotos}
          remove={admin.deleteServicePhoto}
          reorder={admin.reorderServicePhotos}
          setCover={admin.setServiceCover}
          toast={toast}
          emptyHint="Save the service first, then add photos here."
        />
      </FormSection>

      <FormSection title="Visibility" icon={Icons.services}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <AdminCheckbox label="Visible on website" checked={form.is_visible} onChange={set('is_visible')} />
          <AdminCheckbox
            label="Show on homepage"
            checked={form.show_on_homepage}
            onChange={set('show_on_homepage')}
          />
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
        title="Delete this service?"
        text={`“${form.name}” and its page will be removed from the website.`}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
