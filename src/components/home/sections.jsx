import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryImage, galleryImage, imageFallback, imageUrl } from '../../config';
import { useSite } from '../../context/SiteContext';
import {
  Button,
  Card,
  Container,
  Eyebrow,
  Lightbox,
  Rating,
  Section,
  SectionHeading,
  cx,
} from '../ui';
import WhatsAppButton from '../ui/WhatsAppButton';
import CountUp from '../ui/CountUp';
import { VehicleGrid } from '../vehicles';
import QuickBookingBar from '../forms/QuickBookingBar';
import s from './home.module.css';

/** Cursor-follow glow for cards (sets --mx / --my). Shared with /about. */
export function spotlight(e) {
  const r = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;

  e.currentTarget.style.setProperty('--mx', `${x}px`);
  e.currentTarget.style.setProperty('--my', `${y}px`);

  /* ...and the lean, as a fraction of the card either side of centre */
  e.currentTarget.style.setProperty('--rx', `${(x / r.width - 0.5) * 7}deg`);
  e.currentTarget.style.setProperty('--ry', `${(0.5 - y / r.height) * 7}deg`);
}

/** Put a card back to flat when the pointer leaves it. */
export function unspotlight(e) {
  e.currentTarget.style.setProperty('--rx', '0deg');
  e.currentTarget.style.setProperty('--ry', '0deg');
}

/** Thin gold progress bar at the top of the page. */
function ScrollProgress() {
  const bar = useRef(null);

  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const v = max > 0 ? h.scrollTop / max : 0;
      if (bar.current) bar.current.style.width = `${v * 100}%`;
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, []);

  return (
    <div className={s.xProgress} aria-hidden="true">
      <div ref={bar} className={s.xProgressBar}>
        <CarIcon className={s.xProgressCar} />
      </div>
    </div>
  );
}

/** Word-by-word masked reveal for headlines. */
function Words({ text, start = 0, wordClass }) {
  return String(text)
    .split(' ')
    .filter(Boolean)
    .map((w, i) => (
      <span key={`${w}-${i}`}>
        <span className={s.xWordMask}>
          <span className={cx(s.xWord, wordClass)} style={{ '--i': start + i }}>
            {w}
          </span>
        </span>{' '}
      </span>
    ));
}

/**
 * Snow through the Swiss ski season, drifting embers the rest of the year.
 * ?season=winter or ?season=default forces one, so the winter hero can be
 * checked in July without waiting for December.
 */
function heroSeason() {
  if (typeof window !== 'undefined') {
    const forced = new URLSearchParams(window.location.search).get('season');
    if (forced === 'winter' || forced === 'default') return forced;
  }

  const month = new Date().getMonth();
  return month >= 10 || month <= 2 ? 'winter' : 'default';
}

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  delay: (i * 1.3) % 9,
  dur: 9 + (i % 5) * 2,
  size: 2 + (i % 3),
}));

/** Swept-wing jet silhouette, nose pointing right. */
function JetIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 34" aria-hidden="true">
      <path d="M64 17 54 13.8 36 13.8 20 2 15 2 27 14.4 12 14.4 4 8.5 1.5 8.5 7.5 15.2 1 15.8 1 18.2 7.5 18.8 1.5 25.5 4 25.5 12 19.6 27 19.6 15 32 20 32 36 20.2 54 20.2Z" />
    </svg>
  );
}

/** Long-wheelbase saloon in side view, nose pointing right. */
export function CarIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 84 24" aria-hidden="true">
      <path fillRule="evenodd" d="M3 18 3 13.6 6 12.2 22 12 30 4.8 48 4.6 57 11.6 77 12.3 81.5 14.6 81.5 18Z M28.8 11.5 32.6 6.2 43.6 6.1 43.6 11.5Z M45.6 11.5 45.6 6.1 48.4 6.1 54.6 11.5Z" />
      <circle cx="18" cy="18" r="4.8" />
      <circle cx="66" cy="18" r="4.8" />
    </svg>
  );
}

