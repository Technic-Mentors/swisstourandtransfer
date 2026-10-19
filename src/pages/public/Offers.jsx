import { useCallback } from 'react';
import { uploadUrl } from '../../config';
import { publicApi } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import { useSite } from '../../context/SiteContext';
import Seo from '../../components/seo/Seo';
import { breadcrumbSchema, localBusiness } from '../../components/seo/schemas';
import { PageHead } from '../../components/layout/PublicLayout';
import { Alert, Card, Container, EmptyState, Section, Spinner } from '../../components/ui';
import WhatsAppButton from '../../components/ui/WhatsAppButton';
import hs from '../../components/home/home.module.css';
import s from './pages.module.css';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-GB') : null);

export default function Offers() {
  const { settings } = useSite();

  const load = useCallback(() => publicApi.promotions({ placement: 'offers_page' }), []);
  const { data, loading, error } = useFetch(load, []);
  const promotions = data?.promotions ?? [];

  return (
    <>
      <Seo
        title="Current Offers & Seasonal Deals"
        description="Current offers on chauffeur services and airport transfers in Switzerland, including seasonal ski transfer deals and return journey discounts."
        path="/offers"
        jsonLd={[localBusiness(settings), breadcrumbSchema([{ name: 'Offers', path: '/offers' }])]}
      />

      <PageHead
        trail={[{ name: 'Offers' }]}
        eyebrow="Offers"
        title="Current offers"
        text="Seasonal deals and standing discounts. Expired offers come off this page automatically, so everything you see here is bookable today."
      />

      <Section>
        <Container>
          {loading && <Spinner label="Loading offers" />}
          {error && <Alert tone="error">{error.message}</Alert>}

          {!loading && !error && (
            promotions.length ? (
              <div className={s.cardGrid2}>
                {promotions.map((promo) => (
                  <Card hover key={promo.id} className={s.offerCard}>
                    {promo.banner_image && (
                      <img
                        src={uploadUrl(promo.banner_image)}
                        alt={promo.title}
                        loading="lazy"
                        style={{
                          width: '100%',
                          borderRadius: 'var(--radius)',
                          aspectRatio: '16 / 9',
                          objectFit: 'cover',
                        }}
                        width="600"
                        height="338"
                      />
                    )}

                    <h2 className={s.offerCardTitle}>{promo.title}</h2>
                    <p className={s.offerCardText}>{promo.description}</p>

                    {promo.code && <span className={hs.offerCode}>Code: {promo.code}</span>}

                    {(promo.starts_at || promo.ends_at) && (
                      <p className={s.offerDates}>
                        {promo.starts_at && `From ${formatDate(promo.starts_at)}`}
                        {promo.starts_at && promo.ends_at && ' · '}
                        {promo.ends_at && `Valid until ${formatDate(promo.ends_at)}`}
                      </p>
                    )}

                    <WhatsAppButton
                      full
                      pageType="offers"
                      custom={`Hello, I would like to claim the offer: ${promo.title}${
                        promo.code ? ` (code ${promo.code})` : ''
                      }.`}
                    >
                      Claim via WhatsApp
                    </WhatsAppButton>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState title="No offers running right now">
                Message us on WhatsApp for a fixed quote on any journey.
              </EmptyState>
            )
          )}
        </Container>
      </Section>
    </>
  );
}
