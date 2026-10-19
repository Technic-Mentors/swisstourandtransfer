import { useCallback } from 'react';
import { uploadUrl } from '../../config';
import { publicApi } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import { useSite } from '../../context/SiteContext';
import Seo from '../../components/seo/Seo';
import { breadcrumbSchema, localBusiness } from '../../components/seo/schemas';
import { PageHead } from '../../components/layout/PublicLayout';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button,
  Container,
  Rating,
  Section,
  SectionHeading,
  Spinner,
  cx,
} from '../../components/ui';
import WhatsAppButton from '../../components/ui/WhatsAppButton';
import CountUp from '../../components/ui/CountUp';
import { reveal, spotlight } from '../../components/home/sections';
import hs from '../../components/home/home.module.css';
import s from './pages.module.css';

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
        publicApi.faqs(),
      ]),
    [],
  );
  const { data, loading, error } = useFetch(load, []);

  const [about, home, serviceData, cityData, reviewData, faqData] = data ?? [];
  const content = about?.content ?? {};
  const stats = about?.lists?.stat_items ?? [];
  const values = home?.lists?.why_items ?? [];
  const steps = home?.lists?.how_steps ?? [];
  const services = serviceData?.services ?? [];
  const cities = cityData?.cities ?? [];
  const reviews = reviewData?.testimonials ?? [];
  const faqs = faqData?.faqs ?? [];

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
              {/* Only the photo the admin actually uploaded - this page says
                  who we are, so it must not fall back to a stock car. */}
              {content.image && (
                <img
                  className={cx(s.aboutImage, s.aboutImageIn)}
                  src={uploadUrl(content.image)}
                  alt="Swiss Tour & Transfer chauffeurs and vehicles"
                  width="1200"
                  height="514"
                />
              )}

              {/* One centred column: the text still reads left to right. */}
              <div ref={reveal} className={cx(s.aboutBody, hs.xReveal)}>
                {(content.body || '').split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* The stat cells carry their own staggered entrance, so the
                  row only needs to fade in as one when it is scrolled to. */}
              {stats.length > 0 && (
                <div ref={reveal} className={cx(s.statRow, hs.xReveal)}>
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
                  <div ref={reveal} className={hs.xReveal}>
                    <SectionHeading eyebrow="What we stand for" title="The promises behind every journey" center />
                  </div>
                  <div ref={reveal} className={cx(s.valueGrid, hs.xStagger)}>
                    {values.map(([title, text], i) => (
                      <div
                        className={cx(s.valueCard, hs.xLift, hs.xSpot, hs.xGloss)}
                        onMouseMove={spotlight}
                        key={title || i}
                      >
                        <span className={s.valueNum}>{String(i + 1).padStart(2, '0')}</span>
                        <h3 className={s.valueTitle}>{title}</h3>
                        <p className={s.valueText}>{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {steps.length > 0 && (
                <div className={s.aboutBlock}>
                  <div ref={reveal} className={hs.xReveal}>
                    <SectionHeading
                      eyebrow="How we work"
                      title="Three steps, one message"
                      center
                    />
                  </div>
                  <div ref={reveal} className={cx(s.valueGrid, hs.xStagger)}>
                    {steps.map(([title, text], i) => (
                      <div
                        className={cx(s.valueCard, hs.xLift, hs.xSpot, hs.xGloss)}
                        onMouseMove={spotlight}
                        key={title || i}
                      >
                        <span className={s.valueNum}>STEP {String(i + 1).padStart(2, '0')}</span>
                        <h3 className={s.valueTitle}>{title}</h3>
                        <p className={s.valueText}>{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {services.length > 0 && (
                <div className={s.aboutBlock}>
                  <div ref={reveal} className={hs.xReveal}>
                    <SectionHeading eyebrow="What we do" title="Every kind of journey" center />
                  </div>
                  <div ref={reveal} className={cx(s.aboutChips, hs.xStagger)}>
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
                  <div ref={reveal} className={hs.xReveal}>
                    <SectionHeading eyebrow="Where we drive" title="Across Switzerland" center />
                  </div>
                  <div ref={reveal} className={cx(s.cityGrid, hs.xStagger)}>
                    {cities.map((city) => (
                      <Link
                        key={city.id}
                        to={`/chauffeur-service/${city.slug}`}
                        className={cx(s.cityCard, hs.xLift, hs.xSpot, hs.xGloss)}
                        onMouseMove={spotlight}
                      >
                        <span className={s.cityName}>{city.name}</span>
                        {city.hub_label && <span className={s.cityNote}>{city.hub_label}</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {reviews.length > 0 && (
                <div className={s.aboutBlock}>
                  <div ref={reveal} className={hs.xReveal}>
                    <SectionHeading eyebrow="In our guests' words" title="Recently, on the road" center />
                  </div>
                  <div ref={reveal} className={cx(s.aboutReviews, hs.xStagger)}>
                    {reviews.map((review) => (
                      <figure
                        className={cx(s.aboutReview, hs.xLift, hs.xGloss)}
                        key={review.id}
                      >
                        <Rating value={review.rating} className={hs.xStars} />
                        <blockquote>{review.review_text}</blockquote>
                        <figcaption>
                          {review.customer_name}
                          {review.country ? ` · ${review.country}` : ''}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                  <div className={s.aboutMore}>
                    <Link to="/reviews" className={cx(s.aboutMoreLink, hs.xArrow)}>
                      Read all reviews →
                    </Link>
                  </div>
                </div>
              )}

              {faqs.length > 0 && (
                <div className={s.aboutBlock}>
                  <div ref={reveal} className={hs.xReveal}>
                    <SectionHeading eyebrow="Questions" title="Before you book" center />
                  </div>
                  <div ref={reveal} className={cx(hs.faqList, hs.xStagger)}>
                    {faqs.slice(0, 5).map((faq) => (
                      <details className={cx(hs.faqItem, hs.xFaq)} key={faq.id}>
                        <summary className={hs.faqQ}>
                          {faq.question}
                          <span className={cx(hs.faqSign, hs.xSign)} aria-hidden="true">
                            +
                          </span>
                        </summary>
                        <div className={cx(hs.faqA, hs.xAns)}>{faq.answer}</div>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              <div className={s.aboutActions}>
                <span className={hs.xCtaPulse}>
                  <WhatsAppButton pageType="about">Book via WhatsApp</WhatsAppButton>
                </span>
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
