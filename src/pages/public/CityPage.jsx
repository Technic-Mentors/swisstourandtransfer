import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { publicApi } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import { useSite } from '../../context/SiteContext';
import Seo from '../../components/seo/Seo';
import { breadcrumbSchema, citySchema } from '../../components/seo/schemas';
import { PageHead } from '../../components/layout/PublicLayout';
import { Alert, Card, Container, Section, SectionHeading, Spinner } from '../../components/ui';
import WhatsAppButton from '../../components/ui/WhatsAppButton';
import { VehicleGrid } from '../../components/vehicles';
import vehicleStyles from '../../components/vehicles/vehicles.module.css';
import NotFound from './NotFound';
import s from './pages.module.css';

/**
 * City landing page - the main SEO surface for queries like
 * "chauffeur service Zurich" and "airport transfer Geneva".
 */
export default function CityPage() {
  const { slug } = useParams();
  const { settings } = useSite();

  const load = useCallback(() => publicApi.city(slug), [slug]);
  const { data, loading, error } = useFetch(load, [slug]);

  if (loading) return <Spinner label="Loading city" />;
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

  const { city, vehicles, services, otherCities } = data;

  return (
    <>
      <Seo
        title={`Chauffeur Service ${city.name} — Private Airport Transfers`}
        description={
          city.intro ||
          `Private chauffeur and airport transfer service in ${city.name}, Switzerland. Fixed prices, flight tracking, professional chauffeurs and 24/7 WhatsApp booking.`
        }
        path={`/chauffeur-service/${city.slug}`}
        image={city.image}
        jsonLd={[
          citySchema(city, settings),
          breadcrumbSchema([
            { name: 'Vehicles', path: '/vehicles' },
            { name: city.name, path: `/chauffeur-service/${city.slug}` },
          ]),
        ]}
      />

      <PageHead
        trail={[{ name: city.name }]}
        eyebrow={city.hub_label || 'City'}
        title={`Chauffeur service in ${city.name}`}
        text={city.intro}
      />

      <Section>
        <Container>
          <div className={s.split}>
            <div>
              <div className={s.prose}>
                {(city.description || '').split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {services?.length > 0 && (
                <>
                  <h2 className={s.blockHeading} style={{ marginTop: 48 }}>
                    Services in {city.name}
                  </h2>
                  <div className={s.chipRow}>
                    {services.map((service) => (
                      <Link key={service.id} to={`/services/${service.slug}`} className={`${s.chip} ${s.chipLink}`}>
                        {service.name}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className={s.sticky}>
              <Card pad>
                <h2 className={s.blockHeading}>Book in {city.name}</h2>
                <p style={{ fontSize: 14.5, marginBottom: 20 }}>
                  Tell us your pickup point and time. We confirm the vehicle, the chauffeur and a
                  fixed price, usually within {settings.reply_time_minutes || '10'} minutes.
                </p>
                <WhatsAppButton city={city.name} pageType="city" full>
                  Book via WhatsApp
                </WhatsAppButton>
              </Card>

              {otherCities?.length > 0 && (
                <Card pad style={{ marginTop: 20 }}>
                  <h2 className={s.blockHeading}>Other cities</h2>
                  <div className={s.chipRow}>
                    {otherCities.map((other) => (
                      <Link
                        key={other.slug}
                        to={`/chauffeur-service/${other.slug}`}
                        className={`${s.chip} ${s.chipLink}`}
                      >
                        {other.name}
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
            <SectionHeading
              eyebrow="Available vehicles"
              title={`Vehicles available in ${city.name}`}
              text="Every vehicle below can be booked for pickups in this city."
            />
            <VehicleGrid vehicles={vehicles} pageType="city-vehicles" className={vehicleStyles.pageGrid} />
          </Container>
        </Section>
      )}
    </>
  );
}
