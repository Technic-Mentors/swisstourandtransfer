/**
 * Static stand-in content for the whole public site.
 *
 * Mirrors Backend/db/seed.sql so every page renders completely even when the
 * API is unreachable, the database is empty, or a table has no rows yet.
 * resources.js falls back to these shapes automatically - pages and components
 * never need to know whether the data came from the API or from here.
 *
 * Shapes match the public controllers exactly, including the fields the SQL
 * derives (vehicle_count, min/max_passengers, examples, cover_image). Vehicle
 * and service photos are bundled in /public/images/vehicles.
 */

/* ------------------------------------------------------------- settings */

export const settings = {
  /* wa.me wants the country code with no + and no leading 00. */
  whatsapp_number: '41782276222',
  whatsapp_template_vehicle:
    'Hello, I would like to book the {vehicle}.\nPickup: \nDate: \nPassengers: ',
  whatsapp_template_general: 'Hello, I would like to enquire about a chauffeur service.',
  whatsapp_template_city: 'Hello, I would like a chauffeur in {city}.\nPickup: \nDate: ',
  whatsapp_template_service: 'Hello, I would like to enquire about {service}.\nPickup: \nDate: ',
  show_floating_whatsapp: '1',
  show_sticky_mobile_bar: '1',

  company_name: 'Swiss Tour & Transfer',
  tagline: 'Explore · Travel · Arrive',
  /* Shown as written; tel: links strip the spaces. */
  phone: '+41 78 227 62 22',
  email: 'support@swisstourtransfer.com',
  /* Kept on two lines, the way it is printed; anything machine-read turns
     the break back into a comma. */
  address: 'Am Luchsgraben 16\n8051 Zurich, Switzerland',
  registration_number: 'CHE-240.981.004',
  opening_hours: 'Open 24/7',
  maps_embed_url:
    'https://www.google.com/maps?q=Am%20Luchsgraben%2016%2C%208051%20Zurich%2C%20Switzerland&output=embed',
  maps_link: 'https://maps.google.com/?q=Am+Luchsgraben+16,+8051+Zurich,+Switzerland',

  social_instagram: 'https://instagram.com/',
  social_facebook: 'https://facebook.com/',
  social_linkedin: 'https://linkedin.com/',
  social_tiktok: '',

  announcement_enabled: '0',
  announcement_link: '/offers',

  google_rating: '4.9',
  google_review_count: '127',
  reply_time_minutes: '10',
};

/* -------------------------------------------------------- content blocks */

/** Same pipe format the admin panel stores, so parsing stays identical. */
function parseItems(value) {
  if (!value) return [];
  const raw = String(value);
  if (raw.includes('||')) {
    return raw.split('||').map((group) => group.split('|').map((part) => part.trim()));
  }
  return raw.split('|').map((part) => [part.trim()]);
}

export const homeSections = [
  'hero',
  'quick_booking',
  'trust_strip',
  'categories',
  'featured_vehicles',
  'services',
  'why_choose_us',
  'how_it_works',
  'seasonal_offer',
  'reviews',
  'gallery',
  'faq',
  'final_cta',
];

export const homeContent = {
  hero_eyebrow: 'Chauffeur & limousine service · Switzerland',
  hero_headline: 'Arrive in quiet luxury, anywhere in Switzerland.',
  hero_text:
    'Airport transfers, business travel, events and city-to-city rides in Zurich, Geneva, Basel, St. Moritz and beyond - 24/7.',
  hero_image: '',
  hero_primary_label: 'BOOK VIA WHATSAPP',
  hero_secondary_label: 'VIEW OUR VEHICLES',

  trust_items:
    'Available 24/7, 365 days|Fixed, all-inclusive prices|Free flight tracking and waiting|Multilingual professional chauffeurs|Rated {rating} by {count} guests',

  categories_eyebrow: 'FLEET CATEGORIES',
  categories_heading: 'The right car for every journey',
  categories_text:
    'From a discreet business saloon to a six-seat van for the whole family and their skis.',

  vehicles_eyebrow: 'OUR FLEET',
  vehicles_heading: 'A fleet kept immaculate',
  vehicles_text:
    'Every car is late model, immaculate and driven by a vetted professional chauffeur.',

  services_eyebrow: 'SERVICES',
  services_heading: 'Every journey, handled with Swiss precision',
  services_text: 'Airport, business, events, weddings and alpine ski transfers across Switzerland.',

  why_eyebrow: 'WHY CHOOSE US',
  why_heading: 'Discretion, punctuality, comfort',
  why_items:
    'Fixed prices|The price we quote is the price you pay. No surge, no detour charges, no surprises.||Flight tracking|We monitor your arrival and adjust the pickup time for delays at no extra cost.||Professional chauffeurs|Vetted, discreet and multilingual - English, German, French and Italian.||Immaculate fleet|Late-model Mercedes cars, cleaned and checked before every single journey.||Always reachable|A real person answers on WhatsApp, day or night, 365 days a year.||Door to door|From your chalet to the terminal kerb, or the terminal kerb to your meeting.',

  how_eyebrow: 'HOW BOOKING WORKS',
  how_heading: 'Three steps, one message',
  how_steps:
    'Send your details|Tap the WhatsApp button and tell us where, when and how many of you there are.||Get a fixed price|We confirm the vehicle, the chauffeur and an all-inclusive price - usually within minutes.||Travel|Your chauffeur arrives early, tracks your flight and takes you door to door.',

  reviews_eyebrow: 'CLIENT REVIEWS',
  reviews_heading: 'What our guests say',

  gallery_eyebrow: 'GALLERY',
  gallery_heading: 'The fleet, the roads, the moments',

  faq_eyebrow: 'QUESTIONS',
  faq_heading: 'Frequently asked questions',

  cta_heading: 'Ready when you are',
  cta_text: 'Send one message and we will confirm your chauffeur, your vehicle and a fixed price.',
  cta_primary_label: 'BOOK VIA WHATSAPP',
  cta_secondary_label: 'SEND AN ENQUIRY',

  quick_booking_heading: 'Get a price in one message',
};

