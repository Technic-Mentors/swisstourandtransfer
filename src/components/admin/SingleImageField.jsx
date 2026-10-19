import { useRef, useState } from 'react';
import { uploadUrl } from '../../config';
import { admin } from '../../api/resources';
import { AdminButton } from './widgets';
import s from './admin.module.css';

/**
 * One image slot, used wherever a record stores a single image path
 * (services, cities, promotions, hero, about). Uploads straight away and
 * hands the stored path back to the parent form.
 */
export default function SingleImageField({ label, folder, value, onChange, onError, hint }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function upload(file) {
    if (!file) return;
    setBusy(true);
    try {
      const { path } = await admin.upload(file, folder);
      onChange(path);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={s.field}>
      {label && <span className={s.label}>{label}</span>}

      {value ? (
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <img
            src={uploadUrl(value)}
            alt=""
            style={{
              width: 180,
              height: 120,
              objectFit: 'cover',
              borderRadius: 8,
              border: '1px solid var(--admin-border)',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AdminButton variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
              {busy ? 'Uploading…' : 'Replace'}
            </AdminButton>
            <AdminButton variant="danger" size="sm" onClick={() => onChange('')} disabled={busy}>
              Remove
            </AdminButton>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={s.dropZone}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            upload(e.dataTransfer.files?.[0]);
          }}
          disabled={busy}
          style={{ cursor: 'pointer', width: '100%' }}
        >
          {busy ? 'Uploading…' : 'Drop an image here, or click to choose one'}
        </button>
      )}

      {hint && <span className={s.hint}>{hint}</span>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          upload(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
