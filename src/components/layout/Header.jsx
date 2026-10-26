import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import WhatsAppButton from '../ui/WhatsAppButton';
import { Container, cx } from '../ui';
import usePublicTheme from '../../hooks/usePublicTheme';
import s from './layout.module.css';

const NAV = [
  // `end` so Home is only active on "/", not on every route beneath it.
  { to: '/', label: 'Home', end: true },
  { to: '/vehicles', label: 'Vehicles' },
  { to: '/services', label: 'Services' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

function Logo({ onClick }) {
  return (
    <Link to="/" className={s.logo} onClick={onClick} aria-label="Swiss Tour & Transfer - home">
      {/* Both marks ship; CSS shows the one that suits the theme's background. */}
      <img src="/brand-logo.png" alt="" className={cx(s.logoArtwork, s.logoDark)} />
      <img src="/brand-logo-light.png" alt="" className={cx(s.logoArtwork, s.logoOnLight)} />
    </Link>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.4v2.4M12 19.2v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.4 12h2.4M19.2 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.5 14.2A8.6 8.6 0 0 1 9.8 3.5a8.6 8.6 0 1 0 10.7 10.7z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .7-.2 1l-2.3 2.2z" />
    </svg>
  );
}

export default function Header() {
  const { settings } = useSite();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close the drawer on navigation, otherwise it stays open over the new page.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock the page behind the open drawer.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = open ? 'hidden' : previous || '';
    return () => {
      document.body.style.overflow = previous || '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const phone = settings.phone;
  const { isLight, toggle } = usePublicTheme();

  return (
    <>
      <header className={cx(s.header, scrolled && s.headerScrolled, location.pathname === '/' && s.heroHeader)}>
        <Container>
          <div className={s.headerInner}>
            <Logo />

            <nav className={s.nav} aria-label="Main">
              {NAV.filter((item) => location.pathname !== '/' || item.to !== '/reviews').map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => cx(s.navLink, isActive && s.navLinkActive)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className={s.actions}>
              {phone && (
                <a className={s.phone} href={`tel:${phone.replace(/\s/g, '')}`}>
                  <PhoneIcon />
                  {phone}
                </a>
              )}

              <button
                type="button"
                className={s.themeToggle}
                onClick={toggle}
                aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
                title={isLight ? 'Dark theme' : 'Light theme'}
              >
                {isLight ? <MoonIcon /> : <SunIcon />}
              </button>

              <WhatsAppButton variant="gold" size="sm" pageType="header" className={s.headerCta}>
                Book via WhatsApp
              </WhatsAppButton>

              <button
                type="button"
                className={cx(s.burger, open && s.burgerOpen)}
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {open && (
        <>
          <div className={s.drawerBackdrop} onClick={() => setOpen(false)} aria-hidden="true" />
          <div className={s.drawer} role="dialog" aria-modal="true" aria-label="Menu">
            <div className={s.drawerHead}>
              <Logo onClick={() => setOpen(false)} />
              <button
                type="button"
                className={s.drawerClose}
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <nav className={s.drawerNav} aria-label="Mobile">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => cx(s.drawerLink, isActive && s.drawerLinkActive)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className={s.drawerFoot}>
              <WhatsAppButton full pageType="mobile-menu">
                Book via WhatsApp
              </WhatsAppButton>
              {phone && (
                <a className={s.drawerPhone} href={`tel:${phone.replace(/\s/g, '')}`}>
                  {phone}
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
