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
import { Rating, Spinner } from '../../components/ui';
import s from '../../components/admin/admin.module.css';

const BLANK = {
  customer_name: '',
  country: '',
  service_label: '',
  rating: 5,
  review_text: '',
  photo: '',
  source: 'direct',
  is_approved: true,
  is_featured: false,
};

const SERVICES = [
  'Airport transfer',
  'Business travel',
  'Private transfers',
  'Wedding',
  'Ski transfer',
  'Events / WEF',
  'Hourly chauffeur',
];

/** Add or edit a testimonial on its own page. */
export default function TestimonialForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const isNew = !id || id === 'new';

  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const backToList = useCallback(() => navigate('/admin/testimonials'), [navigate]);

  useEffect(() => {
    if (isNew) {
      setForm(BLANK);
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);

    admin
      .testimonials({ per_page: 'all' })
      .then(({ testimonials }) => {
        if (!active) return;
        const found = testimonials.find((t) => String(t.id) === String(id));
        if (!found) {
          setError('That testimonial no longer exists.');
          return;
        }
        setForm({
          customer_name: found.customer_name,
          country: found.country ?? '',
          service_label: found.service_label ?? '',
          rating: found.rating,
          review_text: found.review_text,
          photo: found.photo ?? '',
          source: found.source,
          is_approved: Boolean(found.is_approved),
          is_featured: Boolean(found.is_featured),
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
    if (!form.customer_name.trim() || !form.review_text.trim()) {
      setError('A name and the review text are both required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (isNew) {
        const created = await admin.createTestimonial(form);
        toast.success('Testimonial created.');
        navigate(andClose ? '/admin/testimonials' : `/admin/testimonials/${created.id}`, { replace: true });
      } else {
        await admin.updateTestimonial(id, form);
        toast.success('Testimonial saved.');
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
      await admin.deleteTestimonial(id);
      toast.success('Testimonial deleted.');
      backToList();
    } catch (err) {
      toast.error(err.message);
      setConfirmDelete(false);
    }
  }

  if (loading) return <Spinner label="Loading testimonial" />;

  return (
    <>
      <Seo title={`${isNew ? 'Add' : 'Edit'} testimonial · Admin`} noindex bare />

      <FormPageHead
        title={isNew ? 'Add new testimonial' : `Edit: ${form.customer_name}`}
        subtitle="Approved reviews appear on the reviews page; featured ones also on the homepage."
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

      <FormSection title="The review" icon={Icons.testimonials}>
        <div className={s.formCols}>
          <div className={s.formGrid}>
            <AdminField
              label="Customer name"
              required
              value={form.customer_name}
              onChange={set('customer_name')}
            />
            <AdminField label="Country" value={form.country} onChange={set('country')} />

            <div className={s.grid2}>
              <AdminSelect
                label="Service"
                value={form.service_label}
                onChange={set('service_label')}
                placeholder="Not specified"
                options={SERVICES}
              />
              <AdminSelect
                label="Rating"
                value={form.rating}
                onChange={set('rating')}
                options={[5, 4, 3, 2, 1].map((n) => ({ value: n, label: `${n} star${n === 1 ? '' : 's'}` }))}
              />
            </div>

            <div>
              <span className={s.label}>Preview</span>
              <div style={{ marginTop: 6 }}>
                <Rating value={form.rating} />
              </div>
            </div>
          </div>

          <AdminTextArea
            label="Review text"
            required
            rows={11}
            value={form.review_text}
            onChange={set('review_text')}
          />
        </div>
      </FormSection>

      <FormSection title="Source & visibility" icon={Icons.settings}>
        <div className={s.formCols}>
          <div className={s.formGrid}>
            <AdminSelect
              label="Source"
              value={form.source}
              onChange={set('source')}
              options={[
                { value: 'direct', label: 'Direct' },
                { value: 'google', label: 'Google' },
              ]}
            />

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <AdminCheckbox
                label="Approved (show on website)"
                checked={form.is_approved}
                onChange={set('is_approved')}
              />
              <AdminCheckbox
                label="Feature on homepage"
                checked={form.is_featured}
                onChange={set('is_featured')}
              />
            </div>
          </div>

          <SingleImageField
            label="Customer photo (optional)"
            folder="testimonials"
            value={form.photo}
            onChange={(path) => setForm((prev) => ({ ...prev, photo: path }))}
            onError={toast.error}
          />
        </div>
      </FormSection>

      <FormBar note="Only approved reviews are shown on the website.">
        <AdminButton variant="outline" onClick={backToList} disabled={saving}>
          Cancel
        </AdminButton>
        <AdminButton variant="gold" onClick={() => save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save & close'}
        </AdminButton>
      </FormBar>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this testimonial?"
        text={`The review from ${form.customer_name} will be permanently removed.`}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