export const pageContent = {
  about: {
    heading: 'About Swiss Tour & Transfer',
    intro:
      'A Swiss chauffeur company built on punctuality, discretion and vehicles kept to a standard our guests notice.',
    body: 'Swiss Tour & Transfer provides private chauffeur and transfer services across Switzerland. We began with a single Mercedes and a simple promise: be early, be immaculate, and quote a price that does not change.\n\nToday we operate across Zurich, Geneva, Basel, Lucerne, Bern, Lausanne, Lugano, St. Moritz, Zermatt and Davos, serving business travellers, families, wedding parties and winter-sports guests. Our chauffeurs are vetted professionals who speak English, German, French and Italian, know the alpine passes in February, and understand that the best journey is one you do not have to think about.\n\nWhether it is a 05:00 run to ZRH, a week of meetings in Geneva, or a convoy for WEF Davos, the same standard applies.',
    image: '',
    stat_items:
      '15+|Years of combined chauffeur experience||10|Swiss cities served||24/7|Available every day of the year||4.9|Average guest rating',
  },
  footer: {
    tagline: 'Explore · Travel · Arrive',
    description:
      'Premium private chauffeur and transfer services across Switzerland. Airport transfers, business travel, events and alpine ski transfers - available 24/7.',
  },
  privacy: {
    heading: 'Privacy policy',
    body: 'This privacy policy explains how Swiss Tour & Transfer collects and uses personal data in line with the Swiss Federal Act on Data Protection (revDSG) and the GDPR.\n\n[Replace this text with your full privacy policy. Cover: what data you collect through the enquiry form and WhatsApp, why you collect it, how long you keep it, who you share it with, and how a guest can request deletion.]',
  },
  terms: {
    heading: 'Terms and conditions',
    body: '[Replace this text with your booking terms. Cover: how a booking is confirmed, what the quoted price includes, waiting time, cancellation windows and charges, luggage and child seats, liability, and payment methods.]',
  },
  impressum: {
    heading: 'Impressum',
    body: 'Swiss Tour & Transfer\nAm Luchsgraben 16\n8051 Zurich\nSwitzerland\n\nPhone: +41 78 227 62 22\nEmail: support@swisstourtransfer.com\n\n[Add your commercial register number (CHE-...), VAT number and the name of the person responsible for the content of this website.]',
  },
};

/* ------------------------------------------------------------------ faqs */

export const faqs = [
  {
    id: 1,
    question: 'How do I book?',
    answer:
      'Tap "Book via WhatsApp" on any vehicle and your message opens with the vehicle name already filled in. Tell us the pickup, destination, date and number of passengers, and we reply with a fixed price. You can also use the enquiry form if you prefer email.',
  },
  {
    id: 2,
    question: 'Do you track flights?',
    answer:
      'Yes. We monitor your arrival and adjust the pickup time for delays at no extra cost. Your chauffeur waits with a name sign in the arrivals hall.',
  },
  {
    id: 3,
    question: 'What is included in the price?',
    answer:
      'The quoted price is all-inclusive: vehicle, professional chauffeur, fuel, tolls, motorway vignette, parking at the airport, and 60 minutes of free waiting time on airport pickups.',
  },
  {
    id: 4,
    question: 'Which payment methods do you accept?',
    answer:
      'We accept all major cards, TWINT, bank transfer, and invoicing for corporate accounts. Payment is taken after the journey unless agreed otherwise.',
  },
  {
    id: 5,
    question: 'Can you provide child seats?',
    answer:
      'Yes, baby seats, child seats and booster seats are available free of charge. Tell us the ages of the children when you book so we bring the right ones.',
  },
  {
    id: 6,
    question: 'What is your cancellation policy?',
    answer:
      'Cancellations made more than 24 hours before the pickup time are free of charge. Within 24 hours a fee may apply.',
  },
];

