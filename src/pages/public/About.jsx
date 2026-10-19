import { useCallback, useEffect, useRef, useState } from 'react';
import { imageFallback, imageUrl } from '../../config';
import { publicApi } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import { useSite } from '../../context/SiteContext';
import Seo from '../../components/seo/Seo';
import { breadcrumbSchema, localBusiness } from '../../components/seo/schemas';
import { PageHead } from '../../components/layout/PublicLayout';
import { Link } from 'react-router-dom';
import { Alert, Button, Container, Rating, Section, SectionHeading, Spinner } from '../../components/ui';
import WhatsAppButton from '../../components/ui/WhatsAppButton';
import s from './pages.module.css';

/**
 * Splits "15+", "24/7" or "4.9" into the part that can count up and the text
 * around it, so a label keeps its shape while the number animates.
 */
function parseStat(raw) {
  const match = String(raw ?? '').match(/^(\D*?)(\d+(?:[.,]\d+)?)(.*)$/);
  if (!match) return { prefix: String(raw ?? ''), value: null, suffix: '', decimals: 0 };

  const [, prefix, digits, suffix] = match;
  const normalised = digits.replace(',', '.');
  const decimals = normalised.includes('.') ? normalised.split('.')[1].length : 0;
  return { prefix, value: Number(normalised), suffix, decimals };
}

/** Counts from zero to the figure once, the first time it is scrolled to. */
function CountUp({ raw, duration = 1100 }) {
  const { prefix, value, suffix, decimals } = parseStat(raw);
  const ref = useRef(null);
  const [shown, setShown] = useState(value === null ? null : 0);

  useEffect(() => {
    const el = ref.current;
    if (!el || value === null) return undefined;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      setShown(value);
      return undefined;
    }

    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();

        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          // Ease out, so it slows into the final figure instead of stopping dead.
          setShown(value * (1 - (1 - t) ** 3));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  if (value === null) return <span ref={ref}>{prefix}</span>;

  return (
    <span ref={ref}>
      {prefix}
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function About() {
  const { settings } = useSite();

  // The extra sections reuse what the admin already maintains elsewhere, so
  // nothing on this page is written twice or invented.
  const load = useCallback(
    () =>
      Promise.all([
        publicApi.page('about'),
        publicApi.home(),
        publicApi.services(),
        publicApi.cities(),
        publicApi.testimonials({ featured: 1, limit: 3 }),
      ]),
    [],
  );
  const { data, loading, error } = useFetch(load, []);

  const [about, home, serviceData, cityData, reviewData] = data ?? [];
  const content = about?.content ?? {};
  const stats = about?.lists?.stat_items ?? [];
  const values = home?.lists?.why_items ?? [];
  const services = serviceData?.services ?? [];
  const cities = cityData?.cities ?? [];
  const reviews = reviewData?.testimonials ?? [];

  return (
    <>
      <Seo
        title="About Us — A Swiss Chauffeur Company"
        description={
          content.intro ||
          'Swiss Tour & Transfer provides private chauffeur and transfer services across Switzerland, built on punctuality, discretion and immaculate vehicles.'
        }
        path="/about"
        jsonLd={[localBusiness(settings), breadcrumbSchema([{ name: 'About', path: '/about' }])]}
      />

      <div className={s.aboutPage}>
        <PageHead
          trail={[{ name: 'About' }]}
          eyebrow="About us"
          title={content.heading || 'About Swiss Tour & Transfer'}
          text={content.intro}
        />

        <Section>
          <Container>
          {loading && <Spinner label="Loading" />}
          {error && <Alert tone="error">{error.message}</Alert>}

          {!loading && !error && (
            <>
              <img
                className={s.aboutImage}
                src={imageUrl(content.image)}
                onError={imageFallback}
                alt="Swiss Tour & Transfer chauffeurs and vehicles"
                width="1200"
                height="514"
              />

              {/* One centred column: the text still reads left to right. */}
              <div className={s.aboutBody}>
                {(content.body || '').split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {stats.length > 0 && (
                <div className={s.statRow}>
                  {stats.map(([value, label], index) => (
                    <div
                      className={s.statCell}
                      key={label || value}
                      style={{ '--stat-index': index }}
                    >
                      <span className={s.statRail} aria-hidden="true" />
                      <div className={s.statValue}>
                        <CountUp raw={value} />
                      </div>
                      <span className={s.statLabel}>{label}</span>
                    </div>
                  ))}
                </div>
              )}

              {values.length > 0 && (
                <div className={s.aboutBlock}>
                  <SectionHeading eyebrow="What we stand for" title="The promises behind every journey" center />
                  <div className={s.valueGrid}>
                    {values.map(([title, text], i) => (
                      <div className={s.valueCard} key={title || i}>
                        <span className={s.valueNum}>{String(i + 1).padStart(2, '0')}</span>
                        <h3 className={s.valueTitle}>{title}</h3>
                        <p className={s.valueText}>{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {services.length > 0 && (
                <div className={s.aboutBlock}>
                  <SectionHeading eyebrow="What we do" title="Every kind of journey" center />
                  <div className={s.aboutChips}>
                    {services.map((service) => (
                      <Link key={service.id} to={`/services/${service.slug}`} className={s.aboutChip}>
                        {service.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {cities.length > 0 && (
                <div className={s.aboutBlock}>
                  <SectionHeading eyebrow="Where we drive" title="Across Switzerland" center />
                  <div className={s.cityGrid}>
                    {cities.map((city) => (
                      <Link key={city.id} to={`/chauffeur-service/${city.slug}`} className={s.cityCard}>
                        <span className={s.cityName}>{city.name}</span>
                        {city.hub_label && <span className={s.cityNote}>{city.hub_label}</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {reviews.length > 0 && (
                <div className={s.aboutBlock}>
                  <SectionHeading eyebrow="In our guests' words" title="Recently, on the road" center />
                  <div className={s.aboutReviews}>
                    {reviews.map((review) => (
                      <figure className={s.aboutReview} key={review.id}>
                        <Rating value={review.rating} />
                        <blockquote>{review.review_text}</blockquote>
                        <figcaption>
                          {review.customer_name}
                          {review.country ? ` · ${review.country}` : ''}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                  <div className={s.aboutMore}>
                    <Link to="/reviews" className={s.aboutMoreLink}>
                      Read all reviews →
                    </Link>
                  </div>
                </div>
              )}

              <div className={s.aboutActions}>
                <WhatsAppButton pageType="about">Book via WhatsApp</WhatsAppButton>
                <Button to="/vehicles" variant="outline">
                  View our vehicles
                </Button>
              </div>
            </>
          )}
          </Container>
        </Section>
      </div>
    </>
  );
}
