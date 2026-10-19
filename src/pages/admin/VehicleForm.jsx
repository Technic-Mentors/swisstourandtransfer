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
  CheckPill,
  ConfirmDialog,
  FormBar,
  FormPageHead,
  FormSection,
  ImageUploader,
  Toast,
} from '../../components/admin/widgets';
import { Spinner } from '../../components/ui';
import s from '../../components/admin/admin.module.css';

const BLANK = {
  name: '',
  category_id: '',
  tagline: '',
  description: '',
  passengers: 3,
  suitcases: 2,
  hand_bags: 2,
  price_from: '',
  price_unit: 'hour',
  price_note: 'Price on request',
  ideal_for: '',
  whatsapp_template: '',
  is_visible: true,
  is_featured: false,
  city_ids: [],
};

/** Specs are edited as plain "Label: Value" lines - quicker than a row editor. */
const specsToText = (specs = []) => specs.map((sp) => `${sp.spec_label}: ${sp.spec_value}`).join('\n');

function textToSpecs(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const at = line.indexOf(':');
      if (at === -1) return { spec_label: line, spec_value: '' };
      return { spec_label: line.slice(0, at).trim(), spec_value: line.slice(at + 1).trim() };
    })
    .filter((sp) => sp.spec_label && sp.spec_value);
}

/**
 * Add or edit a vehicle on its own page.
 *
 * /admin/vehicles/new and /admin/vehicles/:id replace the list rather than
 * opening over it, so the form gets the full width and the browser back
 * button returns to the list.
 */