/* --------------------------------------------------------------- vehicles */

/** vehicle id -> city ids, exactly as the vehicle_cities seed rows. */
const VEHICLE_CITIES = {
  1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  2: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  3: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  4: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};

/* Every vehicle carries the same three promises, so they open each spec
   table and whatever is listed after them is what actually differs. */
const INCLUDED = [
  ['Meet & Greet', 'Included'],
  ['Wifi on Board', 'Included'],
  ['Mineral Water', 'Included'],
];

const SPECS = {
  1: [...INCLUDED, ['Class', 'Comfort hybrid'], ['Transmission', 'Automatic'], ['Winter equipment', 'Snow tyres November to April']],
  2: [...INCLUDED, ['Class', 'Business saloon'], ['Transmission', 'Automatic'], ['Rear seats', 'Heated leather'], ['Winter equipment', 'Snow tyres November to April']],
  3: [...INCLUDED, ['Class', 'First Class saloon'], ['Transmission', 'Automatic'], ['Rear seats', 'Heated, ventilated, massage'], ['Winter equipment', 'Snow tyres November to April']],
  4: [...INCLUDED, ['Class', 'Premium van'], ['Layout', 'Extra long wheelbase'], ['Seating', 'Seven individual seats'], ['Winter equipment', 'Snow tyres November to April']],
};

export const vehicles = [
  {
    id: 1,
    category_id: 1,
    name: 'Toyota Prius or Similar',
    slug: 'toyota-prius',
    tagline: 'Comfortable hybrid travel for airport transfers and everyday journeys.',
    description:
      'Travel comfortably in a Toyota Prius or similar, a practical hybrid choice for airport transfers, hotel pickups and city journeys. With space for up to three passengers, it suits solo travellers, couples and small parties.\n\nEnjoy a private door-to-door journey with a professional chauffeur, a welcoming meet and greet and a fixed quote agreed before you travel.',
    passengers: 3,
    suitcases: 3,
    hand_bags: 3,
    price_from: null,
    price_unit: 'hour',
    price_note: 'Price on request',
    ideal_for: ['Airport transfers', 'City journeys', 'Everyday travel', 'Solo and pair travel'],
    whatsapp_template: null,
    is_featured: 1,
    sort_order: 1,
    category_name: 'Comfort',
    category_slug: 'comfort',
    cover_image: '/images/vehicles/toyota-prius.png',
  },
  {
    id: 2,
    category_id: 2,
    name: 'Mercedes-Benz E-Class',
    slug: 'mercedes-e-class',
    tagline: 'The business saloon - comfortable, understated and sized for three with luggage.',
    description:
      'The E Class is the workhorse of Swiss business travel, and deliberately so. It is comfortable enough for a two-hour transfer, understated enough for any address, and carries three passengers with two suitcases.\n\nMost of our airport transfers and city-to-city journeys run in an E Class. It is the one to book when you want a professional chauffeur and an immaculate car with comfort and punctuality at every stage of your journey.',
    passengers: 3,
    suitcases: 2,
    hand_bags: 3,
    price_from: null,
    price_unit: 'hour',
    price_note: 'Price on request',
    ideal_for: ['Airport transfers', 'Daily business travel', 'City-to-city journeys', 'Hourly hire'],
    whatsapp_template: null,
    is_featured: 1,
    sort_order: 2,
    category_name: 'Business',
    category_slug: 'business',
    cover_image: '/images/vehicles/mercedes-benz-eclass.webp',
  },
  {
    id: 3,
    category_id: 3,
    name: 'Mercedes-Benz S-Class',
    slug: 'mercedes-s-class',
    tagline: 'The benchmark for executive comfort - whisper-quiet, spacious and discreet.',
    description:
      'The S Class is the car our most demanding guests ask for by name. The rear cabin is quiet enough to take a call at motorway speed, the seats recline, and the ride smooths out everything the road does.\n\nIt is the right choice for airport runs where you need to work, for board-level guests, and for any journey where the car is part of the impression.',
    passengers: 3,
    suitcases: 2,
    hand_bags: 3,
    price_from: null,
    price_unit: 'hour',
    price_note: 'Price on request',
    ideal_for: ['Executive travel', 'Airport transfers', 'Board meetings', 'Discreet VIP journeys'],
    whatsapp_template: null,
    is_featured: 1,
    sort_order: 3,
    category_name: 'First Class',
    category_slug: 'first-class',
    cover_image: '/images/vehicles/mercedes-benz-sclass.png',
  },
  {
    id: 4,
    category_id: 4,
    name: 'Mercedes-Benz V-Class',
    slug: 'mercedes-v-class',
    tagline: 'Seven seats, seven bags and a cabin you can hold a meeting in.',
    description:
      'The extra long V Class is the most versatile vehicle we run. Seven passengers travel in individual seats with room to spare, and the luggage bay takes a family holiday, a ski week or a film crew.\n\nIt is our most requested vehicle for ski transfers, family journeys and any airport run where the luggage matters as much as the people.',
    passengers: 7,
    suitcases: 7,
    hand_bags: 7,
    price_from: null,
    price_unit: 'hour',
    price_note: 'Price on request',
    ideal_for: ['Families and groups', 'Ski transfers', 'Airport runs with luggage', 'Mobile meetings'],
    whatsapp_template: null,
    is_featured: 1,
    sort_order: 4,
    category_name: 'Premium',
    category_slug: 'premium',
    cover_image: '/images/vehicles/mercedes-benz-vclass.webp',
  },
];

