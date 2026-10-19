import { useCallback } from 'react';
import { publicApi } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import { useSite } from '../../context/SiteContext';
import Seo from '../../components/seo/Seo';
import { faqSchema, localBusiness } from '../../components/seo/schemas';
import { Alert, Container, Spinner } from '../../components/ui';
import home_s from '../../components/home/home.module.css';
import {
  CategoriesSection,
  FaqSection,
  FeaturedVehiclesSection,
  FinalCtaSection,
  GallerySection,
  HeroSection,
  HowItWorksSection,
  QuickBookingSection,
  ReviewsSection,
  SeasonalOfferSection,
  ServicesSection,
  TrustStrip,
  WhyChooseUsSection,
} from '../../components/home/sections';

const SECTION_COMPONENTS = {
  hero: (p) => <HeroSection {...p} />,
  quick_booking: (p) => <QuickBookingSection {...p} />,
  trust_strip: (p) => <TrustStrip {...p} />,
  categories: (p) => <CategoriesSection {...p} />,
  featured_vehicles: (p) => <FeaturedVehiclesSection {...p} />,
  services: (p) => <ServicesSection {...p} />,
  why_choose_us: (p) => <WhyChooseUsSection {...p} />,
  how_it_works: (p) => <HowItWorksSection {...p} />,
  seasonal_offer: (p) => <SeasonalOfferSection {...p} />,
  reviews: (p) => <ReviewsSection {...p} />,
  gallery: (p) => <GallerySection {...p} />,
  faq: (p) => <FaqSection {...p} />,
  final_cta: (p) => <FinalCtaSection {...p} />,
};

export default function Home() {
  const { settings } = useSite();

  const load = useCallback(
    () =>
      Promise.all([
        publicApi.home(),
        publicApi.categories(),
        publicApi.vehicles({ featured: 1, limit: 6 }),
        publicApi.vehicles({ limit: 60 }),
        publicApi.services({ homepage: 1 }),
        publicApi.testimonials({ featured: 1, limit: 6 }),
        publicApi.photos({ limit: 6 }),
        publicApi.faqs(),
        publicApi.promotions({ placement: 'homepage_banner' }),
        publicApi.cities(),
      ]),
    [],
  );

  const { data, loading, error } = useFetch(load, []);

  if (loading) return <Spinner label="Loading homepage" />;

  if (error) {
    return (
      <Container>
        <div style={{ padding: '80px 0' }}>
          <Alert tone="error">
            {error.message} — make sure the API is running on port 3010.
          </Alert>
        </div>
      </Container>
    );
  }

  const [home, cats, featured, allVehicles, services, reviews, gallery, faqs, promos, cities] = data;

  const shared = {
    content: home.content,
    lists: home.lists,
    settings,
    categories: cats.categories,
    vehicles: featured.vehicles,
    allVehicles: allVehicles.vehicles,
    services: services.services,
    testimonials: reviews.testimonials,
    stats: reviews.stats,
    photos: gallery.photos,
    faqs: faqs.faqs,
    promotion: promos.promotions[0] || null,
    cities: cities.cities,
  };

  return (
    <>
      <Seo
        title="Private Chauffeur & Airport Transfers in Switzerland"
        bare={false}
        description={
          home.content.hero_text ||
          'Premium chauffeur service across Switzerland. Airport transfers, business travel, events and city-to-city rides. Book via WhatsApp, 24/7.'
        }
        path="/"
        jsonLd={[localBusiness(settings, reviews.stats), faqSchema(faqs.faqs)]}
      />

      <div className={home_s.flow}>
        {home.sections.map((key) => {
          const render = SECTION_COMPONENTS[key];
          if (!render) return null;

          const props =
            key === 'quick_booking' ? { ...shared, vehicles: shared.allVehicles } : shared;

          return <div key={key}>{render(props)}</div>;
        })}
      </div>
    </>
  );
}