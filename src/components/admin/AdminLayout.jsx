import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { admin as adminApi } from '../../api/resources';
import { ThemeToggle, cx } from './widgets';
import s from './admin.module.css';

/* ------------------------------------------------------------------ icons */

const ico = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };

const Icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" {...ico}>
      <rect x="3" y="3" width="7" height="8" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="11" width="7" height="10" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  enquiries: (
    <svg viewBox="0 0 24 24" {...ico}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  vehicles: (
    <svg viewBox="0 0 24 24" {...ico}>
      <path d="M4 16v2M20 16v2" />
      <path d="M3 16v-3.2a2 2 0 0 1 .4-1.2L6 8h12l2.6 3.6a2 2 0 0 1 .4 1.2V16z" />
      <circle cx="7.5" cy="16" r="1.4" />
      <circle cx="16.5" cy="16" r="1.4" />
    </svg>
  ),
  categories: (
    <svg viewBox="0 0 24 24" {...ico}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  services: (
    <svg viewBox="0 0 24 24" {...ico}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10 2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
    </svg>
  ),
  cities: (
    <svg viewBox="0 0 24 24" {...ico}>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  content: (
    <svg viewBox="0 0 24 24" {...ico}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  gallery: (
    <svg viewBox="0 0 24 24" {...ico}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" />
    </svg>
  ),
  testimonials: (
    <svg viewBox="0 0 24 24" {...ico}>
      <path d="M21 12a8 8 0 0 1-8 8H8l-5 2 1.6-4.4A8 8 0 1 1 21 12z" />
    </svg>
  ),
  promotions: (
    <svg viewBox="0 0 24 24" {...ico}>
      <path d="M20.6 12.3 12.3 20.6a2 2 0 0 1-2.8 0l-6.1-6.1a2 2 0 0 1-.6-1.6l.5-6a2 2 0 0 1 1.8-1.8l6-.5a2 2 0 0 1 1.6.6l6.1 6.1a2 2 0 0 1 0 2.8z" />
      <circle cx="8.5" cy="8.5" r="1.3" />
    </svg>
  ),
  reviews: (
    <svg viewBox="0 0 24 24" {...ico}>
      <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" {...ico}>
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-3.9-.9L3 20.5l1.6-4.8A8.4 8.4 0 0 1 3.6 11.5a8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 8.4 8.4z" />
    </svg>
  ),
  upload: (
    <svg viewBox="0 0 24 24" {...ico}>
      <path d="M12 16V4m0 0L8 8m4-4 4 4M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" {...ico}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" {...ico}>
      <path d="M4 20h4L19 9a2 2 0 0 0-2.8-2.8L5 17v3z" />
      <path d="M14.5 5.5 18.5 9.5" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" {...ico}>
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .7-.2 1l-2.3 2.2z" />
    </svg>
  ),
  signOut: (
    <svg viewBox="0 0 24 24" {...ico}>
      <path d="M15 17l5-5-5-5M20 12H9M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
    </svg>
  ),
};

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/enquiries', label: 'Enquiries', icon: 'enquiries', badge: 'enquiries' },
  { to: '/admin/vehicles', label: 'Vehicles', icon: 'vehicles' },
  { to: '/admin/categories', label: 'Categories', icon: 'categories' },
  { to: '/admin/services', label: 'Services', icon: 'services' },
  { to: '/admin/cities', label: 'Cities', icon: 'cities' },
  { to: '/admin/content', label: 'Website content', icon: 'content' },
  { to: '/admin/gallery', label: 'Gallery', icon: 'gallery' },
  { to: '/admin/testimonials', label: 'Testimonials', icon: 'testimonials', badge: 'testimonials' },
  { to: '/admin/promotions', label: 'Promotions', icon: 'promotions' },
  { to: '/admin/settings', label: 'WhatsApp & contact', icon: 'settings' },
];

function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'A';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

/** Close a panel when the click lands outside it. */
function useOutsideClose(ref, open, close) {
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) close();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [ref, open, close]);
}

