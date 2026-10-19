import { useCallback, useMemo, useState } from 'react';
import { publicApi } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import { useSite } from '../../context/SiteContext';
import Seo from '../../components/seo/Seo';
import { aggregateRatingSchema, breadcrumbSchema, reviewSchema } from '../../components/seo/schemas';
import { PageHead } from '../../components/layout/PublicLayout';
import { Alert, Container, EmptyState, Rating, Section, Spinner, cx } from '../../components/ui';
import WhatsAppButton from '../../components/ui/WhatsAppButton';
import s from './pages.module.css';

const GoogleMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"
    />
    <path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14z" />
    <path
      fill="#EA4335"
      d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z"
    />
  </svg>
);

const QuoteMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M9.5 6C6.5 7.3 5 9.6 5 13v5h6v-6H8.4c0-2 .7-3.3 2.3-4.1L9.5 6zm9 0C15.5 7.3 14 9.6 14 13v5h6v-6h-2.6c0-2 .7-3.3 2.3-4.1L18.5 6z" />
  </svg>
);

/** Initials for the avatar when a reviewer has no photo. */
function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

/** Each reviewer keeps the same colour between visits, from their name. */
const TONES = ['violet', 'blue', 'emerald', 'amber', 'rose', 'cyan'];
const toneFor = (name = '') =>
  TONES[[...String(name)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TONES.length];

export default function Reviews() {
  const { settings } = useSite();
  const [filter, setFilter] = useState('all');

  const load = useCallback(() => publicApi.testimonials({ limit: 50 }), []);
  const { data, loading, error } = useFetch(load, []);

  const testimonials = data?.testimonials ?? [];
  const stats = data?.stats ?? { total: 0, average: 0 };

  // The breakdown counts the reviews on this page, which is what the bars show.
  const spread = useMemo(() => {
    const counts = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: testimonials.filter((t) => Number(t.rating) === star).length,
    }));
    const max = Math.max(...counts.map((c) => c.count), 1);
    return counts.map((c) => ({ ...c, percent: Math.round((c.count / max) * 100) }));
  }, [testimonials]);

  const shown = useMemo(() => {
    if (filter === 'all') return testimonials;
    if (filter === 'google') return testimonials.filter((t) => t.source === 'google');
    return testimonials.filter((t) => Number(t.rating) === Number(filter));
  }, [testimonials, filter]);

  const googleCount = testimonials.filter((t) => t.source === 'google').length;

  const filters = [
    { key: 'all', label: `All (${testimonials.length})` },
    ...spread
      .filter((row) => row.count > 0)
      .map((row) => ({ key: String(row.star), label: `${row.star} ★ (${row.count})` })),
    ...(googleCount ? [{ key: 'google', label: `Google (${googleCount})` }] : []),
  ];

  return (
    <>
      <Seo
        title="Customer Reviews & Testimonials"
        description={
          stats.total
            ? `Rated ${stats.average} out of 5 from ${stats.total} guest reviews. Read what our chauffeur clients say about airport transfers, business travel and ski journeys in Switzerland.`
            : 'Read what our guests say about our chauffeur service across Switzerland.'
        }
        path="/reviews"
        jsonLd={[
          aggregateRatingSchema(stats, settings),
          reviewSchema(testimonials, settings),
          breadcrumbSchema([{ name: 'Reviews', path: '/reviews' }]),
        ]}
      />

      <PageHead
        trail={[{ name: 'Reviews' }]}
        eyebrow="Client reviews"
        title="What our guests say"
        text="Every review below is from a real journey. We publish the mixed ones too."
      />

      <Section>
        <Container>
          {loading && <Spinner label="Loading reviews" />}
          {error && <Alert tone="error">{error.message}</Alert>}

          {!loading && !error && (
            <>
              {stats.total > 0 && (
                <div className={s.scoreCard}>
                  <div className={s.scoreMain}>
                    <span className={s.scoreValue}>{stats.average}</span>
                    <Rating value={stats.average} />
                    <span className={s.scoreNote}>
                      {stats.total} published {stats.total === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>

                  <div className={s.scoreSpread}>
                    {spread.map((row) => (
                      <div className={s.spreadRow} key={row.star}>
                        <span className={s.spreadStar}>{row.star} ★</span>
                        <span className={s.spreadTrack}>
                          <span className={s.spreadFill} style={{ width: `${row.percent}%` }} />
                        </span>
                        <span className={s.spreadCount}>{row.count}</span>
                      </div>
                    ))}
                  </div>

                  <div className={s.scoreCta}>
                    <p className={s.scoreCtaText}>Ready for your own journey?</p>
                    <WhatsAppButton pageType="reviews" size="sm">
                      Book via WhatsApp
                    </WhatsAppButton>
                  </div>
                </div>
              )}

              {filters.length > 2 && (
                <div className={s.reviewFilters} role="tablist" aria-label="Filter reviews">
                  {filters.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      role="tab"
                      aria-selected={filter === item.key}
                      className={cx(s.reviewChip, filter === item.key && s.reviewChipOn)}
                      onClick={() => setFilter(item.key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {shown.length ? (
                <div className={s.reviewsGrid}>
                  {shown.map((review) => (
                    <article className={s.reviewCard} key={review.id}>
                      <span className={s.reviewQuoteMark} aria-hidden="true">
                        <QuoteMark />
                      </span>

                      <Rating value={review.rating} />

                      <blockquote className={s.reviewText}>{review.review_text}</blockquote>

                      <footer className={s.reviewBy}>
                        <span className={cx(s.reviewAvatar, s[`avatar_${toneFor(review.customer_name)}`])}>
                          {initials(review.customer_name)}
                        </span>

                        <span className={s.reviewWho}>
                          <span className={s.reviewPerson}>{review.customer_name}</span>
                          <span className={s.reviewPlace}>
                            {[review.country, review.service_label].filter(Boolean).join(' · ')}
                          </span>
                        </span>

                        {review.source === 'google' && (
                          <span className={s.reviewBadge} title="Review left on Google">
                            <GoogleMark />
                          </span>
                        )}
                      </footer>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState title="No reviews match this filter">
                  Choose another rating, or read them all.
                </EmptyState>
              )}
            </>
          )}
        </Container>
      </Section>
    </>
  );
}
