import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageUploader } from './widgets';
import s from './admin.module.css';

/**
 * The photo set for one record: upload several at once, drag to reorder, pick
 * the cover. Vehicles, services and categories all behave the same way, so the
 * four API calls are passed in rather than duplicated per screen.
 *
 * A record that has not been saved yet has no id to attach photos to, so the
 * field explains that instead of showing a dead uploader.
 */
export default function PhotosField({
  id,
  isNew,
  load,
  upload,
  remove,
  reorder,
  setCover,
  toast,
  emptyHint = 'Save this first, then add photos here.',
  hint = 'Drag to reorder. The first photo is the cover shown on cards and listings.',
}) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  // useToast() returns a new object each render, so it must not be a dependency
  // of the loader - that would reload on every render, forever.
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const reload = useCallback(async () => {
    if (isNew) return;
    try {
      setPhotos(await load(id));
    } catch (err) {
      toastRef.current.error(err.message);
    }
  }, [id, isNew, load]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function onUpload(files) {
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((file) => fd.append('images', file));
      await upload(id, fd);
      await reload();
      toast.success(`Uploaded ${files.length} photo(s).`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(photo) {
    try {
      await remove(id, photo.id);
      await reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function onSetCover(photo) {
    // Optimistic: the cover badge should move the moment it is clicked.
    setPhotos((prev) => prev.map((p) => ({ ...p, is_cover: p.id === photo.id ? 1 : 0 })));
    try {
      await setCover(id, photo.id);
    } catch (err) {
      toast.error(err.message);
      reload();
    }
  }

  async function onReorder(next) {
    setPhotos(next);
    try {
      await reorder(id, next.map((p) => p.id));
    } catch (err) {
      toast.error(err.message);
      reload();
    }
  }

  if (isNew) return <div className={s.dropZone}>{emptyHint}</div>;

  return (
    <>
      <p className={s.hint} style={{ marginBottom: 12 }}>
        {hint}
      </p>
      <ImageUploader
        photos={photos}
        uploading={uploading}
        onUpload={onUpload}
        onDelete={onDelete}
        onSetCover={onSetCover}
        onReorder={onReorder}
      />
    </>
  );
}
