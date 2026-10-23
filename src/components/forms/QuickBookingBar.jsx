import { useState } from 'react';
import useWhatsApp from '../../hooks/useWhatsApp';
import { Button } from '../ui';
import { Field, SearchField } from './Fields';
import s from './forms.module.css';

function BookingIcon({ type }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === 'pin' ? <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.4" /></> : type === 'date' ? <><rect x="4" y="5" width="16" height="16" rx="1" /><path d="M8 3v4m8-4v4M4 10h16M8 14h1m3 0h1m3 0h1m-9 4h1m3 0h1" /></> : <><path d="m4 11 2-6h12l2 6M3 11h18v8H3Zm2 8v2m14-2v2M6 15h2m8 0h2" /></>}
  </svg>;
}


/**
 * Homepage quick booking bar.
 *
 * Collects the four things we always need, then opens WhatsApp with a message
 * already written. Nothing is stored - it is a shortcut into the chat, which
 * is the primary booking channel.
 */
export default function QuickBookingBar({ heading, vehicles = [], cities = [] }) {
  const { buildUrl, track } = useWhatsApp();
  const [form, setForm] = useState({ pickup: '', dropoff: '', date: '', vehicle: '' });

  /* Nothing earlier than right now: the local clock shifted into the format
     datetime-local expects, which is local time with no zone suffix. */
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const cityNames = cities.map((city) => city.name);
  const vehicleNames = vehicles.map((v) => v.name);

  // The field holds a name now, so the vehicle is matched on what was typed.
  const vehicle =
    vehicles.find((v) => v.name.toLowerCase() === form.vehicle.trim().toLowerCase()) || null;

  const lines = [
    vehicle
      ? `Hello, I would like to book the ${vehicle.name}.`
      : 'Hello, I would like to book a chauffeur.',
    form.pickup ? `Pickup: ${form.pickup}` : null,
    form.dropoff ? `Destination: ${form.dropoff}` : null,
    form.date ? `Date: ${new Date(form.date).toLocaleString('en-GB')}` : null,
  ].filter(Boolean);

  const href = buildUrl({ custom: lines.join('\n') });

  return (
    <div className={s.bookingPanel}>
      <div className={s.quickBar}>
        {heading && <p className={s.quickHeading}>{heading}</p>}

      <div className={s.quickGrid}>
        <div className={s.quickField}><span className={s.quickFieldIcon}><BookingIcon type="pin" /></span><SearchField
          label="Pickup"
          value={form.pickup}
          onChange={set('pickup')}
          placeholder="Search a city or airport"
          options={cityNames}
        /></div>
        <div className={s.quickField}><span className={s.quickFieldIcon}><BookingIcon type="pin" /></span><SearchField
          label="Destination"
          value={form.dropoff}
          onChange={set('dropoff')}
          placeholder="Search a destination"
          options={cityNames}
        /></div>
        <div className={s.quickField}><span className={s.quickFieldIcon}><BookingIcon type="date" /></span><Field
          label="Date & time"
          type="datetime-local"
          min={minDateTime}
          value={form.date}
          onChange={set('date')}
        /></div>
        <div className={s.quickField}><span className={s.quickFieldIcon}><BookingIcon type="car" /></span><SearchField
          label="Vehicle"
          value={form.vehicle}
          onChange={set('vehicle')}
          placeholder="Any vehicle"
          options={vehicleNames}
          emptyText="No match — we will suggest one"
        /></div>

        <div className={s.quickSubmit}>
          {/* Gold here, not green: the hero already carries the green WhatsApp
              CTA and two greens side by side fight each other. */}
          <Button
            variant="gold"
            href={href}
            full
            size="sm"
            
            onClick={() => track({ vehicle, pageType: 'quick-booking' })}
          >
            Book now <span aria-hidden="true">{'\u2192'}</span>
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}
