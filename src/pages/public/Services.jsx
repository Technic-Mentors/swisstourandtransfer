import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { imageFallback, imageUrl } from '../../config';
import { publicApi } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import { useSite } from '../../context/SiteContext';
import Seo from '../../components/seo/Seo';
import { breadcrumbSchema, localBusiness } from '../../components/seo/schemas';
import { PageHead } from '../../components/layout/PublicLayout';
import { Alert, Button, Card, Container, EmptyState, Section, Spinner } from '../../components/ui';
import s from './pages.module.css';

export default function Services() {
  const { settings } = useSite();

  const load = useCallback(() => publicApi.services(), []);
  const { data, loading, error } = useFetch(load, []);
  const services = data?.services ?? [];

  return (
    <>
      <Seo
        title="Chauffeur Services in Switzerland — Airport, Business, Events & Ski"
        description="Airport transfers, hourly chauffeur hire, city-to-city travel, business travel, events, weddings and alpine ski transfers across Switzerland. Fixed prices, available 24/7."
        path="/services"
        jsonLd={[localBusiness(settings), breadcrumbSchema([{ name: 'Services', path: '/services' }])]}
      />

      <PageHead
        trail={[{ name: 'Services' }]}
        eyebrow="Services"
        title="Wherever you need to be"
        text="From a 05:00 airport run to a week of meetings or a convoy for WEF Davos — the same chauffeurs, the same standard, a fixed price every time."
      />

      <Section>
        <Container>
          {loading && <Spinner label="Loading services" />}
          {error && <Alert tone="error">{error.message}</Alert>}

          {!loading && !error && (
            services.length ? (
              <div className={s.cardGrid2}>
                {services.map((service) => (
                  <Card hover key={service.id} className={s.serviceTile}>
                    <Link to={`/services/${service.slug}`} className={s.serviceTileMedia}>
                      <img
                        src={imageUrl(service.image)}
                        onError={imageFallback}
                        alt={service.name}
                        loading="lazy"
                        width="600"
                        height="338"
                      />
                    </Link>

                    <div className={s.serviceTileBody}>
                      <h2 className={s.serviceTileTitle}>
                        <Link to={`/services/${service.slug}`}>{service.name}</Link>
                      </h2>
                      <p className={s.serviceTileText}>{service.short_description}</p>
                      {service.price_text && (
                        <p style={{ fontSize: 12, color: 'var(--gold)' }}>{service.price_text}</p>
                      )}
                      <div className={s.serviceTileFoot}>
                        <Button to={`/services/${service.slug}`} variant="outline" size="sm">
                          Read more
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState title="No services published yet" />
            )
          )}
        </Container>
      </Section>
    </>
  );
}
