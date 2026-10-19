import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadUrl } from '../../config';
import { admin } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import Seo from '../../components/seo/Seo';
import { AdminPageHead } from '../../components/admin/AdminLayout';
import {
  AdminButton,
  AdminField,
  AdminSelect,
  Alert,
  Card,
  CardHead,
  ConfirmDialog,
  DateRangeFilter,
  FilterBar,
  ImageUploader,
  Pagination,
  SortableList,
  StatusBadge,
  Tabs,
  Toast,
} from '../../components/admin/widgets';
import { Spinner } from '../../components/ui';
import s from '../../components/admin/admin.module.css';

/**
 * Gallery albums double as the categories shown on the public gallery page,
 * so every upload has to be filed into one of the existing albums.
 */
export default function Gallery() {
  const toast = useToast();
  const navigate = useNavigate();
  const [albumFilter, setAlbumFilter] = useState('all');
  const [uploadAlbum, setUploadAlbum] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [range, setRange] = useState({ from: '', to: '' });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(24);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(
    () =>
      Promise.all([
        admin.albums({ per_page: 'all' }),
        admin.photos({
          album_id: albumFilter === 'all' ? '' : albumFilter,
          date_from: range.from,
          date_to: range.to,
          page,
          per_page: perPage,
        }),
      ]),
    [albumFilter, range.from, range.to, page, perPage],
  );
  const { data, loading, error, refetch, setData } = useFetch(load, [
    albumFilter,
    range.from,
    range.to,
    page,
    perPage,
  ]);

  // Any filter change invalidates the current page number.
  const refilter = (fn) => (value) => {
    fn(value);
    setPage(1);
  };

  const albums = data?.[0]?.albums ?? [];
  const photos = data?.[1]?.photos ?? [];

  const pagination = data?.[1]?.pagination;
  const visible = photos; // filtering and paging happen on the server

  const tabs = [
    { value: 'all', label: 'All', count: photos.length },
    ...albums.map((a) => ({ value: String(a.id), label: a.name, count: Number(a.photo_count) })),
  ];

  async function upload(files) {
    const target = uploadAlbum || albums[0]?.id;
    if (!target) {
      toast.error('Create an album first — every photo belongs to one.');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((file) => fd.append('images', file));
      fd.append('album_id', String(target));
      if (caption.trim()) fd.append('caption', caption.trim());

      await admin.uploadPhotos(fd);
      setCaption('');
      refetch();
      toast.success(`Uploaded ${files.length} photo(s).`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto(photo) {
    try {
      await admin.deletePhoto(photo.id);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function reorderPhotos(next) {
    setData((prev) => [prev[0], { photos: next }]);
    try {
      await admin.reorderPhotos(next.map((p) => p.id), pagination?.start ?? 0);
    } catch (err) {
      toast.error(err.message);
      refetch();
    }
  }

  async function doDelete() {
    try {
      await admin.deleteAlbum(confirm.id);
      refetch();
      toast.success('Album deleted.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirm(null);
    }
  }

  async function reorderAlbums(next) {
    setData((prev) => [{ albums: next }, prev[1]]);
    try {
      await admin.reorderAlbums(next.map((a) => a.id), 0);
    } catch (err) {
      toast.error(err.message);
      refetch();
    }
  }

  return (
    <>
      <Seo title="Gallery · Admin" noindex bare />

      <AdminPageHead
        title="Gallery"
        subtitle="Upload photos into an album. Albums are the categories visitors filter by on the gallery page."
      >
        <AdminButton onClick={() => navigate('/admin/gallery/albums/new')}>+ New album</AdminButton>
      </AdminPageHead>

      {error && <Alert tone="error">{error.message}</Alert>}

      {loading ? (
        <Spinner label="Loading gallery" />
      ) : (
        <div className={s.galleryLayout}>
          <div className={s.galleryMain}>
            <Card style={{ marginBottom: 22 }}>
              <CardHead title="Add photos" />
              <div className={s.cardPad}>
                {albums.length === 0 ? (
                  <Alert tone="info">Create an album first — every photo has to belong to one.</Alert>
                ) : (
                  <>
                    <div className={s.grid2} style={{ marginBottom: 16 }}>
                      <AdminSelect
                        label="Album"
                        required
                        value={uploadAlbum || albums[0]?.id || ''}
                        onChange={(e) => setUploadAlbum(e.target.value)}
                        options={albums.map((a) => ({ value: a.id, label: a.name }))}
                      />
                      <AdminField
                        label="Caption (optional)"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="S-Class at Lake Zurich"
                        hint="Applied to every photo in this upload."
                      />
                    </div>

                    <ImageUploader
                      photos={[]}
                      uploading={uploading}
                      onUpload={upload}
                      onDelete={() => {}}
                      showCover={false}
                    />
                  </>
                )}
              </div>
            </Card>

            <Card>
              <CardHead title="Photos">
                <span className={s.galleryCount}>
                  {pagination?.total ?? visible.length} total
                </span>
              </CardHead>
              <div className={s.cardPad}>
                <FilterBar
                  activeCount={range.from || range.to ? 1 : 0}
                  onClear={() => refilter(setRange)({ from: '', to: '' })}
                  inline={<Tabs options={tabs} value={albumFilter} onChange={refilter(setAlbumFilter)} />}
                >
                  <DateRangeFilter label="Uploaded between" value={range} onChange={refilter(setRange)} />
                </FilterBar>

                {visible.length ? (
                  <div className={s.galleryPhotoGrid}>
                    <ImageUploader
                      photos={visible}
                      uploading={uploading}
                      onUpload={upload}
                      onDelete={removePhoto}
                      onReorder={reorderPhotos}
                      showCover={false}
                    />
                  </div>
                ) : (
                  <div className={s.empty}>No photos in this album yet.</div>
                )}

                {visible.length > 0 && (
                  <p className={s.hint} style={{ marginTop: 14 }}>
                    Drag photos to reorder. Use the list below to edit a caption or move a photo to
                    another album.
                  </p>
                )}
              </div>

              <Pagination
                pagination={pagination}
                onChange={setPage}
                perPage={perPage}
                onPerPageChange={(value) => {
                  setPerPage(value);
                  setPage(1);
                }}
              />
            </Card>

            {visible.length > 0 && (
              <Card style={{ marginTop: 22 }}>
                <CardHead title="Captions and albums" />
                <div className={s.cardPad}>
                  {visible.map((photo) => (
                    <div className={`${s.sortItem} ${s.galleryPhotoRow}`} key={photo.id}>
                      <img className={s.thumb} src={uploadUrl(photo.file_path)} alt="" loading="lazy" />
                      <div className={s.sortBody}>
                        <div className={s.sortName}>{photo.caption || 'No caption'}</div>
                        <div className={s.sortNote}>{photo.album_name}</div>
                      </div>
                      <div className={s.galleryPhotoActions}>
                        <StatusBadge on={photo.is_visible} />
                        <button
                          type="button"
                          className={s.actionLink}
                          onClick={() => navigate(`/admin/gallery/photos/${photo.id}`)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`${s.actionLink} ${s.actionDanger}`}
                          onClick={() => removePhoto(photo)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <aside className={s.gallerySidebar}>
            <Card>
              <CardHead title="Albums" />
              <div className={s.cardPad}>
                {albums.length ? (
                  <SortableList
                    items={albums}
                    onReorder={reorderAlbums}
                    renderItem={(a) => (
                      <>
                        <div className={s.sortName}>{a.name}</div>
                        <div className={s.sortNote}>
                          {a.photo_count} photo{Number(a.photo_count) === 1 ? '' : 's'}
                        </div>
                      </>
                    )}
                    right={(a) => (
                      <div className={s.galleryAlbumActions}>
                        <button
                          type="button"
                          className={s.actionLink}
                          onClick={() => navigate(`/admin/gallery/albums/${a.id}`)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`${s.actionLink} ${s.actionDanger}`}
                          onClick={() => setConfirm(a)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  />
                ) : (
                  <div className={s.empty}>No albums yet.</div>
                )}
              </div>
            </Card>
          </aside>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete this album?"
        text={`“${confirm?.name}” and all ${confirm?.photo_count ?? 0} photo(s) in it will be deleted.`}
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
