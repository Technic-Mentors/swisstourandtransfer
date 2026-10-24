import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { publicApi } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import useWhatsApp from '../../hooks/useWhatsApp';
import { useSite } from '../../context/SiteContext';
import Seo from '../../components/seo/Seo';
import { breadcrumbSchema, vehicleSchema } from '../../components/seo/schemas';
import { PageHead } from '../../components/layout/PublicLayout';
import { Alert, Button, Container, Section, SectionHeading, Spinner } from '../../components/ui';
import WhatsAppButton from '../../components/ui/WhatsAppButton';
import { SpecTable, VehicleGallery, VehicleGrid, priceLabel } from '../../components/vehicles';
import vehicleStyles from '../../components/vehicles/vehicles.module.css';
import EnquiryForm from '../../components/forms/EnquiryForm';
import NotFound from './NotFound';
import s from './pages.module.css';
import { vehicleImage } from '../../config';

const SpecIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path d="M4 7h10M4 12h16M4 17h7" strokeLinecap="round" />
    <circle cx="18" cy="7" r="2" />
    <circle cx="14" cy="17" r="2" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PassengerIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="7" r="3" /><path d="M5 21v-2a7 7 0 0 1 14 0v2M8 13l-2 2m10-2 2 2" strokeLinecap="round" /></svg>;
const SuitcaseIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="4" y="7" width="16" height="14" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M8 11v6m8-6v6" strokeLinecap="round" /></svg>;
const HandBagIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 9h16l-1 12H5L4 9Z" strokeLinejoin="round" /><path d="M9 9V6a3 3 0 0 1 6 0v3" strokeLinecap="round" /></svg>;

