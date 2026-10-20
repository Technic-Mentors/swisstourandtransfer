import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { publicApi } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import useWhatsApp from '../../hooks/useWhatsApp';
import { useSite } from '../../context/SiteContext';
import Seo from '../../components/seo/Seo';
import { breadcrumbSchema, vehicleSchema } from '../../components/seo/schemas';
import { Breadcrumbs } from '../../components/layout/PublicLayout';
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
  const hasLocalVehicleImage = /^\/(?:2027-mercedes|Mercedes-Benz|Range Rover)/i.test(preferredImage);
  const fallbackPhoto = { file_path: preferredImage, alt_text: vehicle.name };
  const uploadedPhotos = (vehicle.photos || []).filter(
    (photo) => !/placeholder-car\.jpg(?:$|[?#])/i.test(String(photo.file_path || '')),
  );
  const photos = hasLocalVehicleImage
    ? [fallbackPhoto]
    : uploadedPhotos.length ? uploadedPhotos : [fallbackPhoto];
  const price = priceLabel(vehicle);
  const message = buildMessage({ vehicle });

  const trail = [
    { name: 'Vehicles', path: '/vehicles' },
    ...(vehicle.category_name
      ? [{ name: vehicle.category_name, path: `/vehicles/category/${vehicle.category_slug}` }]
      : []),
    { name: vehicle.name },
  ];

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

      <Section tight>
        <Container>
          <Breadcrumbs trail={trail} />

          <div className={s.detailTop}>
            <div className={s.detailMedia}>
              <VehicleGallery photos={photos} name={vehicle.name} />

              <div className={s.detailAbout}>
                <h2 className={s.blockHeading}>About this vehicle</h2>
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
            </div>

            <div className={s.detailPanel}>
              {vehicle.category_name && <span className={s.detailCategory}>{vehicle.category_name}</span>}
              <h1 className={s.detailTitle}>{vehicle.name}</h1>
              {vehicle.tagline && <p className={s.detailTagline}>{vehicle.tagline}</p>}

              <div className={s.capacityRow}>
                <div className={s.capacityCell}>
                  <span className={s.capacityValue}>{vehicle.passengers}</span>
                  <span className={s.capacityLabel}>Passengers</span>
                </div>
                <div className={s.capacityCell}>
                  <span className={s.capacityValue}>{vehicle.suitcases}</span>
                  <span className={s.capacityLabel}>Suitcases</span>
                </div>
                <div className={s.capacityCell}>
                  <span className={s.capacityValue}>{vehicle.hand_bags}</span>
                  <span className={s.capacityLabel}>Hand bags</span>
                </div>
              </div>

              {/* Price and the booking button share a row so both stay above the fold. */}
              <div className={s.priceRow}>
                <div className={s.priceBox}>
                  {vehicle.price_from ? <span className={s.priceLabel}>From</span> : null}
                  <div className={s.priceValue}>{price.value}</div>
                  <div className={s.priceNote}>{price.note}</div>
                </div>

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
            </div>
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
