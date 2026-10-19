import { useCallback, useState } from 'react';
import { uploadUrl } from '../../config';
import { publicApi } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import { useSite } from '../../context/SiteContext';
import Seo from '../../components/seo/Seo';
import { breadcrumbSchema, localBusiness } from '../../components/seo/schemas';
import { PageHead } from '../../components/layout/PublicLayout';
import { Alert, Container, EmptyState, Lightbox, Section, Spinner, cx } from '../../components/ui';
import vs from '../../components/vehicles/vehicles.module.css';
import s from './pages.module.css';

/**
 * Gallery. The filter chips are the gallery albums from the database -
 * add an album in the admin panel and a new chip appears here.
 */
export default function Gallery() {
  const { settings } = useSite();
  const [album, setAlbum] = useState('all');
  const [lightbox, setLightbox] = useState(-1);

  const load = useCallback(
    () => Promise.all([publicApi.albums(), publicApi.photos({ album: album === 'all' ? '' : album })]),
    [album],
  );
  const { data, loading, error } = useFetch(load, [album]);

  const albums = data?.[0]?.albums ?? [];
  const photos = data?.[1]?.photos ?? [];

  const items = photos.map((photo) => ({
    src: uploadUrl(photo.file_path),
    alt: photo.alt_text || photo.caption || 'Swiss Tour & Transfer',
    caption: photo.caption || '',
  }));

  return (
    <>
      <Seo
        title="Gallery — Our Vehicles, Chauffeurs and Swiss Routes"
        description="Photos of our chauffeur-driven vehicles, their interiors, airport pickups, weddings and alpine journeys across Switzerland."
        path="/gallery"
        jsonLd={[localBusiness(settings), breadcrumbSchema([{ name: 'Gallery', path: '/gallery' }])]}
      />

      <PageHead
        trail={[{ name: 'Gallery' }]}
        eyebrow="Gallery"
        title="The vehicles, the roads, the moments"
        text="A look at the cars, the interiors and the places our chauffeurs take guests every week."
      />

      <Section>
        <Container>
          {albums.length > 0 && (
            <div className={s.galleryFilters}>
              <button
                type="button"
                className={cx(vs.pill, album === 'all' && vs.pillActive)}
                onClick={() => setAlbum('all')}
              >
                All
              </button>
              {albums.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cx(vs.pill, album === item.slug && vs.pillActive)}
                  onClick={() => setAlbum(item.slug)}
                >
                  {item.name}
                  {item.photo_count > 0 && ` (${item.photo_count})`}
                </button>
              ))}
            </div>
          )}

          {loading && <Spinner label="Loading photos" />}
          {error && <Alert tone="error">{error.message}</Alert>}

          {!loading && !error && (
            photos.length ? (
              <div className={s.masonry}>
                {photos.map((photo, i) => (
                  <button
                    type="button"
                    key={photo.id}
                    className={s.masonryTile}
                    onClick={() => setLightbox(i)}
                    aria-label={photo.caption || `Open photo ${i + 1}`}
                  >
                    <img
                      src={uploadUrl(photo.file_path)}
                      alt={photo.alt_text || photo.caption || ''}
                      loading="lazy"
                      width="560"
                      height="420"
                    />
                    {photo.caption && <span className={s.masonryCaption}>{photo.caption}</span>}
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState title="No photos here yet">
               Check back soon.
              </EmptyState>
            )
          )}

          {lightbox >= 0 && (
            <Lightbox
              items={items}
              index={lightbox}
              onIndexChange={setLightbox}
              onClose={() => setLightbox(-1)}
            />
          )}
        </Container>
      </Section>
    </>
  );
}
