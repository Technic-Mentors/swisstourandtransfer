import { SITE_URL, uploadUrl } from '../../config';

/**
 * JSON-LD builders. All structured data is generated in code from page data -
 * there are deliberately no SEO fields in the admin panel.
 */

const abs = (path = '') => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

function imageUrl(path) {
  if (!path) return abs('/logo-scenic.png');
  return uploadUrl(path);
}

/** The business itself. Emitted on every page via the layout. */
export function localBusiness(settings = {}, stats = {}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'TaxiService'],
    '@id': `${SITE_URL}/#business`,
    name: settings.company_name || 'Swiss Tour & Transfer',
    description:
      'Premium private chauffeur and transfer service across Switzerland. Airport transfers, business travel, events, weddings and alpine ski transfers, available 24/7.',
    url: SITE_URL,
    image: abs('/logo-scenic.png'),
    logo: abs('/logo-scenic.png'),
    slogan: settings.tagline || 'Explore · Travel · Arrive',
    priceRange: '$$$',
    areaServed: [
      { '@type': 'Country', name: 'Switzerland' },
      ...['Zurich', 'Geneva', 'Basel', 'Lucerne', 'Bern', 'Lausanne', 'Lugano', 'St. Moritz', 'Zermatt', 'Davos'].map(
        (name) => ({ '@type': 'City', name }),
      ),
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  };

  if (settings.phone) schema.telephone = settings.phone;
  if (settings.email) schema.email = settings.email;

  if (settings.address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: settings.address,
      addressCountry: 'CH',
    };
  }

  const socials = [
    settings.social_instagram,
    settings.social_facebook,
    settings.social_linkedin,
    settings.social_tiktok,
  ].filter(Boolean);
  if (socials.length) schema.sameAs = socials;

  if (stats.total > 0 && stats.average > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(stats.average),
      reviewCount: String(stats.total),
      bestRating: '5',
      worstRating: '1',
    };
  }

  return schema;
}

/** A vehicle, as a Product with a Vehicle sub-type. */
export function vehicleSchema(vehicle, settings = {}) {
  if (!vehicle) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${vehicle.name} with Chauffeur`,
    description:
      vehicle.tagline ||
      `Hire a ${vehicle.name} with a professional chauffeur in Switzerland.`,
    image: (vehicle.photos || []).length
      ? vehicle.photos.map((p) => imageUrl(p.file_path))
      : [imageUrl(vehicle.cover_image)],
    url: abs(`/vehicles/${vehicle.slug}`),
    brand: { '@type': 'Brand', name: settings.company_name || 'Swiss Tour & Transfer' },
    category: vehicle.category_name || 'Chauffeur service',
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Passengers', value: String(vehicle.passengers) },
      { '@type': 'PropertyValue', name: 'Suitcases', value: String(vehicle.suitcases) },
      ...(vehicle.specs || []).map((spec) => ({
        '@type': 'PropertyValue',
        name: spec.spec_label,
        value: spec.spec_value,
      })),
    ],
  };

  schema.offers = {
    '@type': 'Offer',
    priceCurrency: 'CHF',
    availability: 'https://schema.org/InStock',
    url: abs(`/vehicles/${vehicle.slug}`),
    seller: { '@type': 'Organization', name: settings.company_name || 'Swiss Tour & Transfer' },
  };

  if (vehicle.price_from) schema.offers.price = String(vehicle.price_from);

  return schema;
}

/** A service offered by the business. */
export function serviceSchema(service, settings = {}) {
  if (!service) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service.name,
    name: service.name,
    description: service.short_description || service.full_description || '',
    url: abs(`/services/${service.slug}`),
    image: imageUrl(service.image),
    provider: {
      '@type': 'LocalBusiness',
      name: settings.company_name || 'Swiss Tour & Transfer',
      '@id': `${SITE_URL}/#business`,
    },
    areaServed: { '@type': 'Country', name: 'Switzerland' },
  };
}

/** A city landing page, as a service scoped to that city. */
export function citySchema(city, settings = {}) {
  if (!city) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: `Chauffeur service in ${city.name}`,
    name: `Chauffeur Service ${city.name}`,
    description: city.intro || '',
    url: abs(`/chauffeur-service/${city.slug}`),
    provider: {
      '@type': 'LocalBusiness',
      name: settings.company_name || 'Swiss Tour & Transfer',
      '@id': `${SITE_URL}/#business`,
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
      ...(city.lat && city.lng
        ? { geo: { '@type': 'GeoCoordinates', latitude: String(city.lat), longitude: String(city.lng) } }
        : {}),
    },
  };
}

/** FAQ rich result. */
export function faqSchema(faqs = []) {
  if (!faqs.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

/** Breadcrumb trail. Pass [{ name, path }]. */
export function breadcrumbSchema(trail = []) {
  if (!trail.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: abs(crumb.path || '/'),
    })),
  };
}

/** Standalone AggregateRating for the reviews page. */
export function aggregateRatingSchema(stats = {}, settings = {}) {
  if (!stats.total || !stats.average) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.company_name || 'Swiss Tour & Transfer',
    '@id': `${SITE_URL}/#business`,
    url: SITE_URL,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(stats.average),
      reviewCount: String(stats.total),
      bestRating: '5',
      worstRating: '1',
    },
  };
}

/** Individual reviews for the reviews page. */
export function reviewSchema(testimonials = [], settings = {}) {
  if (!testimonials.length) return null;

  return testimonials.slice(0, 10).map((t) => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'LocalBusiness',
      name: settings.company_name || 'Swiss Tour & Transfer',
      '@id': `${SITE_URL}/#business`,
    },
    author: { '@type': 'Person', name: t.customer_name },
    reviewRating: { '@type': 'Rating', ratingValue: String(t.rating), bestRating: '5' },
    reviewBody: t.review_text,
  }));
}
