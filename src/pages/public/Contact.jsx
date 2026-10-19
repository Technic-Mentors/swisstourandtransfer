import { useCallback } from 'react';
import { publicApi } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import { useSite } from '../../context/SiteContext';
import Seo from '../../components/seo/Seo';
import { breadcrumbSchema, localBusiness } from '../../components/seo/schemas';
import { PageHead } from '../../components/layout/PublicLayout';
import { Container, Section } from '../../components/ui';
import WhatsAppButton from '../../components/ui/WhatsAppButton';
import EnquiryForm from '../../components/forms/EnquiryForm';
import s from './pages.module.css';

const icons = {
  phone: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .7-.2 1l-2.3 2.2z" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.4-8 4.6-8-4.6V6l8 4.6L20 6z" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.3 7 13 7 13s7-7.7 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 10.6V6h-2v7.4l5.2 3.1 1-1.7-4.2-2.2z" />
    </svg>
  ),
};

function Row({ icon, label, children }) {
  if (!children) return null;
  return (
    <div className={s.contactRow}>
      <span className={s.contactIcon}>{icons[icon]}</span>
      <div>
        <div className={s.contactLabel}>{label}</div>
        <div className={s.contactValue}>{children}</div>
      </div>
    </div>
  );
}

export default function Contact() {
  const { settings, socials } = useSite();

  const load = useCallback(() => publicApi.vehicles(), []);
  const { data } = useFetch(load, []);
  const vehicles = data?.vehicles ?? [];

  const phone = settings.phone;

  return (
    <>
      <Seo
        title="Contact Us — Swiss Chauffeur Service"
        description="Contact Swiss Tour & Transfer for private chauffeur and airport transfer bookings across Switzerland. WhatsApp, phone or email — we answer 24/7."
        path="/contact"
        jsonLd={[localBusiness(settings), breadcrumbSchema([{ name: 'Contact', path: '/contact' }])]}
      />

      <PageHead
        trail={[{ name: 'Contact' }]}
        eyebrow="Contact"
        title="Talk to a real person, any hour"
        text="WhatsApp is the fastest way to reach us and the way most guests book. Phone and email work just as well."
      />

      <Section>
        <Container>
          <div className={s.contactGrid}>
            <div className={s.contactInfo}>
              {/* Four short facts read better as a grid than a tall list. */}
              <div className={s.contactList}>
                <Row icon="phone" label="Phone">
                  {phone && <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>}
                </Row>
                <Row icon="mail" label="Email">
                  {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
                </Row>
                <Row icon="pin" label="Address">
                  {settings.address}
                </Row>
                <Row icon="clock" label="Opening hours">
                  {settings.opening_hours}
                </Row>
              </div>

            

              {settings.maps_embed_url && (
                <div className={s.map}>
                  <iframe
                    src={settings.maps_embed_url}
                    title="Our location on Google Maps"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            <div className={s.contactFormCard}>
              <div className={s.contactFormHead}>
                <span className={s.contactFormEyebrow}>Enquiry form</span>
                <h2 className={s.contactFormTitle}>Send us your details</h2>
              </div>
              <EnquiryForm vehicles={vehicles} />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
