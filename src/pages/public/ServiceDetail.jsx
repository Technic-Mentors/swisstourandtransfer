import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { galleryImage, imageFallback, imageUrl, serviceImage } from '../../config';
import { publicApi } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import { useSite } from '../../context/SiteContext';
import Seo from '../../components/seo/Seo';
import { breadcrumbSchema, serviceSchema } from '../../components/seo/schemas';
import { PageHead } from '../../components/layout/PublicLayout';
import { Alert, Button, Container, Lightbox, Section, SectionHeading, Spinner } from '../../components/ui';
import WhatsAppButton from '../../components/ui/WhatsAppButton';
import { VehicleGrid } from '../../components/vehicles';
import vehicleStyles from '../../components/vehicles/vehicles.module.css';
import NotFound from './NotFound';
import hs from '../../components/home/home.module.css';
import s from './pages.module.css';

const CheckIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const ServiceMetaIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg>;

export default function ServiceDetail() {
  const { slug } = useParams();
  const { settings } = useSite();
  const load = useCallback(() => publicApi.service(slug), [slug]);
  const { data, loading, error } = useFetch(load, [slug]);
  const [lightbox, setLightbox] = useState(-1);
  const [servicePhoto, setServicePhoto] = useState(-1);

  if (loading) return <Spinner label="Loading service" />;
  if (error?.status === 404) return <NotFound />;
  if (error) return <Container><div style={{ padding: '80px 0' }}><Alert tone="error">{error.message}</Alert></div></Container>;

  const { service, otherServices, vehicles, photos = [] } = data;
  const servicePhotos = service.photos?.length ? service.photos : [{ id: 'placeholder', file_path: '', alt_text: service.name }];
  const gallerySlots = Array.from({ length: Math.max(5, servicePhotos.length) }, (_, i) => servicePhotos[i % servicePhotos.length]);
  const servicePhotoItems = servicePhotos.map((photo, i) => ({ src: imageUrl(photo.file_path || serviceImage(service, i)), alt: photo.alt_text || service.name, caption: '' }));
  const lightboxItems = photos.map((photo, i) => ({ src: imageUrl(galleryImage(photo, i)), alt: photo.alt_text || photo.caption || service.name, caption: photo.caption || '' }));

  return <>
    <Seo title={`${service.name} in Switzerland`} description={service.short_description || `${service.name} with a professional chauffeur across Switzerland. Fixed prices, 24/7 availability and WhatsApp booking.`} path={`/services/${service.slug}`} image={serviceImage(service)} jsonLd={[serviceSchema(service, settings), breadcrumbSchema([{ name: 'Services', path: '/services' }, { name: service.name, path: `/services/${service.slug}` }])]} />

    <PageHead trail={[{ name: 'Services', path: '/services' }, { name: service.name }]} eyebrow="Private chauffeur service" title={service.name} text={service.short_description} />

    <Section tight className={s.serviceDetailSection}>
      <Container>
        <div className={s.serviceDetailLayout}>
          <main className={s.serviceDetailMain}>
            <div className={s.serviceShots}>
              <button type="button" className={s.serviceShotMain} onClick={() => setServicePhoto(0)} aria-label={`View photos of ${service.name}`}><img src={imageUrl(servicePhotos[0].file_path || serviceImage(service))} onError={imageFallback} alt={servicePhotos[0].alt_text || service.name} width="860" height="480" /></button>
              <div className={s.serviceShotRow}>{gallerySlots.slice(1, 5).map((photo, i) => <button type="button" key={`${photo.id}-${i}`} className={s.serviceShot} onClick={() => setServicePhoto(i % servicePhotos.length)} aria-label={`View photo ${i + 2} of ${service.name}`}><img src={imageUrl(photo.file_path || serviceImage(service, i + 1))} onError={imageFallback} alt={photo.alt_text || service.name} loading="lazy" width="200" height="140" /></button>)}</div>
            </div>
            {servicePhoto >= 0 && <Lightbox items={servicePhotoItems} index={servicePhoto} onIndexChange={setServicePhoto} onClose={() => setServicePhoto(-1)} />}

            <div className={s.prose}>{(service.full_description || '').split('\n\n').filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}</div>
            {service.included?.length > 0 && <div className={s.serviceIncluded}><h2 className={s.blockHeading}>What is included</h2><div className={s.includedList}>{service.included.map((item) => <span className={s.includedItem} key={item}><CheckIcon />{item}</span>)}</div></div>}
          </main>

          <aside className={s.sticky}>
            <div className={s.serviceBookingCard}>
              <span className={s.serviceDetailEyebrow}>Book this service</span>
              <h2 className={s.serviceBookingTitle}>{service.price_text || 'Request a fixed quote'}</h2>
              <div className={s.serviceBookingMeta}><ServiceMetaIcon /><span>Fast response, 24/7 availability</span></div>
              <p className={s.serviceBookingText}>Send one message with your pickup, destination and date. We reply with a fixed, all-inclusive price — usually within {settings.reply_time_minutes || '10'} minutes.</p>
              <div className={s.serviceBookingActions}><WhatsAppButton service={service.name} pageType="service" full>Book via WhatsApp</WhatsAppButton><Button to="/book" variant="outline" full>Send an enquiry</Button></div>
            </div>
            {otherServices?.length > 0 && <div className={s.otherServicesCard}><span className={s.serviceDetailEyebrow}>Other services</span><div className={s.otherServicesList}>{otherServices.slice(0, 4).map((other, i) => <Link key={other.id} to={`/services/${other.slug}`} className={s.otherServiceLink}><img src={imageUrl(serviceImage(other, i))} onError={imageFallback} alt="" /><span>{other.name}</span><b aria-hidden="true">→</b></Link>)}</div></div>}
          </aside>
        </div>
      </Container>
    </Section>

    {vehicles?.length > 0 && <Section alt><Container><SectionHeading eyebrow="Vehicles" title="Cars we use for this service" /><VehicleGrid vehicles={vehicles} pageType="service-vehicles" className={vehicleStyles.pageGrid} /></Container></Section>}
    {photos.length > 0 && <Section><Container><SectionHeading eyebrow="Gallery" title="From our journeys" text="A look at the cars, the chauffeurs and the places we drive to every week." /><div className={hs.galleryGrid}>{photos.slice(0, 6).map((photo, i) => <button type="button" key={photo.id} className={`${hs.galleryTile} ${i === 0 || i === 5 ? hs.galleryTileWide : ''}`} onClick={() => setLightbox(i)} aria-label={photo.caption || `Open photo ${i + 1}`}><img src={imageUrl(galleryImage(photo, i))} onError={imageFallback} alt={photo.alt_text || photo.caption || ''} loading="lazy" width="500" height="320" /></button>)}</div>{lightbox >= 0 && <Lightbox items={lightboxItems} index={lightbox} onIndexChange={setLightbox} onClose={() => setLightbox(-1)} />}</Container></Section>}
  </>;
}