export default function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const isNew = !id || id === 'new';

  const [form, setForm] = useState(BLANK);
  const [specText, setSpecText] = useState('');
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const backToList = useCallback(() => navigate('/admin/vehicles'), [navigate]);

  /* ------------------------------------------------------------- load */

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      admin.categories({ per_page: 'all' }),
      admin.cities({ per_page: 'all' }),
      isNew ? Promise.resolve(null) : admin.vehicle(id),
    ])
      .then(([cats, cityRes, vehicleRes]) => {
        if (!active) return;

        setCategories(cats.categories);
        setCities(cityRes.cities);

        if (vehicleRes) {
          const v = vehicleRes.vehicle;
          setForm({
            name: v.name,
            category_id: v.category_id ?? '',
            tagline: v.tagline ?? '',
            description: v.description ?? '',
            passengers: v.passengers,
            suitcases: v.suitcases,
            hand_bags: v.hand_bags,
            price_from: v.price_from ?? '',
            price_unit: v.price_unit || 'hour',
            price_note: v.price_note ?? '',
            ideal_for: v.ideal_for ?? '',
            whatsapp_template: v.whatsapp_template ?? '',
            is_visible: Boolean(v.is_visible),
            is_featured: Boolean(v.is_featured),
            city_ids: v.city_ids || [],
          });
          setSpecText(specsToText(v.specs));
          setPhotos(v.photos || []);
        } else {
          setForm({ ...BLANK, category_id: cats.categories[0]?.id ?? '' });
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, isNew]);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ------------------------------------------------------------- save */

  async function save({ andClose = false } = {}) {
    if (!form.name.trim()) {
      setError('Give the vehicle a name.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      ...form,
      price_from: form.price_from === '' ? null : form.price_from,
      specs: textToSpecs(specText),
    };

    try {
      if (isNew) {
        const created = await admin.createVehicle(payload);
        toast.success('Vehicle created. You can add photos now.');
        // Move onto the saved record so photos can be uploaded against it.
        navigate(andClose ? '/admin/vehicles' : `/admin/vehicles/${created.id}`, { replace: true });
      } else {
        await admin.updateVehicle(id, payload);
        toast.success('Vehicle saved.');
        if (andClose) backToList();
      }
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  }

  async function reloadPhotos() {
    const { vehicle } = await admin.vehicle(id);
    setPhotos(vehicle.photos || []);
  }

  async function uploadPhotos(files) {
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((file) => fd.append('images', file));
      await admin.uploadVehiclePhotos(id, fd);
      await reloadPhotos();
      toast.success(`Uploaded ${files.length} photo(s).`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto(photo) {
    try {
      await admin.deleteVehiclePhoto(id, photo.id);
      await reloadPhotos();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function makeCover(photo) {
    try {
      await admin.setVehicleCover(id, photo.id);
      setPhotos((prev) => prev.map((p) => ({ ...p, is_cover: p.id === photo.id ? 1 : 0 })));
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function reorderPhotos(next) {
    setPhotos(next);
    try {
      await admin.reorderVehiclePhotos(id, next.map((p) => p.id));
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function doDelete() {
    try {
      await admin.deleteVehicle(id);
      toast.success('Vehicle deleted.');
      backToList();
    } catch (err) {
      toast.error(err.message);
      setConfirmDelete(false);
    }
  }

  if (loading) return <Spinner label="Loading vehicle" />;

  const title = isNew ? 'Add new vehicle' : `Edit: ${form.name}`;

  return (
    <>
      <Seo title={`${isNew ? 'Add' : 'Edit'} vehicle · Admin`} noindex bare />

      <FormPageHead
        title={title}
        subtitle={
          isNew
            ? 'It gets its own page and WhatsApp button as soon as you save.'
            : 'Changes go live on the website as soon as you save.'
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

      <FormSection title="Vehicle details" icon={Icons.vehicles}>
        <div className={s.formCols}>
          <div className={s.formGrid}>
            <AdminField label="Vehicle name" required value={form.name} onChange={set('name')} />

            <AdminSelect
              label="Category"
              value={form.category_id}
              onChange={set('category_id')}
              placeholder="None"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />

            <AdminField
              label="Tagline"
              value={form.tagline}
              onChange={set('tagline')}
              hint="One line shown on the vehicle card."
            />
          </div>

          <div className={s.formGrid}>
            <AdminTextArea
              label="Description"
              rows={8}
              value={form.description}
              onChange={set('description')}
              hint="Leave a blank line between paragraphs."
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Capacity & price" icon={Icons.promotions}>
        <div className={s.grid3}>
          <AdminField
            label="Passengers"
            type="number"
            min="1"
            max="60"
            value={form.passengers}
            onChange={set('passengers')}
          />
          <AdminField
            label="Suitcases"
            type="number"
            min="0"
            max="60"
            value={form.suitcases}
            onChange={set('suitcases')}
          />
          <AdminField
            label="Hand bags"
            type="number"
            min="0"
            max="60"
            value={form.hand_bags}
            onChange={set('hand_bags')}
          />
        </div>

        <div className={s.grid3} style={{ marginTop: 14 }}>
          <AdminField
            label="Price from (CHF)"
            type="number"
            min="0"
            step="1"
            value={form.price_from}
            onChange={set('price_from')}
            placeholder="Empty = on request"
          />
          <AdminSelect
            label="Per"
            value={form.price_unit}
            onChange={set('price_unit')}
            options={[
              { value: 'hour', label: 'Hour' },
              { value: 'journey', label: 'Journey' },
              { value: 'day', label: 'Day' },
            ]}
          />
          <AdminField
            label="Price note"
            value={form.price_note}
            onChange={set('price_note')}
            hint="Shown under the price."
          />
        </div>
      </FormSection>

      <FormSection title="Photos" icon={Icons.gallery}>
        {isNew ? (
          <div className={s.dropZone}>Save the vehicle first, then add photos here.</div>
        ) : (
          <>
            <p className={s.hint} style={{ marginBottom: 12 }}>
              Drag to reorder. The first photo is the cover shown on cards and listings.
            </p>
            <ImageUploader
              photos={photos}
              uploading={uploading}
              onUpload={uploadPhotos}
              onDelete={removePhoto}
              onSetCover={makeCover}
              onReorder={reorderPhotos}
            />
          </>
        )}
      </FormSection>

      <FormSection title="Specifications & suitability" icon={Icons.content}>
        <div className={s.formCols}>
          <AdminTextArea
            label="Specifications"
            rows={8}
            value={specText}
            onChange={(e) => setSpecText(e.target.value)}
            hint="One per line, as “Label: Value” — e.g. “Transmission: Automatic”."
          />
          <AdminTextArea
            label="Ideal for"
            rows={8}
            value={form.ideal_for}
            onChange={set('ideal_for')}
            hint="One item per line."
          />
        </div>
      </FormSection>

      <FormSection title="Availability & booking" icon={Icons.cities}>
        <div className={s.field} style={{ marginBottom: 16 }}>
          <span className={s.label}>Available in cities</span>
          <div className={s.pillRow}>
            {cities.map((city) => (
              <CheckPill
                key={city.id}
                label={city.name}
                checked={form.city_ids.includes(city.id)}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    city_ids: e.target.checked
                      ? [...prev.city_ids, city.id]
                      : prev.city_ids.filter((cid) => cid !== city.id),
                  }))
                }
              />
            ))}
          </div>
        </div>

        <AdminTextArea
          label="WhatsApp message template"
          rows={3}
          value={form.whatsapp_template}
          onChange={set('whatsapp_template')}
          hint="Optional. Leave empty to use the global template. Placeholders: {vehicle} {city}"
        />

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 16 }}>
          <AdminCheckbox label="Visible on website" checked={form.is_visible} onChange={set('is_visible')} />
          <AdminCheckbox label="Featured on homepage" checked={form.is_featured} onChange={set('is_featured')} />
        </div>
      </FormSection>

      <FormBar note={isNew ? 'Save to create the vehicle, then add its photos.' : 'Changes go live immediately.'}>
        <AdminButton variant="outline" onClick={backToList} disabled={saving}>
          Cancel
        </AdminButton>
        <AdminButton variant="gold" onClick={() => save({ andClose: true })} disabled={saving}>
          {saving ? 'Saving…' : 'Save & close'}
        </AdminButton>
        <AdminButton onClick={() => save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </AdminButton>
      </FormBar>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this vehicle?"
        text={`“${form.name}” and all of its photos and specifications will be removed. This cannot be undone.`}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