/* ------------------------------------------------------------- categories */
/* These are service classes rather than body styles, which is why the same
   model appears in more than one of them. */

const CATEGORY_ROWS = [
  [1, 'Comfort', 'comfort', 'Comfortable, efficient cars for everyday transfers and city journeys.'],
  [2, 'Business', 'business', 'Executive saloons and vans for meetings, airport runs and group travel.'],
  [3, 'First Class', 'first-class', 'Flagship saloons and the latest vans, for the journeys that matter most.'],
  [4, 'Premium', 'premium', 'Our top specification, including reclining VIP seating, for special occasions.'],
];

export const categories = CATEGORY_ROWS.map(([id, name, slug, description], i) => {
  const members = vehicles.filter((v) => v.category_id === id);
  const seats = members.map((v) => v.passengers);

  return {
    id,
    name,
    slug,
    description,
    image: members[0]?.cover_image || '',
    sort_order: i + 1,
    vehicle_count: members.length,
    min_passengers: seats.length ? Math.min(...seats) : null,
    max_passengers: seats.length ? Math.max(...seats) : null,
    examples: members.map((v) => v.name).join(' · ') || null,
    sample_image: members[0]?.cover_image || '',
  };
});

/* --------------------------------------------------------------- services */

export const services = [
  {
    id: 1,
    name: 'Airport Transfers',
    slug: 'airport-transfers',
    short_description: 'Meet-and-greet at ZRH, GVA and BSL with free flight tracking.',
    full_description:
      'Our most requested service. Your chauffeur tracks your flight, adjusts for delays at no extra cost, and waits in the arrivals hall with a name sign. Luggage is handled for you and the car is already warm in winter.\n\nWe cover Zurich (ZRH), Geneva (GVA), EuroAirport Basel (BSL), Bern, Lugano, Sion and Samedan, plus cross-border runs to Milan Malpensa and Munich. Departure transfers are timed to the check-in window for your airline and terminal.',
    included: [
      'Meet-and-greet in the arrivals hall',
      'Free flight tracking and delay adjustment',
      '60 minutes free waiting time',
      'All tolls, parking and vignette included',
      'Luggage assistance',
      'Child seats on request',
    ],
    image: '/airport-transfer.png',
    icon: null,
    price_text: 'Fixed price per journey',
    sort_order: 1,
  },
  {
    id: 2,
    name: 'Hourly Chauffeur',
    slug: 'hourly-chauffeur',
    short_description: 'A car and chauffeur at your disposal, by the hour or by the day.',
    full_description:
      'When the day has several stops, or the schedule is likely to move, hourly hire is simpler than booking individual transfers. The car and chauffeur stay with you, luggage and coats stay in the vehicle, and you leave when you are ready rather than when the next booking says so.\n\nUsed most often for roadshows, property viewings, shopping days and conference schedules. Minimum booking is three hours.',
    included: [
      'Dedicated car and chauffeur',
      'Unlimited stops within the hire',
      'Waiting time included',
      'All fuel, tolls and parking',
      'Itinerary changes on the day',
      'Minimum three hours',
    ],
    image: '/hourly-chauffeur.png',
    icon: null,
    price_text: 'Hourly rate, minimum 3 hours',
    sort_order: 2,
  },
  {
    id: 3,
    name: 'Private Transfers',
    slug: 'city-to-city',
    short_description: 'Door-to-door across Switzerland and on to Milan, Munich and Lyon.',
    full_description:
      'A private alternative to the train for journeys where the luggage, the timing or the company makes the carriage impractical. Door to door, no changes, and you can work or sleep the whole way.\n\nCommon routes include Zurich to St. Moritz, Geneva to Zermatt, Zurich to Davos, Basel to Lucerne, and cross-border runs to Milan, Munich, Lyon and Stuttgart.',
    included: [
      'Direct door-to-door journey',
      'Fixed all-inclusive price',
      'All tolls, vignettes and border formalities',
      'Comfort stops on request',
      'Wi-Fi on board',
      'Snow tyres and chains in winter',
    ],
    image: '/private-transfers.png',
    icon: null,
    price_text: 'Fixed price per route',
    sort_order: 3,
  },
  {
    id: 4,
    name: 'Business Travel',
    slug: 'business-travel',
    short_description: 'Discreet, punctual transport for executives and roadshows.',
    full_description:
      'Corporate travel where reliability matters more than anything else. We hold standing arrangements for regular routes, handle multi-vehicle roadshows, and invoice monthly against a cost centre.\n\nChauffeurs assigned to corporate accounts are briefed on discretion, sign confidentiality agreements where required, and are used to working around a schedule that changes during the day.',
    included: [
      'Account billing and monthly invoicing',
      'Named chauffeurs for regular routes',
      'Multi-vehicle coordination',
      'Confidentiality agreements on request',
      'Wi-Fi and charging at every seat',
      'Priority booking for account holders',
    ],
    image: '/business-travel.png',
    icon: null,
    price_text: 'Corporate rates on account',
    sort_order: 4,
  },
  {
    id: 5,
    name: 'Events & WEF',
    slug: 'events-and-wef',
    short_description: 'Vehicle coordination for WEF Davos, Art Basel and galas.',
    full_description:
      'Event transport is a logistics problem before it is a driving one. We plan arrival windows, stage vehicles near the venue, and run a single point of contact who knows where every car is.\n\nWe have operated at WEF Davos, Art Basel, the Montreux Jazz Festival, Geneva Motor Show and private galas. For WEF specifically, our chauffeurs are briefed on the access zones and the security procedures.',
    included: [
      'Single coordinator for every vehicle',
      'Vehicles staged near the venue',
      'Access and security briefing',
      'Real-time schedule changes',
      'Branded or unmarked vehicles',
      'Overnight and standby cover',
    ],
    image: '/event-transfers.png',
    icon: null,
    price_text: 'Quoted per event',
    sort_order: 5,
  },
  {
    id: 6,
    name: 'Weddings',
    slug: 'weddings',
    short_description: 'Prestige cars, ribbons and a chauffeur for your day.',
    full_description:
      'One car for the couple, more for the party, and a chauffeur who has done this often enough to stay invisible until the moment he is needed.\n\nWe decorate the car to your colours, arrive early for photographs, and keep to a timeline agreed in advance with you or your planner. A second vehicle can shuttle guests between the ceremony and the reception.',
    included: [
      'Decorated car in your colours',
      'Early arrival for photographs',
      'Timeline agreed in advance',
      'Champagne on ice on request',
      'Guest shuttle vehicles',
      'Red carpet available',
    ],
    image: '/wedding.png',
    icon: null,
    price_text: 'Wedding packages on request',
    sort_order: 6,
  },
  {
    id: 7,
    name: 'Ski Transfers',
    slug: 'ski-transfers',
    short_description: 'St. Moritz, Zermatt, Verbier, Gstaad, Davos and more.',
    full_description:
      'Alpine transfers from November to April, in vehicles equipped for the conditions rather than merely permitted in them. Snow tyres as standard, chains carried, and chauffeurs who drive these passes every week of the season.\n\nSki and board carriage is included, and we collect at the chalet door wherever the road allows. For Zermatt we drive to the Tasch terminal and see you onto the shuttle with your luggage.',
    included: [
      'Snow tyres and chains as standard',
      'Ski and snowboard carriage included',
      'Chalet door collection',
      'Experienced alpine chauffeurs',
      'Flight tracking on arrival day',
      'Heated vehicle waiting for you',
    ],
    image: '/ski-transfer.png',
    icon: null,
    price_text: 'Fixed price per transfer',
    sort_order: 7,
  },
];

