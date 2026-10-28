import { Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import { Container, cx } from '../ui';
import s from './layout.module.css';

const COMPANY_LINKS = [
  { to: '/vehicles', label: 'Fleet' },
  { to: '/services', label: 'Services' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/about', label: 'About us' },
];

const CITY_LINKS = [
  { slug: 'zurich', label: 'Zurich' },
  { slug: 'geneva', label: 'Geneva' },
  { slug: 'basel', label: 'Basel' },
  { slug: 'lucerne', label: 'Lucerne' },
  { slug: 'st-moritz', label: 'St. Moritz' },
  { slug: 'zermatt', label: 'Zermatt' },
];

function SocialIcon({ name }) {
  const platform = name.toLowerCase();

  if (platform.includes('instagram')) {
    return (
      <svg className={s.socialInstagram} viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle className={s.socialIconDot} cx="17.5" cy="6.5" r="1" />
      </svg>
    );
  }

  if (platform.includes('facebook')) {
    return (
      <svg className={s.socialFacebook} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.4 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5v3.1h2.7v8z" />
      </svg>
    );
  }

  if (platform.includes('linkedin')) {
    return (
      <svg className={s.socialLinkedin} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5.2 8.6a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM3.7 10h3v10h-3zM9 10h2.9v1.4h.1a3.2 3.2 0 0 1 2.9-1.6c3.1 0 3.7 2 3.7 4.6V20h-3v-5c0-1.2 0-2.7-1.7-2.7s-2 1.3-2 2.6V20H9z" />
      </svg>
    );
  }

  if (platform.includes('tiktok')) {
    return (
      <svg className={s.socialTiktok} viewBox="0 0 24 24" aria-hidden="true">
        <path className={s.socialTiktokCyan} d="M19.6 8.2a7 7 0 0 1-4.3-1.5v7.1a6.1 6.1 0 1 1-5.3-6v3.6a2.6 2.6 0 1 0 1.8 2.5V2h3.5c.2 2 1.8 3.7 4.3 3.9z" />
        <path className={s.socialTiktokPink} d="M19.6 8.2a7 7 0 0 1-4.3-1.5v7.1a6.1 6.1 0 1 1-5.3-6v3.6a2.6 2.6 0 1 0 1.8 2.5V2h3.5c.2 2 1.8 3.7 4.3 3.9z" />
        <path d="M19.6 8.2a7 7 0 0 1-4.3-1.5v7.1a6.1 6.1 0 1 1-5.3-6v3.6a2.6 2.6 0 1 0 1.8 2.5V2h3.5c.2 2 1.8 3.7 4.3 3.9z" />
      </svg>
    );
  }

  return (
    <svg className={s.socialGeneric} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function ContactIcon({ type }) {
  const paths = {
    phone: <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .7-.2 1l-2.3 2.2z" />,
    email: <path d="M3 5h18v14H3zM3 6l9 7 9-7" />,
    pin: <><path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    hours: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    company: <><path d="M4 21V5l8-2v18" /><path d="M12 9h8v12" /><path d="M2 21h20" /></>,
    registration: <><path d="M5 3h9l5 5v13H5z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[type]}</svg>;
}

export default function Footer() {
  const { settings, socials } = useSite();
  const year = new Date().getFullYear();
  const phone = settings.phone;
  // The address is stored over two lines; a map query wants one.
  const addressOneLine = String(settings.address || '').replace(/\n+/g, ', ');
  const mapUrl = addressOneLine
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressOneLine)}`
    : '';

  return (
    <footer className={s.footer}>
      <Container>
        <div className={s.footerGrid}>
          <div>
            <Link to="/" className={s.footerLogo} aria-label="Swiss Tour & Transfer - home">
              {/* Same pair as the header: one mark per theme. */}
              <img src="/brand-logo.png" alt="" className={cx(s.footerLogoArtwork, s.logoDark)} loading="lazy" />
              <img src="/brand-logo-light.png" alt="" className={cx(s.footerLogoArtwork, s.logoOnLight)} loading="lazy" />
            </Link>

            <p className={s.footerBrandText}>
              {settings.footer_description ||
                'Premium private chauffeur and transfer services across Switzerland. Airport transfers, business travel, events and alpine ski transfers, available 24/7.'}
            </p>

            <p className={s.footerTagline}>{settings.tagline || 'Explore · Travel · Arrive'}</p>

            {socials.length > 0 && (
              <div className={s.footerSocials}>
                {socials.map((social) => (
                  <a
                    key={social.name}
                    className={s.socialLink}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    title={social.name}
                  >
                    <SocialIcon name={social.name} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <nav aria-label="Explore">
            <h4 className={s.footerTitle}>Explore</h4>
            <div className={s.footerList}>
              {COMPANY_LINKS.map((link) => (
                <Link key={link.to} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav aria-label="Cities">
            <h4 className={s.footerTitle}>Cities</h4>
            <div className={s.footerList}>
              {CITY_LINKS.map((city) => (
                <Link key={city.slug} to={`/chauffeur-service/${city.slug}`}>
                  {city.label}
                </Link>
              ))}
            </div>
          </nav>

          <div>
            <h4 className={s.footerTitle}>Contact</h4>
            <address className={s.footerContact} style={{ fontStyle: 'normal' }}>
              {settings.company_name && (
                <span><ContactIcon type="company" />{settings.company_name}</span>
              )}
              {settings.address && (
                <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                  <ContactIcon type="pin" />
                  <span className={s.footerAddress}>{settings.address}</span>
                </a>
              )}
              {settings.registration_number && (
                <span><ContactIcon type="registration" />Registration #: {settings.registration_number}</span>
              )}
              {phone && <a href={`tel:${phone.replace(/\s/g, '')}`}><ContactIcon type="phone" /> {phone}</a>}
              {settings.email && <a href={`mailto:${settings.email}`}><ContactIcon type="email" /> {settings.email}</a>}
              {settings.opening_hours && <span><ContactIcon type="hours" />{settings.opening_hours}</span>}
            </address>
          </div>
        </div>

      </Container>

      <div className={s.footerBar}>
        <Container>
          <div className={s.footerAttribution}>
            <span>© {year} {settings.company_name || 'Swiss Tour & Transfer'}.</span>
            <span className={s.footerCredit}>
              Developed with love
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 14s-6-3.7-6-8a3.3 3.3 0 0 1 6-2 3.3 3.3 0 0 1 6 2c0 4.3-6 8-6 8Z" />
              </svg>
              by{' '}
              <a href="https://technicmentors.com/" target="_blank" rel="noopener noreferrer">
                Technic Mentors
              </a>
            </span>
          </div>
        </Container>
      </div>
    </footer>
  );
}
