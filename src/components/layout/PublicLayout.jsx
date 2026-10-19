import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import useWhatsApp from '../../hooks/useWhatsApp';
import Header from './Header';
import Footer from './Footer';
import { Container, Eyebrow, WhatsAppIcon, cx } from '../ui';
import s from './layout.module.css';

/* ------------------------------------------------------- announcement bar */

function AnnouncementBar() {
  const { settings, flag } = useSite();
  const [dismissed, setDismissed] = useState(false);

  if (!flag('announcement_enabled') || !settings.announcement_text || dismissed) return null;

  const text = settings.announcement_text;
  // With no destination chosen in admin the bar points at the offers page,
  // which is what an announcement is almost always about.
  const link = settings.announcement_link || '/offers';
  const internal = link.startsWith('/');

  return (
    <div className={s.announce}>
      <div className={s.announceInner}>
        {link ? (
          internal ? (
            <Link to={link}>{text}</Link>
          ) : (
            <a href={link} target="_blank" rel="noopener noreferrer">
              {text}
            </a>
          )
        ) : (
          <span>{text}</span>
        )}
      </div>
      <button
        type="button"
        className={s.announceClose}
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
      >
        ✕
      </button>
    </div>
  );
}

/* ------------------------------------------------------ floating whatsapp */

function FloatingWhatsApp() {
  const { flag } = useSite();
  const { buildUrl, track } = useWhatsApp();

  if (!flag('show_floating_whatsapp')) return null;

  return (
    <a
      className={s.float}
      href={buildUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      onClick={() => track({ pageType: 'float' })}
    >
      <span className={s.floatPulse} aria-hidden="true" />
      <WhatsAppIcon />
    </a>
  );
}

/* ----------------------------------------------------- sticky mobile bar */

function StickyMobileBar() {
  const { settings, flag } = useSite();
  const { buildUrl, track } = useWhatsApp();

  // Keep the page bottom clear of the bar.
  useEffect(() => {
    const enabled = flag('show_sticky_mobile_bar');
    document.body.classList.toggle('has-sticky-bar', enabled);
    return () => document.body.classList.remove('has-sticky-bar');
  }, [flag]);

  if (!flag('show_sticky_mobile_bar')) return null;

  const phone = settings.phone;

  return (
    <nav className={s.sticky} aria-label="Quick contact">
      <a
        className={cx(s.stickyItem, s.stickyWa)}
        href={buildUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track({ pageType: 'sticky' })}
      >
        <WhatsAppIcon />
        WhatsApp
      </a>

      <a className={cx(s.stickyItem, s.stickyCall)} href={phone ? `tel:${phone.replace(/\s/g, '')}` : '/contact'}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .7-.2 1l-2.3 2.2z" />
        </svg>
        Call
      </a>

      <Link className={s.stickyItem} to="/book">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.4-8 4.6-8-4.6V6l8 4.6L20 6z" />
        </svg>
        Enquire
      </Link>
    </nav>
  );
}

/* ------------------------------------------------------------ breadcrumbs */

export function Breadcrumbs({ trail = [] }) {
  if (!trail.length) return null;

  return (
    <nav className={s.crumbs} aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {trail.map((crumb, i) => {
        const last = i === trail.length - 1;
        return (
          <span key={crumb.path || crumb.name} style={{ display: 'contents' }}>
            <span className={s.crumbSep} aria-hidden="true">
              ›
            </span>
            {last || !crumb.path ? (
              <span className={s.crumbCurrent} aria-current="page">
                {crumb.name}
              </span>
            ) : (
              <Link to={crumb.path}>{crumb.name}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/** Shared page banner: breadcrumbs, a ruled eyebrow, h1 and intro text. */
export function PageHead({ trail = [], eyebrow, title, text, children }) {
  return (
    <div className={s.pageHead}>
      <Container>
        <Breadcrumbs trail={trail} />
        {eyebrow && <span className={s.pageHeadEyebrow}>{eyebrow}</span>}
        <h1 className={s.pageHeadTitle}>{title}</h1>
        {text && <p className={s.pageHeadText}>{text}</p>}
        <span className={s.pageHeadRule} aria-hidden="true" />
        {children}
      </Container>
    </div>
  );
}

/* ----------------------------------------------------------------- layout */

export default function PublicLayout() {
  const location = useLocation();

  // Every navigation starts at the top of the new page.
  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <AnnouncementBar />
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <StickyMobileBar />
    </>
  );
}
