import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { uploadUrl } from '../../config';
import { publicApi } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import { useSite } from '../../context/SiteContext';
import Seo from '../../components/seo/Seo';
import { breadcrumbSchema, serviceSchema } from '../../components/seo/schemas';
import { PageHead } from '../../components/layout/PublicLayout';
import { Alert, Button, Card, Container, Lightbox, Section, SectionHeading, Spinner } from '../../components/ui';
import WhatsAppButton from '../../components/ui/WhatsAppButton';
import { VehicleGrid } from '../../components/vehicles';
import vehicleStyles from '../../components/vehicles/vehicles.module.css';
import NotFound from './NotFound';
import hs from '../../components/home/home.module.css';
import s from './pages.module.css';

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function ServiceDetail() {
  const { slug } = useParams();
  const { settings } = useSite();

  const load = useCallback(() => publicApi.service(slug), [slug]);
  const { data, loading, error } = useFetch(load, [slug]);
  const [lightbox, setLightbox] = useState(-1);
  const [servicePhoto, setServicePhoto] = useState(-1);

  if (loading) return <Spinner label="Loading service" />;
  if (error?.status === 404) return <NotFound />;
  if (error) {
    return (
      <Container>
        <div style={{ padding: '80px 0' }}>
          <Alert tone="error">{error.message}</Alert>
        </div>
      </Container>
    );
  }

  const { service, otherServices, vehicles, photos = [] } = data;

  const lightboxItems = photos.map((photo) => ({
    src: uploadUrl(photo.file_path),
    alt: photo.alt_text || photo.caption || service.name,
    caption: photo.caption || '',
  }));

  // The service's own photos: cover first, the rest as a strip beneath it.
  const servicePhotos = service.photos || [];
  const servicePhotoItems = servicePhotos.map((photo) => ({
    src: uploadUrl(photo.file_path),
    alt: photo.alt_text || service.name,
    caption: '',
  }));

  return (
    <>
      <Seo
        title={`${service.name} in Switzerland`}
        description={
          service.short_description ||
          `${service.name} with a professional chauffeur across Switzerland. Fixed prices, 24/7 availability and WhatsApp booking.`
        }
        path={`/services/${service.slug}`}
        image={service.image}
        jsonLd={[
          serviceSchema(service, settings),
          breadcrumbSchema([
            { name: 'Services', path: '/services' },
            { name: service.name, path: `/services/${service.slug}` },
          ]),
        ]}
      />

      <PageHead
        trail={[{ name: 'Services', path: '/services' }, { name: service.name }]}
        eyebrow="Service"
        title={service.name}
        text={service.short_description}
      />

      <Section>
        <Container>
          <div className={s.split}>
            <div>
              {servicePhotos.length > 0 && (
                <div className={s.serviceShots}>
                  <button
                    type="button"
                    className={s.serviceShotMain}
                    onClick={() => setServicePhoto(0)}
                    aria-label={`View photos of ${service.name}`}
                  >
                    <img
                      src={uploadUrl(servicePhotos[0].file_path)}
                      alt={servicePhotos[0].alt_text || service.name}
                      width="860"
                      height="480"
                    />
                  </button>

                  {servicePhotos.length > 1 && (
                    <div className={s.serviceShotRow}>
                      {servicePhotos.slice(1).map((photo, i) => (
                        <button
                          type="button"
                          key={photo.id}
                          className={s.serviceShot}
                          onClick={() => setServicePhoto(i + 1)}
                          aria-label={`View photo ${i + 2} of ${service.name}`}
                        >
                          <img
                            src={uploadUrl(photo.file_path)}
                            alt={photo.alt_text || service.name}
                            loading="lazy"
                            width="200"
                            height="140"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Mounted only while open: Lightbox reads items[index] directly,
                  so an index of -1 would crash the page. */}
              {servicePhoto >= 0 && servicePhotoItems.length > 0 && (
                <Lightbox
                  items={servicePhotoItems}
                  index={servicePhoto}
                  onIndexChange={setServicePhoto}
                  onClose={() => setServicePhoto(-1)}
                />
              )}

              <div className={s.prose}>
                {(service.full_description || '').split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {service.included?.length > 0 && (
                <>
                  <h2 className={s.blockHeading} style={{ marginTop: 48 }}>
                    What is included
                  </h2>
                  <div className={s.includedList}>
                    {service.included.map((item) => (
                      <span className={s.includedItem} key={item}>
                        <CheckIcon />
                        {item}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className={s.sticky}>
              <Card pad>
                <h2 className={s.blockHeading}>Book this service</h2>
                {service.price_text && (
                  <p style={{ color: 'var(--gold)', marginBottom: 18, fontSize: 15 }}>
                    {service.price_text}
                  </p>
                )}
                <p style={{ fontSize: 14.5, marginBottom: 22 }}>
                  Send one message with your pickup, destination and date. We reply with a fixed,
                  all-inclusive price — usually within {settings.reply_time_minutes || '10'} minutes.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <WhatsAppButton service={service.name} pageType="service" full>
                    Book via WhatsApp
                  </WhatsAppButton>
                  <Button to="/book" variant="outline" full>
                    Send an enquiry
                  </Button>
                </div>
              </Card>

              {otherServices?.length > 0 && (
                <Card pad style={{ marginTop: 20 }}>
                  <h2 className={s.blockHeading}>Other services</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {otherServices.map((other) => (
                      <Link key={other.id} to={`/services/${other.slug}`} style={{ fontSize: 15 }}>
                        {other.name} →
                      </Link>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {vehicles?.length > 0 && (
        <Section alt>
          <Container>
            <SectionHeading eyebrow="Vehicles" title="Cars we use for this service" />
            <VehicleGrid vehicles={vehicles} pageType="service-vehicles" className={vehicleStyles.pageGrid} />
          </Container>
        </Section>
      )}

      {photos.length > 0 && (
        <Section>
          <Container>
            <SectionHeading
              eyebrow="Gallery"
              title="From our journeys"
              text="A look at the cars, the chauffeurs and the places we drive to every week."
            />

            <div className={hs.galleryGrid}>
              {photos.slice(0, 6).map((photo, i) => (
                <button
                  type="button"
                  key={photo.id}
                  className={`${hs.galleryTile} ${i === 0 || i === 5 ? hs.galleryTileWide : ''}`}
                  onClick={() => setLightbox(i)}
                  aria-label={photo.caption || `Open photo ${i + 1}`}
                >
                  <img
                    src={uploadUrl(photo.file_path)}
                    alt={photo.alt_text || photo.caption || ''}
                    loading="lazy"
                    width="500"
                    height="320"
                  />
                </button>
              ))}
            </div>

            <div style={{ marginTop: 36, textAlign: 'center' }}>
              <Button to="/gallery" variant="outline">
                View the full gallery
              </Button>
            </div>

            {lightbox >= 0 && (
              <Lightbox
                items={lightboxItems}
                index={lightbox}
                onIndexChange={setLightbox}
                onClose={() => setLightbox(-1)}
              />
            )}
          </Container>
        </Section>
      )}
    </>
  );
}