/* ----------------------------------------------------------------- cities */

const CITY_ROWS = [
  [1, 'Zurich', 'zurich', 'ZRH Airport · Hauptbahnhof',
    'Private chauffeur and airport transfer service in Zurich, available 24/7 with fixed prices and flight tracking.',
    'Zurich is where most of our journeys begin. We meet guests inside the arrivals hall at ZRH with a name sign, track every flight for delays, and drive door to door anywhere in the canton or across Switzerland.\n\nPopular routes from Zurich include ZRH to the city centre, Zurich to Davos for WEF, Zurich to St. Moritz and Zurich to Lucerne. Hourly chauffeur hire is available for meetings and roadshows.',
    47.376886, 8.541721],
  [2, 'Geneva', 'geneva', 'GVA Airport · UN district',
    'Chauffeur service and airport transfers in Geneva for business travel, conferences and lake-side journeys.',
    'Geneva serves the UN district, the banking quarter and the whole of Lake Geneva. We handle GVA airport transfers, conference shuttles and city-to-city runs to Lausanne, Montreux and into France.\n\nOur chauffeurs are French and English speaking, and familiar with the protocol expected at diplomatic and corporate addresses.',
    46.204391, 6.143158],
  [3, 'Basel', 'basel', 'EuroAirport BSL',
    'Private transfers and chauffeur hire in Basel, serving EuroAirport, Art Basel and the pharmaceutical campuses.',
    'Basel sits on three borders, and our chauffeurs cross them daily. We cover EuroAirport transfers, the pharmaceutical campuses, Art Basel, and city-to-city journeys into Germany and France.',
    47.559599, 7.588576],
  [4, 'Lucerne', 'lucerne', 'Station · Lake piers',
    'Chauffeur service in Lucerne for lake excursions, Mount Pilatus trips and airport transfers.',
    'Lucerne is the gateway to central Switzerland. We collect guests from the station and the lake piers, and drive to Mount Pilatus, Engelberg, Rigi and on to Zurich or Interlaken.',
    47.050168, 8.309307],
  [5, 'Bern', 'bern', 'Federal city',
    'Private chauffeur hire in Bern for government, business and onward alpine travel.',
    'As the federal city, Bern calls for discretion. We provide chauffeurs for government and corporate appointments, and transfers on to the Bernese Oberland, Interlaken and Gstaad.',
    46.947992, 7.447447],
  [6, 'Lausanne', 'lausanne', 'Lake Geneva · Montreux',
    'Chauffeur and transfer service in Lausanne and Montreux on the shores of Lake Geneva.',
    'Lausanne and Montreux sit on the vineyard terraces of Lake Geneva. We serve the Olympic headquarters, the hotel schools, the Montreux Jazz Festival and transfers to GVA.',
    46.519654, 6.632273],
  [7, 'Lugano', 'lugano', 'Ticino · Milan link',
    'Private transfers in Lugano and Ticino, including cross-border journeys to Milan and Como.',
    'Lugano is Switzerland in Italian. We cover Ticino, Lake Como and the run down to Milan Malpensa and Linate, with Italian-speaking chauffeurs.',
    46.003677, 8.951193],
  [8, 'St. Moritz', 'st-moritz', 'Engadin · Samedan',
    'Luxury chauffeur service and winter transfers in St. Moritz and the Engadin valley.',
    'St. Moritz is our winter home. We run transfers from Zurich, Milan and Samedan airfield, and provide chauffeurs on call for the season - including the Snow Polo and White Turf weekends.\n\nAll winter vehicles carry snow tyres and chains as standard.',
    46.490824, 9.835548],
  [9, 'Zermatt', 'zermatt', 'Via Tasch terminal',
    'Private transfers to Zermatt via the Tasch terminal, at the foot of the Matterhorn.',
    'Zermatt is car-free, so every journey ends at the Tasch terminal where the shuttle train runs to the village. We handle the drive from Zurich, Geneva or Sion, with luggage and ski equipment taken care of.',
    46.020710, 7.749080],
  [10, 'Davos', 'davos', 'WEF · Ski',
    'Chauffeur service and WEF transfers in Davos and Klosters.',
    'Davos means two things: world-class skiing and the World Economic Forum. We coordinate multi-vehicle convoys for WEF week with security-aware chauffeurs, and run ski transfers all season.',
    46.802705, 9.836058],
];

