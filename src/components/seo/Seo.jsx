import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SITE_URL, uploadUrl } from '../../config';

const BRAND = 'Swiss Tour & Transfer';
const MAX_DESCRIPTION = 165;

function trim(text, max = MAX_DESCRIPTION) {
  const clean = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/[\s,.;:-]+\S*$/, '')}…`;
}

/**
 * Per-page head tags, built from page data rather than admin-entered fields.
 *
 * `title` is suffixed with the brand unless `bare` is set, so every page gets
 * a distinct, descriptive title without each page repeating the brand name.
 */
export default function Seo({
  title,
  description,
  image,
  path,
  type = 'website',
  bare = false,
  noindex = false,
  jsonLd = null,
}) {
  const location = useLocation();
  const pathname = path || location.pathname;

  const canonical = `${SITE_URL}${pathname === '/' ? '' : pathname}` || SITE_URL;
  const fullTitle = !title ? BRAND : bare ? title : `${title} | ${BRAND}`;
  const desc = trim(description);
  const ogImage = image ? uploadUrl(image) : `${SITE_URL}/logo-scenic.png`;

  // Accept a single schema object or an array; filter out nulls from builders.
  const blocks = (Array.isArray(jsonLd) ? jsonLd.flat() : [jsonLd]).filter(Boolean);

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      {desc && <meta name="description" content={desc} />}
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:site_name" content={BRAND} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="en" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {desc && <meta name="twitter:description" content={desc} />}
      <meta name="twitter:image" content={ogImage} />

      {blocks.map((block, i) => (
        <script type="application/ld+json" key={i}>
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
}
