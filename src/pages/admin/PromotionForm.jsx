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
  AdminSelect,
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
  title: '',
  description: '',
  code: '',
  banner_image: '',
  placement: 'both',
  starts_at: '',
  ends_at: '',
  link_type: 'whatsapp',
  link_url: '',
  is_active: true,
};

const asDate = (value) => (value ? String(value).slice(0, 10) : '');

/** Add or edit a promotional offer on its own page. */
export default function PromotionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const isNew = !id || id === 'new';

  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const backToList = useCallback(() => navigate('/admin/promotions'), [navigate]);

  useEffect(() => {
    if (isNew) {
      setForm(BLANK);
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);

    admin
      .promotions({ per_page: 'all' })
      .then(({ promotions }) => {
        if (!active) return;
        const found = promotions.find((p) => String(p.id) === String(id));
        if (!found) {
          setError('That offer no longer exists.');
          return;
        }
        setForm({
          title: found.title,
          description: found.description ?? '',
          code: found.code ?? '',
          banner_image: found.banner_image ?? '',
          placement: found.placement,
          starts_at: asDate(found.starts_at),
          ends_at: asDate(found.ends_at),
          link_type: found.link_type || 'whatsapp',
          link_url: found.link_url ?? '',
          is_active: Boolean(found.is_active),
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
    if (!form.title.trim()) {
      setError('Give the offer a title.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (isNew) {
        const created = await admin.createPromotion(form);
        toast.success('Offer created.');
        navigate(andClose ? '/admin/promotions' : `/admin/promotions/${created.id}`, { replace: true });
      } else {
        await admin.updatePromotion(id, form);
        toast.success('Offer saved.');
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
      await admin.deletePromotion(id);
      toast.success('Offer deleted.');
      backToList();
    } catch (err) {
      toast.error(err.message);
      setConfirmDelete(false);
    }
  }

  if (loading) return <Spinner label="Loading offer" />;

  return (
    <>
      <Seo title={`${isNew ? 'Add' : 'Edit'} offer · Admin`} noindex bare />

      <FormPageHead
        title={isNew ? 'Add new offer' : `Edit: ${form.title}`}
        subtitle="Offers past their end date hide themselves from the website automatically."
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

      <FormSection title="Offer details" icon={Icons.promotions}>
        <div className={s.formCols}>
          <div className={s.formGrid}>
            <AdminField label="Title" required value={form.title} onChange={set('title')} />
            <AdminField
              label="Code"
              value={form.code}
              onChange={set('code')}
              placeholder="SKI26"
              hint="Optional. Shown to guests to quote when they book."
            />
            <AdminSelect
              label="Placement"
              value={form.placement}
              onChange={set('placement')}
              options={[
                { value: 'both', label: 'Homepage banner + offers page' },
                { value: 'homepage_banner', label: 'Homepage banner only' },
                { value: 'offers_page', label: 'Offers page only' },
              ]}
            />
          </div>

          <AdminTextArea
            label="Description"
            rows={9}
            value={form.description}
            onChange={set('description')}
          />
        </div>
      </FormSection>

      <FormSection title="Dates & banner" icon={Icons.content}>
        <div className={s.grid2} style={{ maxWidth: 520 }}>
          <AdminField label="Starts" type="date" value={form.starts_at} onChange={set('starts_at')} />
          <AdminField label="Ends" type="date" value={form.ends_at} onChange={set('ends_at')} />
        </div>

        <div style={{ marginTop: 16 }}>
          <SingleImageField
            label="Banner image"
            folder="promotions"
            value={form.banner_image}
            onChange={(path) => setForm((prev) => ({ ...prev, banner_image: path }))}
            onError={toast.error}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <AdminCheckbox label="Active" checked={form.is_active} onChange={set('is_active')} />
        </div>
      </FormSection>

      <FormBar note="An offer only shows when it is active and inside its date window.">
        <AdminButton variant="outline" onClick={backToList} disabled={saving}>
          Cancel
        </AdminButton>
        <AdminButton variant="gold" onClick={() => save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save & close'}
        </AdminButton>
      </FormBar>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this offer?"
        text={`“${form.title}” will be removed from the website.`}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
