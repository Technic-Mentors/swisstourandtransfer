import { useState } from 'react';
import { Link } from 'react-router-dom';
import { imageFallback, imageUrl, vehicleImage } from '../../config';
import { Button, Card, Lightbox, cx } from '../ui';
import hs from '../home/home.module.css';
import WhatsAppButton from '../ui/WhatsAppButton';
import s from './vehicles.module.css';
import { hoverGlowProps } from '../ui/hoverGlow';

/* ------------------------------------------------------------------ icons */

const PassengerIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-8 2.2-8 5v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2c0-2.8-3.6-5-8-5z" />
  </svg>
);

const SuitcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M9 3a2 2 0 0 0-2 2v1H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2V5a2 2 0 0 0-2-2H9zm0 2h6v1H9V5z" />
  </svg>
);

const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a4 4 0 0 0-4 4v1H6a1 1 0 0 0-1 1l-1 12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1L19 8a1 1 0 0 0-1-1h-2V6a4 4 0 0 0-4-4zm0 2a2 2 0 0 1 2 2v1h-4V6a2 2 0 0 1 2-2z" />
  </svg>
);

/* ------------------------------------------------------------ price label */

export function priceLabel(vehicle) {
  if (vehicle.price_from) {
    const unit = vehicle.price_unit === 'journey' ? 'journey' : vehicle.price_unit || 'hour';
    return { value: `CHF ${Number(vehicle.price_from).toLocaleString('de-CH')}`, note: `per ${unit}` };
  }

  // With no price set, the admin note often just repeats "price on request" -
  // in that case say something useful instead of printing it twice.
  const note = (vehicle.price_note || '').trim();
  const redundant = /^price on request$/i.test(note);
  return { value: 'Price on request', note: redundant || !note ? 'Fixed quote in minutes' : note };
}

/* ------------------------------------------------------------ vehicle card */

export function VehicleCard({ vehicle, pageType = 'vehicle-card' }) {
  const href = `/vehicles/${vehicle.slug}`;
  const price = priceLabel(vehicle);
  const cover = vehicleImage(vehicle);

  return (
    <Card hover className={cx(s.card, hs.xGloss, 'hover-glow')} {...hoverGlowProps()}>
      <Link to={href} className={cx(s.media, hs.xPhoto)} aria-label={vehicle.name}>
        {/* No photo uploaded yet falls back to the placeholder car, so a card
            never shows an empty frame. */}
        <img
          src={imageUrl(cover)}
          hidden={!cover}
          onError={imageFallback}
          alt={`${vehicle.name} with chauffeur`}
          loading="lazy"
          width="640"
          height="480"
        />

        {vehicle.is_featured ? <span className={s.featuredDot}>Featured</span> : null}

        {/* Capacity reads at a glance over the photo, keeping the body short. */}
        <span className={s.mediaBar}>
          <span className={s.mediaFact}>
            <PassengerIcon />
            {vehicle.passengers}
          </span>
          <span className={s.mediaFact}>
            <SuitcaseIcon />
            {vehicle.suitcases}
          </span>
          {vehicle.category_name && <span className={s.mediaCat}>{vehicle.category_name}</span>}
        </span>
      </Link>

      <div className={s.body}>
        <h3 className={s.name}>
          <Link to={href}>{vehicle.name}</Link>
        </h3>

        {vehicle.tagline && <p className={s.tagline}>{vehicle.tagline}</p>}

        <p className={s.price}>
          <span className={s.priceValue}>{price.value}</span>
          <span className={s.priceNote}>{price.note}</span>
        </p>

        <div className={s.actions}>
          <Button to={href} variant="outline" size="sm">
            Details
          </Button>
          <WhatsAppButton vehicle={vehicle} pageType={pageType} variant="gold" size="sm">
            WhatsApp
          </WhatsAppButton>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------ vehicle grid */

export function VehicleGrid({ vehicles = [], pageType, className }) {
  if (!vehicles.length) return null;
  return (
    <div className={cx(s.grid, className)}>
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} pageType={pageType} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------- category pills */

export function CategoryPills({ categories = [], active = 'all', onChange }) {
  return (
    <div className={s.pills} role="tablist" aria-label="Filter vehicles by category">
      <button
        type="button"
        role="tab"
        aria-selected={active === 'all'}
        className={cx(s.pill, active === 'all' && s.pillActive)}
        onClick={() => onChange('all')}
      >
        All vehicles
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          role="tab"
          aria-selected={active === category.slug}
          className={cx(s.pill, active === category.slug && s.pillActive)}
          onClick={() => onChange(category.slug)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

/* --------------------------------------------------------- vehicle gallery */

export function VehicleGallery({ photos = [], name = '' }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  // A vehicle with no photos still gets one frame: the placeholder car.
  const shots = photos.length ? photos : [{ id: 'placeholder', file_path: '', alt_text: name }];

  const current = shots[Math.min(index, shots.length - 1)];
  const items = shots.map((photo, i) => ({
    src: imageUrl(photo.file_path),
    alt: photo.alt_text || `${name} - photo ${i + 1}`,
    caption: photo.alt_text || '',
  }));

  return (
    <div className={s.gallery}>
      <button
        type="button"
        className={s.galleryMain}
        onClick={() => setLightbox(true)}
        onPointerMove={(event) => {
          if (event.pointerType !== 'mouse') return;
          const bounds = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty('--zoom-x', `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
          event.currentTarget.style.setProperty('--zoom-y', `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
        }}
        onPointerLeave={(event) => {
          event.currentTarget.style.removeProperty('--zoom-x');
          event.currentTarget.style.removeProperty('--zoom-y');
        }}
        aria-label="Open full size image"
      >
        <img
          key={index}
          className={s.galleryImage}
          src={imageUrl(current.file_path)}
          hidden={!current.file_path}
          onError={imageFallback}
          alt={current.alt_text || `${name} with chauffeur`}
          width="960"
          height="600"
        />
        {shots.length > 1 && (
          <span className={s.galleryCounter} aria-live="polite">
            {index + 1} / {shots.length}
          </span>
        )}
      </button>

      {shots.length > 1 && (
        <div className={s.thumbs}>
          {shots.slice(0, 10).map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              className={cx(s.thumb, i === index && s.thumbActive)}
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === index}
            >
              <img
                src={imageUrl(photo.file_path)}
                hidden={!photo.file_path}
                onError={imageFallback}
                alt=""
                loading="lazy"
                width="160"
                height="160"
              />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <Lightbox items={items} index={index} onIndexChange={setIndex} onClose={() => setLightbox(false)} />
      )}
    </div>
  );
}

/* --------------------------------------------------------------- spec list */

export function SpecTable({ specs = [] }) {
  if (!specs.length) return null;

  return (
    <dl className={s.specs}>
      {specs.map((spec, i) => (
        <div className={s.specRow} key={spec.id ?? i}>
          <dt className={s.specLabel}>{spec.spec_label}</dt>
          <dd className={s.specValue}>{spec.spec_value}</dd>
        </div>
      ))}
    </dl>
  );
}

export { PassengerIcon, SuitcaseIcon, BagIcon };
