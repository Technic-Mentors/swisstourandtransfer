import { useState } from 'react';
import useWhatsApp from '../../hooks/useWhatsApp';
import { Button, WhatsAppIcon } from '../ui';
import { Field, SearchField } from './Fields';
import s from './forms.module.css';

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
    <div className={s.quickBar}>
      {heading && <p className={s.quickHeading}>{heading}</p>}

      <div className={s.quickGrid}>
        <SearchField
          label="Pickup"
          value={form.pickup}
          onChange={set('pickup')}
          placeholder="Search a city or airport"
          options={cityNames}
        />
        <SearchField
          label="Destination"
          value={form.dropoff}
          onChange={set('dropoff')}
          placeholder="Search a destination"
          options={cityNames}
        />
        <Field label="Date & time" type="datetime-local" value={form.date} onChange={set('date')} />
        <SearchField
          label="Vehicle"
          value={form.vehicle}
          onChange={set('vehicle')}
          placeholder="Any vehicle"
          options={vehicleNames}
          emptyText="No match — we will suggest one"
        />

        <div className={s.quickSubmit}>
          {/* Gold here, not green: the hero already carries the green WhatsApp
              CTA and two greens side by side fight each other. */}
          <Button
            variant="gold"
            href={href}
            full
            size="sm"
            icon={<WhatsAppIcon />}
            onClick={() => track({ vehicle, pageType: 'quick-booking' })}
          >
            Get a price
          </Button>
        </div>
      </div>
    </div>
  );
}
