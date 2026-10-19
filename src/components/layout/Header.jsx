import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import WhatsAppButton from '../ui/WhatsAppButton';
import usePublicTheme from '../../hooks/usePublicTheme';
import { Container, cx } from '../ui';
import s from './layout.module.css';

const NAV = [
  // `end` so Home is only active on "/", not on every route beneath it.
  { to: '/', label: 'Home', end: true },
  { to: '/vehicles', label: 'Vehicles' },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

function Logo({ onClick, lightTheme }) {
  return (
    <Link to="/" className={s.logo} onClick={onClick} aria-label="Swiss Tour & Transfer - home">
      {lightTheme ? (
        <img src="/logo-light.png" alt="Swiss Tour & Transfer" className={s.logoLight} width="132" height="88" />
      ) : (
        <>
          <img src="/logo-mark.png" alt="" className={s.logoMark} width="82" height="48" />
          <span className={s.logoText}>
            <span className={s.logoTop}>SWISS</span>
            <span className={s.logoBottom}>TOUR &amp; TRANSFER</span>
          </span>
        </>
      )}
    </Link>
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
  const { isLight, toggle } = usePublicTheme();
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

  return (
    <>
      <header className={cx(s.header, scrolled && s.headerScrolled)}>
        <Container>
          <div className={s.headerInner}>
            <Logo lightTheme={isLight} />

            <nav className={s.nav} aria-label="Main">
              {NAV.map((item) => (
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

              <WhatsAppButton size="sm" pageType="header" className={s.headerCta}>
                Book via WhatsApp
              </WhatsAppButton>

              <button
                type="button"
                className={s.themeToggle}
                onClick={toggle}
                aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
                title={isLight ? 'Dark theme' : 'Light theme'}
              >
                {isLight ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M21 13a8.5 8.5 0 0 1-10-10 8.5 8.5 0 1 0 10 10Z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
                  </svg>
                )}
              </button>

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
              <Logo onClick={() => setOpen(false)} lightTheme={isLight} />
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
              <NavLink to="/offers" className={({ isActive }) => cx(s.drawerLink, isActive && s.drawerLinkActive)}>
                Offers
              </NavLink>
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