/**
 * The bar above every admin screen: where you are, what needs attention, the
 * theme switch and your own profile.
 */
function AdminTopNav({ admin, counts, onLogout, onBurger }) {
  const location = useLocation();
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const bellRef = useRef(null);
  const menuRef = useRef(null);

  useOutsideClose(bellRef, bellOpen, () => setBellOpen(false));
  useOutsideClose(menuRef, menuOpen, () => setMenuOpen(false));

  useEffect(() => {
    setBellOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Longest matching nav path wins, so /admin/vehicles/3 still says "Vehicles".
  // A trailing slash is stripped first: /admin/ is still the dashboard.
  const path = location.pathname.replace(/(.)\/$/, '$1');
  const current = [...NAV]
    .filter((item) => (item.end ? path === item.to : path.startsWith(item.to)))
    .sort((a, b) => b.to.length - a.to.length)[0];
  const section = path.startsWith('/admin/profile') ? 'Your profile' : current?.label || 'Admin';

  const notifications = [
    counts.enquiries > 0 && {
      to: '/admin/enquiries',
      icon: 'enquiries',
      label: `${counts.enquiries} new enquir${counts.enquiries === 1 ? 'y' : 'ies'} to reply to`,
    },
    counts.testimonials > 0 && {
      to: '/admin/testimonials',
      icon: 'testimonials',
      label: `${counts.testimonials} review${counts.testimonials === 1 ? '' : 's'} waiting for approval`,
    },
  ].filter(Boolean);

  return (
    <header className={s.topNav}>
      <button type="button" className={s.burger} onClick={onBurger} aria-label="Open menu">
        ☰
      </button>

      <span className={s.topNavSection}>{section}</span>

      <div className={s.topNavTools}>
        <div className={s.bellWrap} ref={bellRef}>
          <button
            type="button"
            className={s.bellBtn}
            onClick={() => setBellOpen((v) => !v)}
            aria-label={`Notifications${notifications.length ? ` (${notifications.length})` : ''}`}
            aria-expanded={bellOpen}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10.5 21a2 2 0 0 0 3 0" />
            </svg>
            {notifications.length > 0 && <span className={s.bellDot} />}
          </button>

          {bellOpen && (
            <div className={s.bellPanel} role="menu">
              <span className={s.menuHead}>Notifications</span>
              {notifications.length ? (
                notifications.map((n) => (
                  <Link key={n.to} to={n.to} className={s.bellItem} onClick={() => setBellOpen(false)}>
                    <span className={s.bellIcon}>{Icons[n.icon]}</span>
                    {n.label}
                    <span aria-hidden="true">→</span>
                  </Link>
                ))
              ) : (
                <p className={s.bellEmpty}>Nothing needs your attention.</p>
              )}
            </div>
          )}
        </div>

        <ThemeToggle />

        <div className={s.profileWrap} ref={menuRef}>
          <button
            type="button"
            className={s.profileBtn}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className={s.avatar}>{initials(admin?.name)}</span>
            <span className={s.profileWho}>
              <span className={s.profileName}>{admin?.name || 'Administrator'}</span>
              <span className={s.profileRole}>{admin?.role || 'admin'}</span>
            </span>
            <svg
              className={s.profileChevron}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {menuOpen && (
            <div className={s.profileMenu} role="menu">
              <span className={s.menuHead}>{admin?.email}</span>
              <Link to="/admin/profile" className={s.menuItem} onClick={() => setMenuOpen(false)}>
                {Icons.edit}
                Edit profile
              </Link>
              <Link to="/" className={s.menuItem} target="_blank" rel="noopener noreferrer">
                {Icons.content}
                View live site
              </Link>
              <button type="button" className={cx(s.menuItem, s.menuDanger)} onClick={() => onLogout()}>
                {Icons.signOut}
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Admin shell: dark sidebar with icons, dark content area.
 * `counts` drives the badges (new enquiries, reviews awaiting approval).
 */
export default function AdminLayout({ children, counts: given }) {
  const { admin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState(given || {});
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  /**
   * The sidebar badges should be right on every screen, so the layout fetches
   * them itself rather than relying on each page to pass them down. Refreshed
   * on navigation so acting on an enquiry updates the badge.
   */
  useEffect(() => {
    if (given) return undefined;
    let active = true;

    adminApi
      .stats()
      .then(({ stats }) => {
        if (active) {
          setCounts({ enquiries: stats.enquiries_new, testimonials: stats.testimonials_pending });
        }
      })
      .catch(() => {
        /* badges are decoration - never block the panel on them */
      });

    return () => {
      active = false;
    };
  }, [given, location.pathname]);

  return (
    <div className={s.shell}>
      {open && <div className={s.backdrop} onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside className={cx(s.sidebar, open && s.sidebarOpen)}>
        <div className={s.brand}>
          <Link to="/admin" className={s.brandRow}>
            <img src="/logo-mark.png" alt="" className={s.brandMark} width="34" height="22" />
            <span>
              <span className={s.brandName}>SWISS</span>
              <span className={s.brandSub}>TOUR &amp; TRANSFER · ADMIN</span>
            </span>
          </Link>
        </div>

        <nav className={s.nav} aria-label="Admin">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cx(s.navLink, isActive && s.navLinkActive)}
            >
              <span className={s.navIcon}>{Icons[item.icon]}</span>
              <span className={s.navLabel}>{item.label}</span>
              {item.badge && counts[item.badge] > 0 ? (
                <span className={s.navCount}>{counts[item.badge]}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className={s.sidebarFoot}>
          <Link to="/admin/profile" className={s.sidebarWhoLink}>
            <span className={s.avatar}>{initials(admin?.name)}</span>
            <span className={s.sidebarWho}>
              <span className={s.sidebarName}>{admin?.name || 'Administrator'}</span>
              <span className={s.viewSite}>Edit profile</span>
            </span>
          </Link>
          <button type="button" className={s.signOut} onClick={() => logout()} aria-label="Sign out" title="Sign out">
            {Icons.signOut}
          </button>
        </div>
      </aside>

      <div className={s.content}>
        <AdminTopNav
          admin={admin}
          counts={counts}
          onLogout={logout}
          onBurger={() => setOpen(true)}
        />

        <main className={s.main}>{children}</main>
      </div>
    </div>
  );
}

// Each screen keeps one colour of the dashboard palette, so a glance at the
// title block says which section you are in.
const PAGE_TONES = {
  '/admin/enquiries': ['Violet', 'enquiries'],
  '/admin/vehicles': ['Blue', 'vehicles'],
  '/admin/categories': ['Violet', 'categories'],
  '/admin/services': ['Cyan', 'services'],
  '/admin/cities': ['Emerald', 'cities'],
  '/admin/content': ['Amber', 'content'],
  '/admin/gallery': ['Rose', 'gallery'],
  '/admin/testimonials': ['Amber', 'testimonials'],
  '/admin/promotions': ['Rose', 'promotions'],
  '/admin/settings': ['Emerald', 'settings'],
  '/admin/profile': ['Blue', 'settings'],
};

/** Page title block used by the non-dashboard admin screens. */
export function AdminPageHead({ title, subtitle, children }) {
  const { pathname } = useLocation();
  const key = Object.keys(PAGE_TONES)
    .filter((k) => pathname.replace(/(.)\/$/, '$1').startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  const [tone, icon] = PAGE_TONES[key] || ['Violet', 'dashboard'];

  return (
    <header className={cx(s.pageHead, s[`tone${tone}`])}>
      <div className={s.pageHeadMain}>
        <span className={s.pageIcon}>{Icons[icon]}</span>
        <div>
          <h1 className={s.pageTitle}>{title}</h1>
          {subtitle && <p className={s.pageSub}>{subtitle}</p>}
        </div>
      </div>
      <div className={s.pageActions}>{children}</div>
    </header>
  );
}

export { Icons };