export default function VehicleDetail() {
  const { slug } = useParams();
  const { settings } = useSite();
  const { buildMessage } = useWhatsApp();

  const load = useCallback(() => publicApi.vehicle(slug), [slug]);
  const { data, loading, error } = useFetch(load, [slug]);

  if (loading) return <Spinner label="Loading vehicle" />;
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

  const { vehicle, similar } = data;
  const preferredImage = vehicleImage(vehicle);
  const hasLocalVehicleImage = /^\/(?:2027-mercedes|Mercedes-Benz|Range Rover|placeholder-car)/i.test(preferredImage);
  const fallbackPhoto = { file_path: preferredImage, alt_text: vehicle.name };
  const uploadedPhotos = (vehicle.photos || []).filter(
    (photo) => !/placeholder-car\.jpg(?:$|[?#])/i.test(String(photo.file_path || '')),
  );
  const photos = hasLocalVehicleImage
    ? [fallbackPhoto]
    : uploadedPhotos.length ? uploadedPhotos : [fallbackPhoto];
  const price = priceLabel(vehicle);
  const message = buildMessage({ vehicle });

  const description =
    vehicle.tagline ||
    `Hire the ${vehicle.name} with a professional chauffeur in Switzerland. Seats ${vehicle.passengers}, ${vehicle.suitcases} suitcases. Fixed prices and 24/7 WhatsApp booking.`;

  return (
    <>
      <Seo
        title={`${vehicle.name} with Chauffeur`}
        description={description}
        path={`/vehicles/${vehicle.slug}`}
        image={photos[0]?.file_path || vehicleImage(vehicle)}
        type="product"
        jsonLd={[
          vehicleSchema(vehicle, settings),
          breadcrumbSchema([
            { name: 'Vehicles', path: '/vehicles' },
            { name: vehicle.name, path: `/vehicles/${vehicle.slug}` },
          ]),
        ]}
      />

      <PageHead
        trail={[{ name: 'Vehicles', path: '/vehicles' }, { name: vehicle.name }]}
        eyebrow="Chauffeur vehicle"
        title={vehicle.name}
        text={vehicle.tagline || description}
      />

      <Section tight className={s.vehicleDetailSection}>
        <Container>
          <div className={s.serviceDetailLayout}>
            <main className={`${s.detailMedia} ${s.serviceDetailMain}`}>
              <VehicleGallery photos={photos} name={vehicle.name} />

              <div className={s.detailAbout}>
                <span className={s.vehicleAboutEyebrow}>About this vehicle</span>
                <h2 className={s.vehicleAboutTitle}>{vehicle.tagline || 'Comfort, privacy and confidence.'}</h2>
                <div className={s.prose}>
                  {(vehicle.description || '').split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {vehicle.ideal_for?.length > 0 && (
                  <>
                    <h2 className={s.blockHeading} style={{ marginTop: 20 }}>
                      Ideal for
                    </h2>
                    <div className={s.includedList}>
                      {vehicle.ideal_for.map((item) => (
                        <span className={s.includedItem} key={item}>
                          <CheckIcon />
                          {item}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {vehicle.cities?.length > 0 && (
                  <>
                    <h2 className={s.blockHeading} style={{ marginTop: 20 }}>
                      Available in
                    </h2>
                    <div className={s.chipRow}>
                      {vehicle.cities.map((city) => (
                        <Link
                          key={city.id}
                          to={`/chauffeur-service/${city.slug}`}
                          className={`${s.chip} ${s.chipLink}`}
                        >
                          {city.name}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </main>

            <aside className={`${s.detailPanel} ${s.vehicleBookingPanel} ${s.sticky}`}>
              <span className={s.serviceDetailEyebrow}>Book this vehicle</span>
              <h1 className={s.vehicleBookingTitle}>{vehicle.name}</h1>
              <p className={s.vehicleBookingPrice}>{price.value}</p>
              <p className={s.vehicleBookingNote}>{price.note}</p>

              <div className={s.capacityRow}>
                <div className={s.capacityCell}>
                  <span className={s.capacityValue}>{vehicle.passengers}</span>
                  <span className={s.capacityLabel}><PassengerIcon />Passengers</span>
                </div>
                <div className={s.capacityCell}>
                  <span className={s.capacityValue}>{vehicle.suitcases}</span>
                  <span className={s.capacityLabel}><SuitcaseIcon />Suitcases</span>
                </div>
                <div className={s.capacityCell}>
                  <span className={s.capacityValue}>{vehicle.hand_bags}</span>
                  <span className={s.capacityLabel}><HandBagIcon />Hand bags</span>
                </div>
              </div>

              <div className={s.vehicleBookingActions}>
                <div className={s.detailActions}>
                  <WhatsAppButton vehicle={vehicle} pageType="vehicle" full>
                    Book via WhatsApp
                  </WhatsAppButton>
                  <div className={s.detailActionsRow}>
                    {settings.phone && (
                      <Button variant="outline" size="sm" href={`tel:${settings.phone.replace(/\s/g, '')}`}>
                        Call us
                      </Button>
                    )}
                    <Button variant="outline" size="sm" href="#enquiry">
                      Enquiry form
                    </Button>
                  </div>
                </div>
              </div>

              {vehicle.specs?.length > 0 && (
                <div className={s.specPanel}>
                  <h2 className={s.specPanelTitle}>
                    <SpecIcon />
                    Specifications
                  </h2>
                  <SpecTable specs={vehicle.specs} />
                </div>
              )}

              {/* Tucked away by default: useful to check, not worth the space. */}
              <details className={s.messagePreview}>
                <summary className={s.messagePreviewLabel}>Message preview</summary>
                <div className={s.messagePreviewText}>{message}</div>
              </details>
            </aside>
          </div>
        </Container>
      </Section>

      {/* --------------------------------------------------------- similar */}
      {similar.length > 0 && (
        <Section alt>
          <Container>
            <SectionHeading eyebrow="You may also like" title="Similar vehicles" />
            <VehicleGrid vehicles={similar} pageType="vehicle-similar" className={vehicleStyles.pageGrid} />
          </Container>
        </Section>
      )}

      {/* ---------------------------------------------------------- enquiry */}
      <Section id="enquiry">
        <Container>
          {/* Side by side: the reasons to write on the left, the fields on the
              right, so the block reads across the page instead of down it. */}
          <div className={s.enquiryLayout}>
            <aside className={s.enquiryIntro}>
              <span className={s.enquiryEyebrow}>Enquire</span>
              <h2 className={s.enquiryTitle}>Prefer a form?</h2>
              <p className={s.enquiryText}>
                WhatsApp is fastest, but you can send your details here instead. We reply within
                about {settings.reply_time_minutes || '10'} minutes.
              </p>

              <ul className={s.enquiryPoints}>
                <li>
                  <CheckIcon />
                  A fixed, all-inclusive quote — no surge pricing
                </li>
                <li>
                  <CheckIcon />
                  Written confirmation with your chauffeur's name
                </li>
                <li>
                  <CheckIcon />
                  Free cancellation up to 24 hours before pickup
                </li>
              </ul>

              <div className={s.enquiryAside}>
                <span className={s.enquiryAsideLabel}>Rather talk?</span>
                <div className={s.enquiryAsideRow}>
                  <WhatsAppButton vehicle={vehicle} pageType="vehicle-enquiry" size="sm">
                    WhatsApp
                  </WhatsAppButton>
                  {settings.phone && (
                    <Button variant="outline" size="sm" href={`tel:${settings.phone.replace(/\s/g, '')}`}>
                      {settings.phone}
                    </Button>
                  )}
                </div>
              </div>
            </aside>

            <div className={s.enquiryFormCard}>
              <EnquiryForm defaultVehicleId={vehicle.id} vehicles={[vehicle, ...similar]} compact />
            </div>
          </div>
        </Container>
      </Section>

    </>
  );
}