export const cities = CITY_ROWS.map(
  ([id, name, slug, hub_label, intro, description, lat, lng], i) => ({
    id,
    name,
    slug,
    hub_label,
    intro,
    description,
    image: '',
    lat,
    lng,
    sort_order: i + 1,
    vehicle_count: Object.values(VEHICLE_CITIES).filter((ids) => ids.includes(id)).length,
  }),
);

/* ---------------------------------------------------------------- gallery */

export const albums = [
  { id: 1, name: 'Vehicles', slug: 'vehicles', sort_order: 1 },
  { id: 2, name: 'Interiors', slug: 'interiors', sort_order: 2 },
  { id: 3, name: 'Airports', slug: 'airports', sort_order: 3 },
  { id: 4, name: 'Weddings', slug: 'weddings', sort_order: 4 },
  { id: 5, name: 'Events', slug: 'events', sort_order: 5 },
  { id: 6, name: 'Alpine', slug: 'alpine', sort_order: 6 },
];

const PHOTO_CAPTIONS = [
  [1, 'E-Class waiting at the kerb'],
  [1, 'V-Class loaded for a ski week'],
  [2, 'Rear cabin, ready for a call'],
  [2, 'Executive seating in the Maybach'],
  [3, 'Arrivals hall pickup at ZRH'],
  [3, 'Departure drop-off at GVA'],
  [4, 'Decorated wedding car in Lucerne'],
  [4, 'The couple arriving at the church'],
  [5, 'Convoy staged for WEF week'],
  [5, 'Event shuttle at Art Basel'],
  [6, 'Winter pass road to St. Moritz'],
  [6, 'At the Tasch terminal for Zermatt'],
];

export const photos = PHOTO_CAPTIONS.map(([albumId, caption], i) => {
  const album = albums.find((a) => a.id === albumId);
  return {
    id: i + 1,
    file_path: '',
    caption,
    alt_text: caption,
    album_name: album.name,
    album_slug: album.slug,
    sort_order: i + 1,
  };
});

/** photo_count is derived, so the chips never disagree with the grid. */
export const albumsWithCounts = albums.map((album) => ({
  ...album,
  photo_count: photos.filter((photo) => photo.album_slug === album.slug).length,
}));