/* Two jets at different heights: the far one is smaller, dimmer and slower,
   and its negative delay means it is already mid-flight on the first paint. */
const JETS = [
  { top: '15%', scale: 1, opacity: 1, dur: 26, delay: -4 },
  { top: '36%', scale: 0.6, opacity: 0.45, dur: 36, delay: -21 },
];

/** Jets crossing the hero sky, each trailing a gold contrail. */
function SkyJets() {
  return (
    <div className={s.xJetSky} aria-hidden="true">
      {JETS.map((jet, i) => (
        <span
          key={i}
          className={s.xJet}
          style={{
            top: jet.top,
            '--jet-scale': jet.scale,
            '--jet-opacity': jet.opacity,
            animationDuration: `${jet.dur}s`,
            animationDelay: `${jet.delay}s`,
          }}
        >
          <span className={s.xJetTrail} />
          <JetIcon className={s.xJetIcon} />
        </span>
      ))}
    </div>
  );
}

/**
 * The service in one loop: the jet flies in from the left, painting its
 * route as it goes, and parks at the airport; the car then leaves that
 * same point and drives the guest on to the pin. The two paths below are
 * repeated verbatim as offset-path in the stylesheet - edit both together.
 * Nothing moves until the section has scrolled into view.
 */
function JourneyPath() {
  const flight = 'M14 96C60 60 76 22 130 22C190 22 228 94 244 96L268 96';
  const road = 'M268 96C350 96 410 106 506 106';

  return (
    <div ref={reveal} className={cx(s.xTrip, s.xReveal)} aria-hidden="true">
      <svg className={s.xTripSvg} viewBox="0 0 520 132" fill="none">
        <path className={s.xTripTrack} d={flight} />
        <path className={s.xTripTrack} d={road} />
        <path className={cx(s.xTripDraw, s.xTripArc)} pathLength="100" d={flight} />
        <path className={cx(s.xTripDraw, s.xTripRoad)} pathLength="100" d={road} />

        <circle className={s.xTripDot} cx="14" cy="96" r="5" />
        <circle className={s.xTripDot} cx="268" cy="96" r="5" />
        <g className={s.xTripPin} transform="translate(506 106)">
          <circle className={s.xPinRing} r="6" />
          <circle className={s.xPinCore} r="4" />
        </g>

        <g className={s.xTripPlane}>
          <path className={s.xTripPlaneIcon} transform="translate(-13.4 -7.1) scale(0.42)" d="M64 17 54 13.8 36 13.8 20 2 15 2 27 14.4 12 14.4 4 8.5 1.5 8.5 7.5 15.2 1 15.8 1 18.2 7.5 18.8 1.5 25.5 4 25.5 12 19.6 27 19.6 15 32 20 32 36 20.2 54 20.2Z" />
        </g>

        {/* anchored so the wheels sit on the road rather than straddling it */}
        <g className={s.xTripCar}>
          <g className={s.xTripCarIcon} transform="translate(-19.3 -10.5) scale(0.46)">
            <path fillRule="evenodd" d="M3 18 3 13.6 6 12.2 22 12 30 4.8 48 4.6 57 11.6 77 12.3 81.5 14.6 81.5 18Z M28.8 11.5 32.6 6.2 43.6 6.1 43.6 11.5Z M45.6 11.5 45.6 6.1 48.4 6.1 54.6 11.5Z" />
            <circle cx="18" cy="18" r="4.8" />
            <circle cx="66" cy="18" r="4.8" />
          </g>
        </g>
      </svg>
    </div>
  );
}

/**
 * Plain ref callback (not a component): adds "xIn" when the element scrolls
 * into view. Exported so other pages animate with the same vocabulary.
 */
export function reveal(el) {
  if (!el) return;
  if (!('IntersectionObserver' in window)) {
    el.classList.add(s.xIn);
    return;
  }
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add(s.xIn);
        io.disconnect();
      }
    },
    { threshold: 0.1 },
  );
  io.observe(el);
}

