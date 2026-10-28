/**
 * Single source of truth for the backend location.
 *
 * Switching between local and live is a ONE LINE change: edit MODE below.
 * Every API call and every image URL in the app reads from this file —
 * nothing else is allowed to hardcode a host.
 */

// ── Switch environment here ─────────────────────────────────────────────
const MODE = 'local'; // 'local' | 'live'

const URLS = {
  local: 'http://localhost:3010',
  live: 'https://api.swisstourtransfer.ch',
};

const SITE_URLS = {
  local: 'http://localhost:5173',
  live: 'https://www.swisstourtransfer.ch',
};
// ────────────────────────────────────────────────────────────────────────

export const API_BASE_URL = URLS[MODE];
export const API_URL = `${API_BASE_URL}/api`;
export const SITE_URL = SITE_URLS[MODE];

/** Local public photos used when a vehicle has no uploaded database cover. */
export function vehicleImage(vehicle) {
  if (vehicle?.cover_image?.startsWith('/images/vehicles/')) return vehicle?.cover_image;
  const identity = `${vehicle?.slug || ''} ${vehicle?.name || ''}`.toLowerCase();
  const localPhoto = identity.includes('maybach') || identity.includes('s-class-premium')
    ? '/2027-mercedes-maybach-s-680.jpg'
    : identity.includes('s-class')
      ? '/Mercedes-Benz S-Class.jfif'
      : identity.includes('v-class') || identity.includes('vito') || identity.includes('eqv')
        ? '/Mercedes-Benz V-Class.jfif'
        : identity.includes('sprinter')
          ? '/Mercedes-Benz Sprinter.jpg'
          : identity.includes('range rover') || identity.includes('range-rover')
            ? '/Range Rover.jfif'
            : identity.includes('toyota-prius') || identity.includes('e-class')
              ? '/placeholder-car.jpg'
            : null;

  // A bundled photo named for the vehicle is the intended cover, even when
  // the database still has an older uploaded cover for that vehicle.
  if (localPhoto) return localPhoto;

  const cover = String(vehicle?.cover_image || '').trim();
  if (cover && !/placeholder-car\.jpg(?:$|[?#])/i.test(cover)) return cover;
  // Never an empty string: an <img src=""> does not fire onError, so the
  // fallback would not run and the card would show a blank frame.
  return '/placeholder-car.jpg';
}

/** Best matching bundled vehicle photo for a vehicle category card. */
export function categoryImage(category) {
  if (category?.image?.startsWith('/images/vehicles/')) return category?.image;
  const identity = `${category?.slug || ''} ${category?.name || ''} ${category?.examples || ''}`.toLowerCase();
  if (identity.includes('economy') || identity.includes('toyota prius')) return '/placeholder-car.jpg';
  if (identity.includes('premium') || identity.includes('maybach') || identity.includes('vip')) {
    return '/2027-mercedes-maybach-s-680.jpg';
  }
  if (identity.includes('first-class') || identity.includes('first class') || identity.includes('s-class')) {
    return '/Mercedes-Benz S-Class.jfif';
  }
  if (identity.includes('business') || identity.includes('v-class')) return '/Mercedes-Benz V-Class.jfif';
  if (identity.includes('range rover') || identity.includes('suv')) return '/Range Rover.jfif';
  if (identity.includes('electric') || identity.includes('eqs') || identity.includes('eqv')) {
    return '/Mercedes-Benz S-Class.jfif';
  }

  // Same reason as vehicleImage: an empty src never fires onError.
  return '/placeholder-car.jpg';
}

/** Local gallery photo for captions without a real uploaded gallery image. */

/** Local gallery photo for captions without an uploaded gallery image. */
export function galleryImage(photo, index = 0) {
  const existing = String(photo?.file_path || '').trim();

  // Prefer a real uploaded image.
  if (existing && !/placeholder-car\.jpg(?:$|[?#])/i.test(existing)) {
    return imageUrl(existing);
  }

  const caption =
    `${photo?.caption || ''} ${photo?.alt_text || ''}`.toLowerCase();

  // Select a local image based on the gallery caption.
  if (caption.includes('maybach')) {
    return '/2027-mercedes-maybach-s-680.jpg';
  }

  if (caption.includes('s-class')) {
    return '/images/vehicles/mercedes-benz-sclass.png';
  }

  if (caption.includes('v-class')) {
    return '/images/vehicles/mercedes-benz-vclass.webp';
  }

  if (caption.includes('sprinter')) {
    return '/Mercedes-Benz Sprinter.jpg';
  }

  if (caption.includes('range rover') || caption.includes('suv')) {
    return '/Range Rover.jfif';
  }

  // Fallback images for all other gallery captions.
  const localPhotos = [
    '/Mercedes-Benz S-Class.jfif',
    '/Mercedes-Benz V-Class.jfif',
    '/2027-mercedes-maybach-s-680.jpg',
    '/Mercedes-Benz Sprinter.jpg',
    '/Range Rover.jfif',
  ];

  return localPhotos[index % localPhotos.length];
}


/**
 * Local public photo for a service with no uploaded image of its own.
 *
 * Same bundled photos the vehicle, category and gallery helpers draw on, so
 * the whole site stays on one set of images while it runs without a backend.
 *
 * A picture chosen for the service always wins. Only when none is set does
 * the name decide, and the ski test runs before the airport one because
 * "ski transfers" contains "transfer" and would otherwise look like an
 * airport job.
 */
export function serviceImage(service, index = 0) {
  const chosen = String(service?.image || '').trim();
  if (chosen && !/placeholder-car\.jpg(?:$|[?#])/i.test(chosen)) return chosen;

  const identity = `${service?.slug || ''} ${service?.name || ''}`.toLowerCase();

  if (identity.includes('wedding')) return '/2027-mercedes-maybach-s-680.jpg';
  if (identity.includes('ski') || identity.includes('winter')) return '/Range Rover.jfif';
  if (identity.includes('event') || identity.includes('wef') || identity.includes('group')) {
    return '/Mercedes-Benz Sprinter.jpg';
  }
  // `transfer` on its own is too broad - it also catches "Private
  // Transfers", which is a different service with its own photo.
  if (identity.includes('airport')) return '/airport-transfer.png';
  if (identity.includes('business') || identity.includes('hourly') || identity.includes('corporate')) {
    return '/Mercedes-Benz S-Class.jfif';
  }

  // Anything unmatched still gets a photo, and a different one each time.
  const localPhotos = [
    '/Mercedes-Benz S-Class.jfif',
    '/Mercedes-Benz V-Class.jfif',
    '/2027-mercedes-maybach-s-680.jpg',
    '/Mercedes-Benz Sprinter.jpg',
    '/Range Rover.jfif',
  ];
  return localPhotos[index % localPhotos.length];
}

/** Build a full URL for a file stored in the backend uploads folder. */
export function uploadUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}/uploads/${String(path).replace(/^\/+/, '')}`;
}

/**
 * Public-site image URL. Empty paths stay empty so missing photos never
 * silently turn into a generic placeholder.
 */
export function imageUrl(path) {
  if (!path) return '';
  if (/^(\/|data:)/i.test(path)) return path;
  return uploadUrl(path);
}

/** Hide an unavailable photo; do not replace it with a generic image. */
export function imageFallback(event) {
  event.currentTarget.hidden = true;
}

/** Build a canonical URL for the public site. */
export function siteUrl(path = '') {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`.replace(/\/$/, '') || SITE_URL;
}

export const BRAND = {
  name: 'Swiss Tour & Transfer',
  tagline: 'Explore · Travel · Arrive',
};

export default {
  MODE,
  API_BASE_URL,
  API_URL,
  SITE_URL,
  uploadUrl,
  imageUrl,
  imageFallback,
  vehicleImage,
  categoryImage,
  galleryImage,
  serviceImage,
  siteUrl,
  BRAND,
};