/* ----------------------------------------------------------- testimonials */

export const testimonials = [
  {
    id: 1,
    customer_name: 'James W.',
    country: 'United Kingdom',
    service_label: 'Airport transfer · Zurich',
    rating: 5,
    review_text:
      'Flight landed over an hour late and the chauffeur was still there, waiting, with no fuss and no extra charge. The car was immaculate and I was at my hotel twenty minutes later. Exactly what you want after a long day.',
    photo: '',
    source: 'google',
    created_at: '2026-01-14T09:20:00.000Z',
    is_featured: 1,
  },
  {
    id: 2,
    customer_name: 'Claudia M.',
    country: 'Germany',
    service_label: 'Business travel · Geneva',
    rating: 5,
    review_text:
      'We used Swiss Tour & Transfer for three days of meetings around Geneva. Same chauffeur every day, always early, and he rearranged the whole afternoon when a meeting overran. Faultless.',
    photo: '',
    source: 'google',
    created_at: '2026-02-02T14:05:00.000Z',
    is_featured: 1,
  },
  {
    id: 3,
    customer_name: 'Antoine R.',
    country: 'France',
    service_label: 'Private transfers · Basel',
    rating: 5,
    review_text:
      'Booked on WhatsApp in about two minutes and had a fixed price straight back. The drive from Basel to Lucerne was comfortable and quiet, and the price was exactly what was quoted.',
    photo: '',
    source: 'google',
    created_at: '2026-02-18T11:40:00.000Z',
    is_featured: 1,
  },
  {
    id: 4,
    customer_name: 'Sofia L.',
    country: 'Italy',
    service_label: 'Wedding · Lucerne',
    rating: 5,
    review_text:
      'The Maybach was beautiful and the chauffeur was so calm and kind on a very stressful morning. He had the car decorated exactly as we asked and got us to the church early. Thank you.',
    photo: '',
    source: 'google',
    created_at: '2026-03-07T16:15:00.000Z',
    is_featured: 1,
  },
  {
    id: 5,
    customer_name: 'Michael T.',
    country: 'United States',
    service_label: 'Ski transfer · St. Moritz',
    rating: 5,
    review_text:
      'Zurich to St. Moritz in a snowstorm. The driver was completely unfazed, the car had proper winter tyres, and we arrived safely and on time. Worth every franc.',
    photo: '',
    source: 'direct',
    created_at: '2026-03-21T08:30:00.000Z',
    is_featured: 1,
  },
  {
    id: 6,
    customer_name: 'Priya S.',
    country: 'Switzerland',
    service_label: 'Events · WEF Davos',
    rating: 5,
    review_text:
      'They coordinated four vehicles for our team during WEF week. One contact, everything on time, and the drivers knew the access routes better than we did.',
    photo: '',
    source: 'direct',
    created_at: '2026-04-02T10:00:00.000Z',
    is_featured: 0,
  },
];

export const testimonialStats = {
  total: testimonials.length,
  average:
    Math.round((testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length) * 10) / 10,
};

/* ------------------------------------------------------------- promotions */

export const promotions = [
  {
    id: 1,
    title: 'Winter ski transfer season',
    description:
      'Book any alpine transfer to St. Moritz, Zermatt, Verbier, Gstaad or Davos and travel in a vehicle equipped with snow tyres and chains as standard. Ski carriage included.',
    code: 'SKI26',
    banner_image: '',
    placement: 'both',
    starts_at: '2025-11-01',
    ends_at: '2026-04-30',
    link_type: 'whatsapp',
    link_url: null,
  },
  {
    id: 2,
    title: 'Return journey discount',
    description:
      'Book your outbound and return airport transfer at the same time and save on the round trip. Applies to all vehicle classes.',
    code: 'RETURN10',
    banner_image: '',
    placement: 'both',
    starts_at: '2026-01-01',
    ends_at: '2026-12-31',
    link_type: 'whatsapp',
    link_url: null,
  },
];

/* ---------------------------------------------------- response builders --
   Each builder returns exactly what the matching endpoint returns, so a page
   cannot tell the difference between a live response and this file.        */

const truthy = (value) => value === 1 || value === '1' || value === true;

/** The card fields the list endpoints select - no long copy. */
const serviceCard = ({ id, name, slug, short_description, image, icon, price_text, sort_order }) => ({
  id,
  name,
  slug,
  short_description,
  image,
  icon,
  price_text,
  sort_order,
});

