import { useCallback } from 'react';
import { publicApi } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import { useSite } from '../../context/SiteContext';
import Seo from '../../components/seo/Seo';
import { breadcrumbSchema, localBusiness } from '../../components/seo/schemas';
import { PageHead } from '../../components/layout/PublicLayout';
import { Badge, Card, Container, Section, SectionHeading, cx } from '../../components/ui';
import WhatsAppButton from '../../components/ui/WhatsAppButton';
import EnquiryForm from '../../components/forms/EnquiryForm';
import s from './pages.module.css';

export default function Book() {
  const { settings } = useSite();

  const load = useCallback(() => publicApi.vehicles(), []);
  const { data } = useFetch(load, []);
  const vehicles = data?.vehicles ?? [];

  const minutes = settings.reply_time_minutes || '10';

  return (
    <>
      <Seo
        title="Book a Ride — Chauffeur & Airport Transfer Booking"
        description="Book a private chauffeur in Switzerland. Send one WhatsApp message or fill in the enquiry form and we confirm your vehicle, chauffeur and a fixed price."
        path="/book"
        jsonLd={[localBusiness(settings), breadcrumbSchema([{ name: 'Book', path: '/book' }])]}
      />

      <PageHead
        trail={[{ name: 'Book' }]}
        eyebrow="Book a ride"
        title="Two ways to book"
        text="WhatsApp is the fastest. Prefer email? Fill in the form and we will confirm the price and chauffeur."
      />

      <Section>
        <Container narrow>
          <div className={s.bookChoice}>
            <Card className={cx(s.bookOption, s.recommended)}>
              <Badge tone="green">Fastest · Recommended</Badge>
              <h2 className={s.bookOptionTitle}>Book on WhatsApp in one message</h2>
              <p className={s.bookOptionText}>
                Tell us where, when and how many of you there are. Typical reply: a few minutes,
                24 hours a day.
              </p>
              <WhatsAppButton size="lg" pageType="book" full>
                Open WhatsApp
              </WhatsAppButton>
            </Card>

            <Card className={s.bookOption}>
              <Badge tone="neutral">Book Online</Badge>
              <h2 className={s.bookOptionTitle}>Send your details by form</h2>
              <p className={s.bookOptionText}>
                Fill in the form below and we reply by email or phone within about {minutes} minutes.
                You can still send it to WhatsApp afterwards in one tap.
              </p>
              <a
                href="#enquiry"
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                Go to the form ↓
              </a>
            </Card>
          </div>

          <div id="enquiry">
            <SectionHeading eyebrow="Book Online" title="Tell us about your journey" as="h2" />
            <Card pad>
              <EnquiryForm vehicles={vehicles} />
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