/** Section header with an optional link on the right. */
function HeadRow({ eyebrow, title, link, linkLabel, wide = false, center = false, eyebrowClass, as: Tag = 'h2' }) {
  return (
    <div ref={reveal} className={cx(s.headRow, wide && s.headWide, center && s.headCentered, s.xHead, s.xReveal)}>
      <div>
        <Eyebrow className={eyebrowClass}>{eyebrow}</Eyebrow>
        {/* Word by word, the same reveal the hero headline uses, but held
            back until the heading is actually scrolled to. */}
        <Tag>{title ? <Words text={title} wordClass={s.xHeadWord} /> : null}</Tag>
      </div>
      {link && (
        <Link to={link} className={cx(s.headLink, s.xArrow)}>
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------- hero */

const HERO_ANGLES = [
  { name: 'Rear', image: '/car-3.png', headline: 'Always on time,', accent: 'every time.', text: 'Flight tracking and 24/7 dispatch, so you never wait.' },
  { name: 'Detail', image: '/car-4.png', headline: 'Made for those who', accent: 'notice details.', text: 'Hand-picked vehicles, professional drivers, zero compromise.' },
];

/** The hero advances on its own; one angle every three seconds. */
const HERO_INTERVAL = 3000;

export function HeroSection({ content, allVehicles = [], cities = [], lists = {}, settings = {}, stats = {} }) {
  /* `leaving` is the slide on its way out, so only that one animates to the
     left. Every other slide waits off-screen right with no transition, which
     is what lets the last angle wrap back to the first without a rewind. */
  const [slide, setSlide] = useState({ index: 0, leaving: -1 });
  const activeIndex = slide.index;

  useEffect(() => {
    HERO_ANGLES.forEach(({ image }) => {
      const preload = new window.Image();
      preload.src = image;
    });
  }, []);

  /* Keyed on the active slide, so picking an angle by hand also buys it a
     full three seconds before the hero moves on. */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSlide((current) => ({
        index: (current.index + 1) % HERO_ANGLES.length,
        leaving: current.index,
      }));
    }, HERO_INTERVAL);
    return () => window.clearTimeout(timer);
  }, [slide.index]);

  /* Figures the page already holds, so the column says something concrete
     without a second source of truth to keep up to date. Anything that comes
     back empty drops out rather than showing a zero. */
  const heroStats = [
    [allVehicles.length, 'Vehicles in the fleet'],
    [cities.length, 'Swiss cities served'],
    /* The same rating the trust strip prints, so the two never disagree on
       screen; the review average stands in only if the setting is unset. */
    [settings.google_rating || stats.average, 'Average guest rating'],
  ].filter(([value]) => Number(value) > 0);

  /* The same admin-editable list the trust strip runs on, trimmed to the three
     that fit beside the booking bar. */
  const heroTrust = (lists.trust_items || [])
    .map((group) => group[0])
    .filter(Boolean)
    .slice(0, 3)
    .map((text) =>
      text
        .replace('{rating}', settings.google_rating || '4.9')
        .replace('{count}', settings.google_review_count || 'our'),
    );

  return (
    <section className={s.heroSection} aria-label="Premium chauffeur service">
      <div className={s.heroStage}>
        <div className={cx(s.heroContent, s.heroEnter)}>
          <span className={s.showcaseEyebrow}>Premium chauffeur service</span>
          <div className={s.heroCopyStack}>
            {HERO_ANGLES.map((angle, index) => {
              const Headline = index === 0 ? 'h1' : 'h2';
              const stateClass = index === activeIndex
                ? s.heroCopyActive
                : index === slide.leaving ? s.heroCopyOut : null;
              return (
                <div key={angle.name} className={cx(s.heroCopy, stateClass)} aria-hidden={index !== activeIndex}>
                  <Headline className={s.showcaseTitle}>
                    <span className={s.heroLineMask}><span className={s.heroLine}>{angle.headline}</span></span>
                    <span className={s.heroLineMask}><span className={cx(s.heroLine, s.heroAccent)}>{angle.accent}</span></span>
                  </Headline>
                  <p className={s.heroSubtext}>{angle.text}</p>
                </div>
              );
            })}
          </div>
          {content.hero_text && <p className={s.heroLede}>{content.hero_text}</p>}

          <div className={s.showcaseActions}>
            <Link className={s.heroBookButton} to="/book">Book your ride</Link>
            <Link className={s.heroFleetButton} to="/vehicles">View fleet</Link>
          </div>

          {heroStats.length > 0 && (
            <dl className={s.heroStats}>
              {heroStats.map(([value, label], index) => (
                <div className={s.heroStat} key={label} style={{ '--stat-index': index }}>
                  <dt className={s.heroStatValue}><CountUp raw={String(value)} /></dt>
                  <dd className={s.heroStatLabel}>{label}</dd>
                </div>
              ))}
            </dl>
          )}

          {heroTrust.length > 0 && (
            <ul className={s.heroTrust}>
              {heroTrust.map((text, index) => (
                <li className={s.heroTrustItem} key={text} style={{ '--trust-index': index }}>
                  <span className={s.heroTrustIcon}>{iconFor(text)}</span>
                  {text}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={s.heroSlides} aria-hidden="true">
          {HERO_ANGLES.map((angle, index) => (
            <div
              key={angle.name}
              className={cx(
                s.heroSlide,
                index === activeIndex && s.heroSlideActive,
                index === slide.leaving && s.heroSlideOut,
              )}
              style={{ backgroundImage: `url("${angle.image}")` }}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

/* ---------------------------------------------------------- quick booking */

export function QuickBookingSection({ content, vehicles, cities }) {
  return (
    <div className={s.quickSection} id="booking">
      <Container>
        <QuickBookingBar heading={content.quick_booking_heading} vehicles={vehicles} cities={cities} />
      </Container>
    </div>
  );
}

/* ------------------------------------------------------------ trust strip */

const trustIcon = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

/* The strip is admin-editable text, so the icon is chosen from what it says. */
const TRUST_ICONS = [
  [/24|hour|always|day|night/i, (
    <svg viewBox="0 0 24 24" {...trustIcon}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )],
  [/price|fixed|chf|cost|fee|inclusive/i, (
    <svg viewBox="0 0 24 24" {...trustIcon}>
      <path d="M14 6H9.5v12M7 11h7M9.5 15h6" />
    </svg>
  )],
  [/flight|airport|track|plane/i, (
    <svg viewBox="0 0 24 24" {...trustIcon}>
      <path d="M3 13l18-7-7 18-2.5-7.5L3 13z" />
    </svg>
  )],
  [/chauffeur|driver|multilingual|english|german/i, (
    <svg viewBox="0 0 24 24" {...trustIcon}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )],
  [/rate|rating|review|star|guest/i, (
    <svg viewBox="0 0 24 24" {...trustIcon}>
      <path d="M12 3.6l2.5 5.1 5.6.8-4 4 .9 5.6-5-2.6-5 2.6.9-5.6-4-4 5.6-.8L12 3.6z" />
    </svg>
  )],
];

const DEFAULT_TRUST_ICON = (
  <svg viewBox="0 0 24 24" {...trustIcon}>
    <path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const iconFor = (text) => (TRUST_ICONS.find(([re]) => re.test(text)) || [null, DEFAULT_TRUST_ICON])[1];

export function TrustStrip({ lists, settings }) {
  const items = (lists.trust_items || []).map((group) => group[0]).filter(Boolean);
  if (!items.length) return null;

  const resolved = items.map((text) =>
    text
      .replace('{rating}', settings.google_rating || '4.9')
      .replace('{count}', settings.google_review_count || 'our'),
  );

  // The list is rendered twice so the loop joins up with no visible seam.
  const track = [...resolved, ...resolved];

  return (
    <div className={s.trust}>
      <div className={s.trustViewport}>
        <div className={s.trustTrack}>
          {track.map((text, i) => (
            <span className={s.trustItem} key={`${text}-${i}`} aria-hidden={i >= resolved.length}>
              <span className={s.trustIcon}>{iconFor(text)}</span>
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- categories */

function guestLabel(category) {
  if (category.min_passengers && category.max_passengers) {
    return category.min_passengers === category.max_passengers
      ? `${category.max_passengers} guests`
      : `${category.min_passengers}–${category.max_passengers} guests`;
  }
  const count = Number(category.vehicle_count || 0);
  return `${count} ${count === 1 ? 'vehicle' : 'vehicles'}`;
}

function CategoryMetaIcon({ type }) {
  if (type === 'passengers') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="7.5" r="3" />
        <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="7" width="14" height="12" rx="1.5" />
      <path d="M9 7V5h6v2M5 12h14M9 15h.01M15 15h.01" />
    </svg>
  );
}

export function CategoriesSection({ content, categories }) {
  if (!categories.length) return null;

  const cards = [
    ...categories.slice(0, 4),
    {
      id: 's-class',
      name: 'S Class',
      image: '/alpine-tarmac-hero.png',
      examples: 'Mercedes-Benz S-Class',
      max_passengers: 3,
      vehicle_count: 1,
      path: '/vehicles',
    },
    {
      id: 'e-class-business',
      name: 'E Class Business',
      image: '/images/vehicles/mercedes-benz-eclass.webp',
      examples: 'Mercedes-Benz E-Class',
      max_passengers: 3,
      vehicle_count: 1,
      path: '/vehicles',
    },
  ];

  return (
    <Section id="categories">
      <Container>
        <HeadRow
          eyebrow={content.categories_eyebrow}
          title={content.categories_heading}
          link="/vehicles"
          linkLabel="All vehicles"
        />

        <div ref={reveal} className={cx(s.catGrid, s.xStagger)}>
          {cards.map((category) => {
            // The category's own photo, a vehicle from it, or - when the
            // database has neither - the placeholder car from /public.
            const cover = categoryImage(category) || category.image || category.sample_image;

            return (
              <Link
                key={category.id}
                to={category.path || `/vehicles/category/${category.slug}`}
                className={cx(s.catCard, s.xLift, s.xSpot, s.xGloss, s.xTilt)}
                onMouseMove={spotlight}
                onMouseLeave={unspotlight}
              >
                <span className={cx(s.catMedia, s.xPhoto)}>
                  <img
                    src={imageUrl(cover)}
                    hidden={!cover}
                    onError={imageFallback}
                    alt=""
                    loading="lazy"
                    width="280"
                    height="170"
                  />
                </span>

                <span className={s.catBody}>
                  <span className={s.catName}>{category.name}</span>
                  {category.examples && <span className={s.catExamples}>{category.examples}</span>}
                  <span className={s.catFooter}>
                    <span className={s.catMeta} title={guestLabel(category)}>
                      <CategoryMetaIcon type="passengers" />
                      {category.max_passengers || '—'}
                    </span>
                    <span className={s.catMeta} title={`${category.vehicle_count || 0} vehicles`}>
                      <CategoryMetaIcon type="luggage" />
                      {category.vehicle_count || '—'}
                    </span>
                    <span className={s.catArrow} aria-hidden="true">→</span>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------- featured vehicles */

export function FeaturedVehiclesSection({ content, vehicles }) {
  if (!vehicles.length) return null;

  return (
    <Section id="vehicles" alt>
      <Container>
        <HeadRow
          eyebrow={content.vehicles_eyebrow}
          title={content.vehicles_heading}
          link="/vehicles"
          linkLabel="View all vehicles"
        />
        <div ref={reveal} className={s.xReveal}>
          <VehicleGrid
            vehicles={vehicles}
            pageType="home-featured"
            className={cx(s.xStagger, s.xMotorcade, s.xHomeVehicles)}
          />
        </div>
      </Container>
    </Section>
  );
}

/* ----------------------------------------- services (light cream section) */

function ServiceIcon({ slug }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const shapes = {
    'airport-transfers': <path d="M3 14.5 21 9l-7.3 7.8-1.5-3.2-3.2-1.5L3 14.5ZM12 13.6 9 21" />,
    'hourly-chauffeur': <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
    'city-to-city': <><path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></>,
    'business-travel': <><rect x="4" y="7" width="16" height="12" rx="1.5" /><path d="M9 7V5h6v2m-11 5h16" /></>,
    weddings: <><circle cx="9" cy="12" r="4" /><circle cx="15" cy="12" r="4" /><path d="m10.5 11 3 2" /></>,
    'ski-transfers': <><path d="m5 20 7-15 7 15M3 20h18M9.5 13h5" /></>,
    events: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4m8-4v4M4 10h16m-9 4h2m-2 3h2" /></>,
  };
  return <svg viewBox="0 0 24 24" {...common} aria-hidden="true">{shapes[slug] || shapes.events}</svg>;
}

export function ServicesSection({ content, services }) {
  if (!services.length) return null;

  const cards = [
    ...services,
    {
      id: 'events',
      slug: 'events',
      name: 'Events & WEF',
      short_description: 'Vehicle coordination for conferences, galas and private events.',
      image: '/alpine-tarmac-hero.png',
      path: '/contact',
    },
  ];

  return (
    <section id="services" className={s.servicesShowcase}>
      <Container>
        <div ref={reveal} className={cx(s.servicesHead, s.xHead, s.xReveal)}>
          <div>
            <Eyebrow className={s.servicesEyebrow}>{content.services_eyebrow}</Eyebrow>
            <h2>{content.services_heading}</h2>
          </div>
          <p>{content.services_text}</p>
        </div>

        <div ref={reveal} className={cx(s.serviceShowcaseGrid, s.xStagger)}>
          {cards.map((service, i) => (
            <Link
              to={service.path || `/services/${service.slug}`}
              className={cx(s.serviceCell, s.xLift, s.xSpot, s.xGloss, s.xTilt)}
              key={service.id}
              onMouseMove={spotlight}
              onMouseLeave={unspotlight}
            >
              <span className={s.serviceImage}>
                <img src={imageUrl(service.image)} onError={imageFallback} alt="" loading="lazy" width="520" height="250" />
                <span className={s.serviceIcon}><ServiceIcon slug={service.slug} /></span>
              </span>
              <span className={s.serviceContent}>
              <span className={s.serviceNum}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className={cx(s.serviceName, s.xItemTitle)}>{service.name}</h3>
              <p className={cx(s.serviceDesc, s.xItemText)}>{service.short_description}</p>
              <span className={s.serviceLink}>
                Learn more →
              </span>
              <span className={s.serviceArrow} aria-hidden="true">→</span>
              </span>
            </Link>
          ))}

    
        </div>
      </Container>
    </section>
  );
}

/* ----------------------------------------------------------- why choose us */

/**
 * How far the reader has travelled through an element, 0 to 1. Used to fill the
 * rail beside the reasons, so the bar tracks the scroll rather than a timer.
 */
function useScrollProgress(ref) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const view = window.innerHeight;
      // Starts filling as the list enters the lower part of the screen and is
      // full once its foot has passed the middle.
      const span = rect.height + view * 0.35;
      const seen = view * 0.85 - rect.top;
      setProgress(Math.min(Math.max(seen / span, 0), 1));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ref]);

  return progress;
}

/**
 * A centred column of numbered points beside a rail that fills with the scroll.
 * Shared by the two "list of points" sections so they behave identically.
 */
function RailList({ items }) {
  const listRef = useRef(null);
  const progress = useScrollProgress(listRef);

  return (
    <div className={s.railWrap}>
      <span className={s.rail} aria-hidden="true">
        <span className={s.railFill} style={{ height: `${progress * 100}%` }} />
      </span>

      {/* Two refs on one node: `reveal` runs the stagger animation, the ref
          object feeds the scroll progress for the rail. */}
      <div
        ref={(el) => {
          listRef.current = el;
          reveal(el);
        }}
        className={cx(s.railList, s.xStagger)}
      >
        {items.map(([title, text], i) => {
          // A figure is shown only when the copy states one, e.g. "98%" - never
          // an invented score.
          const stated =
            String(title || '').match(/(\d{1,3})\s*%/) || String(text || '').match(/(\d{1,3})\s*%/);
          const value = stated ? Math.min(100, Number(stated[1])) : null;

          return (
            <div
              className={cx(s.railItem, progress >= (i + 0.3) / items.length && s.xRailOn)}
              key={title || i}
            >
              <span className={s.railNum}>{String(i + 1).padStart(2, '0')}</span>

              <div className={s.railBody}>
                <h3 className={cx(s.railTitle, s.xItemTitle)}>
                  {title}
                  {value !== null && <span className={s.railValue}>{value}%</span>}
                </h3>
                <p className={cx(s.railText, s.xItemText)}>{text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WhyChooseUsSection({ content, lists }) {
  const items = lists.why_items || [];
  if (!items.length) return null;

  return (
    <Section>
      <Container>
        <HeadRow eyebrow={content.why_eyebrow} title={content.why_heading} wide center />
        <RailList items={items} />
      </Container>
    </Section>
  );
}

/* ----------------------------------------------------------- how it works */

export function HowItWorksSection({ content, lists }) {
  const steps = lists.how_steps || [];
  if (!steps.length) return null;

  return (
    <Section alt className={s.howItWorks}>
      <Container>
        <HeadRow eyebrow={content.how_eyebrow} title={content.how_heading} wide center />
        <JourneyPath />
        <RailList items={steps} />
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------- seasonal offer */

export function SeasonalOfferSection({ promotion }) {
  if (!promotion) return null;

  return (
    <Section tight>
      <Container>
        <div ref={reveal} className={cx(s.offer, s.xReveal, s.xShine)}>
          <div>
            <Eyebrow>Seasonal offer</Eyebrow>
            <h2 className={cx(s.offerTitle, s.xOfferTitle)}>{promotion.title}</h2>
            {promotion.description && (
              <p className={cx(s.offerText, s.xItemText)}>{promotion.description}</p>
            )}

            <div className={s.offerMeta}>
              {promotion.code && <span className={s.offerCode}>Code: {promotion.code}</span>}
              {promotion.ends_at && (
                <span className={s.offerValid}>
                  Valid until {new Date(promotion.ends_at).toLocaleDateString('en-GB')}
                </span>
              )}
            </div>
          </div>

          <span className={s.xCtaPulse}>
            <WhatsAppButton
              size="lg"
              pageType="seasonal-offer"
              custom={`Hello, I would like to claim the offer: ${promotion.title}${
                promotion.code ? ` (code ${promotion.code})` : ''
              }.`}
            >
              Claim via WhatsApp
            </WhatsAppButton>
          </span>
        </div>
      </Container>
    </Section>
  );
}

/* ---------------------------------------------------------------- reviews */

export function ReviewsSection({ content, testimonials, stats }) {
  if (!testimonials.length) return null;

  return (
    <Section alt>
      <Container>
        <HeadRow
          eyebrow={content.reviews_eyebrow}
          title={content.reviews_heading}
          link="/reviews"
          linkLabel="Read all reviews"
        />

        {stats?.total > 0 && (
          <div ref={reveal} className={cx(s.xScore, s.xReveal)}>
            <span className={s.xScoreValue}>
              <CountUp raw={stats.average} />
            </span>
            <Rating value={stats.average} className={s.xStars} />
            <span className={s.xScoreCount}>
              from <CountUp raw={String(stats.total)} /> guest reviews
            </span>
          </div>
        )}

        <div ref={reveal} className={cx(s.reviewGrid, s.xStagger)}>
          {testimonials.slice(0, 3).map((review) => (
            <Card key={review.id} className={cx(s.review, s.xLift, s.xGloss)}>
              <Rating value={review.rating} className={s.xStars} />
              <blockquote className={cx(s.reviewQuote, s.xQuote)}>“{review.review_text}”</blockquote>
              <div className={s.reviewFoot}>
                <div>
                  <div className={s.reviewName}>{review.customer_name}</div>
                  <div className={s.reviewMeta}>
                    {[review.country, review.service_label].filter(Boolean).join(' · ')}
                  </div>
                </div>
                {review.source === 'google' && <span className={s.reviewSource}>Google</span>}
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ---------------------------------------------------------------- gallery */

export function GallerySection({ content, photos }) {
  const [lightbox, setLightbox] = useState(-1);
  if (!photos.length) return null;

  const tiles = photos.slice(0, 6);
  const items = tiles.map((photo, index) => ({
    src: (index === 0 || index === 5)
      ? HERO_ANGLES[0].image
      : imageUrl(galleryImage(photo, index)),
    alt: photo.alt_text || photo.caption || 'Swiss Tour & Transfer',
    caption: photo.caption || '',
  }));

  return (
    <Section>
      <Container>
        <HeadRow
          eyebrow={content.gallery_eyebrow}
          title={content.gallery_heading}
        />

        <div ref={reveal} className={cx(s.galleryGrid, s.xStagger)}>
          {tiles.map((photo, i) => (
            <button
              type="button"
              key={photo.id}
              className={cx(
                s.galleryTile,
                s.xZoom,
                s.xClip,
                s.xPhoto,
                (i === 0 || i === 5) && s.galleryTileWide,
              )}
              onClick={() => setLightbox(i)}
              aria-label={`Open photo ${i + 1}`}
            >
              <img
                src={(i === 0 || i === 5)
                  ? HERO_ANGLES[0].image
                  : imageUrl(galleryImage(photo, i))}
                onError={imageFallback}
                alt={photo.alt_text || photo.caption || ''}
                loading="lazy"
                width="500"
                height="320"
              />
            </button>
          ))}
        </div>

        {lightbox >= 0 && (
          <Lightbox items={items} index={lightbox} onIndexChange={setLightbox} onClose={() => setLightbox(-1)} />
        )}
      </Container>
    </Section>
  );
}

/* -------------------------------------------------------------------- faq */

export function FaqSection({ content, faqs }) {
  if (!faqs.length) return null;

  return (
    <Section alt id="faq">
      <Container>
        <HeadRow eyebrow={content.faq_eyebrow} title={content.faq_heading} wide center />

        <div ref={reveal} className={cx(s.faqList, s.xStagger)}>
          {faqs.map((faq) => (
            <details className={cx(s.faqItem, s.xFaq)} key={faq.id}>
              <summary className={s.faqQ}>
                {faq.question}
                <span className={cx(s.faqSign, s.xSign)} aria-hidden="true">
                  +
                </span>
              </summary>
              <div className={cx(s.faqA, s.xAns, s.xItemText)}>{faq.answer}</div>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* -------------------------------------------------------------- final cta */

export function FinalCtaSection({ content }) {
  const { settings } = useSite();

  return (
    <Section className={s.cta}>
      <Container>
        <div ref={reveal} className={cx(s.ctaInner, s.xReveal)}>
          <h2 className={cx(s.ctaTitle, s.xCtaTitle)}>{content.cta_heading || 'Ready when you are'}</h2>
          <p className={s.xItemText}>{content.cta_text}</p>

          <div className={s.ctaActions}>
            <span className={s.xCtaPulse}>
              <WhatsAppButton size="md" pageType="final-cta">
                {content.cta_primary_label || 'Book via WhatsApp'}
              </WhatsAppButton>
            </span>
            <Button to="/book" variant="outline" size="lg">
              {content.cta_secondary_label || 'Send an enquiry'}
            </Button>
          </div>

          <p className={s.ctaNote}>
            Typical reply time: about {settings.reply_time_minutes || '10'} minutes, 24 hours a day.
          </p>
        </div>
      </Container>
    </Section>
  );
}