export const responses = {
  settings: () => ({ settings: { ...settings } }),

  home: () => ({
    sections: [...homeSections],
    sectionMeta: homeSections.map((key, i) => ({
      section_key: key,
      label: key,
      sort_order: i + 1,
    })),
    content: { ...homeContent },
    lists: {
      trust_items: parseItems(homeContent.trust_items),
      why_items: parseItems(homeContent.why_items),
      how_steps: parseItems(homeContent.how_steps),
    },
  }),

  page: (key) => {
    const content = pageContent[key];
    if (!content) return null;
    return {
      page: key,
      content: { ...content },
      lists: { stat_items: parseItems(content.stat_items) },
    };
  },

  faqs: () => ({ faqs: faqs.map((f) => ({ ...f })) }),

  categories: () => ({ categories: categories.map((c) => ({ ...c })) }),

  category: (slug) => {
    const category = categories.find((c) => c.slug === slug);
    if (!category) return null;
    return {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
      },
      vehicles: vehicles.filter((v) => v.category_id === category.id).map((v) => ({ ...v })),
    };
  },

  vehicles: (params = {}) => {
    let list = vehicles.map((v) => ({ ...v }));
    if (params.category) list = list.filter((v) => v.category_slug === params.category);
    if (truthy(params.featured)) list = list.filter((v) => v.is_featured);
    if (params.city) {
      const city = cities.find((c) => c.slug === params.city);
      list = city ? list.filter((v) => (VEHICLE_CITIES[v.id] || []).includes(city.id)) : [];
    }
    if (params.limit) list = list.slice(0, Number(params.limit));
    return { vehicles: list };
  },

  vehicle: (slug) => {
    const found = vehicles.find((v) => v.slug === slug);
    if (!found) return null;

    const vehicle = {
      ...found,
      photos: Array.from({ length: 3 }, (_, i) => ({
        id: i + 1, file_path: found.cover_image, alt_text: `${found.name} with chauffeur`, is_cover: i === 0 ? 1 : 0,
      })),
      specs: (SPECS[found.id] || []).map(([spec_label, spec_value], i) => ({
        id: i + 1,
        spec_label,
        spec_value,
      })),
      cities: (VEHICLE_CITIES[found.id] || [])
        .map((id) => cities.find((c) => c.id === id))
        .filter(Boolean)
        .map(({ id, name, slug: citySlug }) => ({ id, name, slug: citySlug })),
    };

    // Same vehicle first, then the rest - the ORDER BY in the detail query.
    const similar = vehicles
      .filter((v) => v.id !== found.id)
      .sort(
        (a, b) =>
          Number(b.category_id === found.category_id) - Number(a.category_id === found.category_id),
      )
      .slice(0, 3)
      .map((v) => ({ ...v }));

    return {
      vehicle,
      similar,
      whatsappMessage: settings.whatsapp_template_vehicle.replace('{vehicle}', found.name),
    };
  },

  services: () => ({ services: services.map(serviceCard) }),

  service: (slug) => {
    const found = services.find((item) => item.slug === slug);
    if (!found) return null;

    return {
      service: {
        ...found,
        included: [...found.included],
        photos: Array.from({ length: 3 }, (_, i) => ({
          id: i + 1, file_path: found.image, alt_text: found.name, is_cover: i === 0 ? 1 : 0,
        })),
      },
      otherServices: services
        .filter((item) => item.id !== found.id)
        .slice(0, 4)
        .map(({ id, name, slug: otherSlug, short_description, image }) => ({
          id,
          name,
          slug: otherSlug,
          short_description,
          image,
        })),
      vehicles: vehicles
        .slice()
        .sort((a, b) => b.is_featured - a.is_featured)
        .slice(0, 4)
        .map((v) => ({ ...v })),
      photos: photos.slice(0, 6).map((p) => ({ ...p })),
    };
  },

  cities: () => ({ cities: cities.map((c) => ({ ...c })) }),

  city: (slug) => {
    const city = cities.find((c) => c.slug === slug);
    if (!city) return null;

    return {
      city: { ...city },
      vehicles: vehicles
        .filter((v) => (VEHICLE_CITIES[v.id] || []).includes(city.id))
        .map((v) => ({ ...v })),
      services: services.slice(0, 6).map(({ id, name, slug: s, short_description, image }) => ({
        id,
        name,
        slug: s,
        short_description,
        image,
      })),
      otherCities: cities
        .filter((c) => c.id !== city.id)
        .map(({ name, slug: s, hub_label }) => ({ name, slug: s, hub_label })),
    };
  },

  albums: () => ({ albums: albumsWithCounts.map((a) => ({ ...a })) }),

  photos: (params = {}) => {
    const album = params.album;
    const list =
      album && album !== 'all' ? photos.filter((p) => p.album_slug === album) : photos.slice();
    return {
      photos: (params.limit ? list.slice(0, Number(params.limit)) : list).map((p) => ({ ...p })),
    };
  },

  testimonials: (params = {}) => {
    let list = testimonials.slice();
    if (truthy(params.featured)) list = list.filter((t) => t.is_featured);
    if (params.limit) list = list.slice(0, Number(params.limit));
    return { testimonials: list.map((t) => ({ ...t })), stats: { ...testimonialStats } };
  },

  promotions: () => ({ promotions: promotions.map((p) => ({ ...p })) }),
};

export { parseItems, VEHICLE_CITIES, SPECS };

export default responses;
