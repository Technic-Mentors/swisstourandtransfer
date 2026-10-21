import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { publicApi } from '../../api/resources';
import { useSite } from '../../context/SiteContext';
import useWhatsApp from '../../hooks/useWhatsApp';
import { Alert, Button, WhatsAppIcon } from '../ui';
import { Checkbox, Field, Select, TextArea } from './Fields';
import s from './forms.module.css';

const SERVICE_TYPES = [
  'Airport transfer',
  'Hourly chauffeur',
  'City-to-city',
  'Business travel',
  'Event / WEF',
  'Wedding',
  'Ski transfer',
  'Other',
];

/** The same answers the API would receive, written out for a chat message. */
function enquiryMessage(form, vehicleName) {
  const when = form.travel_datetime
    ? new Date(form.travel_datetime).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const lines = [
    ['Service', form.service_type],
    ['Vehicle', vehicleName],
    ['Pickup', form.pickup],
    ['Drop-off', form.dropoff],
    ['Date & time', when],
    ['Flight', form.flight_number],
    ['Passengers', form.passengers],
    ['Suitcases', form.suitcases],
    ['Return trip', form.return_trip ? 'Yes' : ''],
    ['Name', form.full_name],
    ['Phone', form.phone],
    ['Email', form.email],
    ['Message', form.message],
  ]
    .filter(([, value]) => String(value ?? '').trim())
    .map(([label, value]) => `${label}: ${String(value).trim()}`);

  return ['Hello, I would like to book a transfer.', '', ...lines].join('\n');
}

const EMPTY = {
  service_type: '',
  vehicle_id: '',
  pickup: '',
  dropoff: '',
  travel_datetime: '',
  flight_number: '',
  passengers: '',
  suitcases: '',
  return_trip: false,
  full_name: '',
  email: '',
  phone: '',
  message: '',
  consent: false,
};

/**
 * The booking enquiry form, used on /book, /contact and vehicle pages.
 *
 * Everything is booked over WhatsApp at the moment, so by default the
 * answers open as a prefilled chat and nothing is posted. This is the one
 * switch for that: pass sendTo="api" to send an enquiry to the backend
 * instead, which stores it and returns its own prefilled WhatsApp link.
 */
export default function EnquiryForm({
  vehicles = [],
  defaultVehicleId = '',
  defaultService = '',
  compact = false,
  title,
  sendTo = 'whatsapp',
}) {
  const location = useLocation();
  const { settings } = useSite();
  const { open: openWhatsApp } = useWhatsApp();
  const now = new Date();
  const minTravelDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);

  const [form, setForm] = useState({
    ...EMPTY,
    vehicle_id: defaultVehicleId ? String(defaultVehicleId) : '',
    service_type: defaultService,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState('');
  const [result, setResult] = useState(null);
  const successRef = useRef(null);

  useEffect(() => {
    if (result) successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [result]);

  const set = (key) => (event) => {
    const raw = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    const value = key === 'phone' ? String(raw).replace(/\D/g, '').slice(0, 15) : raw;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  function validate() {
    const next = {};
    if (!form.full_name.trim()) next.full_name = 'Please enter your name.';
    else if (form.full_name.trim().length > 160) next.full_name = 'Name must be 160 characters or fewer.';
    if (!form.pickup.trim()) next.pickup = 'Please enter a pickup location.';
    else if (form.pickup.trim().length > 255) next.pickup = 'Pickup must be 255 characters or fewer.';
    if (!form.dropoff.trim()) next.dropoff = 'Please enter a drop-off location.';
    else if (form.dropoff.trim().length > 255) next.dropoff = 'Drop-off must be 255 characters or fewer.';
    if (!form.phone.trim()) next.phone = 'We need a phone number to confirm your ride.';
    else if (!/^\d{7,15}$/.test(form.phone)) next.phone = 'Enter 7 to 15 digits, including your country code.';
    if (form.travel_datetime) {
      const travelTime = new Date(form.travel_datetime).getTime();
      if (!Number.isFinite(travelTime)) next.travel_datetime = 'Enter a valid date and time.';
      else if (travelTime <= Date.now()) next.travel_datetime = 'Choose a date and time in the future.';
    }
    if (form.passengers && (!/^\d+$/.test(form.passengers) || Number(form.passengers) < 1 || Number(form.passengers) > 60)) {
      next.passengers = 'Enter a whole number from 1 to 60.';
    }
    if (form.suitcases && (!/^\d+$/.test(form.suitcases) || Number(form.suitcases) > 60)) {
      next.suitcases = 'Enter a whole number from 0 to 60.';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      next.email = 'That email address does not look right.';
    } else if (form.email.length > 190) {
      next.email = 'Email must be 190 characters or fewer.';
    }
    if (!form.consent) next.consent = 'Please accept the privacy policy.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setFailure('');
    if (!validate()) return;

    const vehicleName =
      vehicles.find((item) => String(item.id) === String(form.vehicle_id))?.name || '';

    if (sendTo === 'whatsapp') {
      /* Opened straight from the click, with no await in between, so the
         browser treats it as user-initiated rather than as a popup. The
         success panel repeats the link in case it is blocked anyway. */
      const url = openWhatsApp({
        custom: enquiryMessage(form, vehicleName),
        pageType: 'enquiry-form',
      });
      window.open(url, '_blank', 'noopener,noreferrer');
      setResult({ viaWhatsApp: true, whatsappUrl: url });
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...form, source_page: location.pathname };
      delete payload.consent;
      if (!payload.vehicle_id) delete payload.vehicle_id;

      const data = await publicApi.createEnquiry(payload);
      setResult(data);
    } catch (err) {
      setFailure(err.message || 'Something went wrong. Please try again or message us on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const minutes = settings.reply_time_minutes || '10';
    return (
      <div className={s.success} role="status" ref={successRef}>
        <div className={s.successIcon} aria-hidden="true">
          ✓
        </div>
        <h3 className={s.successTitle}>
          {result.viaWhatsApp ? 'Your enquiry is ready' : 'Thank you'}
        </h3>
        <p>
          {result.viaWhatsApp
            ? `WhatsApp should have opened with your details filled in - press send there and we will reply within about ${minutes} minutes. If nothing opened, use the button below.`
            : result.message || `We have received your enquiry and will reply within about ${minutes} minutes.`}
        </p>
        <div className={s.successActions}>
          {result.whatsappUrl && (
            <Button
              variant="whatsapp"
              href={result.whatsappUrl}
              icon={<WhatsAppIcon />}
            >
              {result.viaWhatsApp ? 'Open WhatsApp' : 'Send it on WhatsApp too'}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setResult(null);
              setForm({ ...EMPTY, vehicle_id: defaultVehicleId ? String(defaultVehicleId) : '' });
            }}
          >
            New enquiry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className={s.form} onSubmit={onSubmit} noValidate>
      {title && <h3>{title}</h3>}

      {failure && <Alert tone="error">{failure}</Alert>}

      {!compact && (
        <div className={s.row2}>
          <Select
            label="Service"
            value={form.service_type}
            onChange={set('service_type')}
            placeholder="Choose a service"
            options={SERVICE_TYPES}
          />
          <Select
            label="Vehicle"
            value={form.vehicle_id}
            onChange={set('vehicle_id')}
            placeholder="Any suitable vehicle"
            options={vehicles.map((v) => ({ value: String(v.id), label: v.name }))}
          />
        </div>
      )}

      <div className={s.row2}>
        <Field
          label="Pickup"
          required
          value={form.pickup}
          onChange={set('pickup')}
          error={errors.pickup}
          placeholder="Zurich Airport (ZRH), Terminal 2"
          autoComplete="off"
          maxLength={255}
        />
        <Field
          label="Drop-off"
          required
          value={form.dropoff}
          onChange={set('dropoff')}
          error={errors.dropoff}
          placeholder="Baur au Lac, Zurich"
          autoComplete="off"
          maxLength={255}
        />
      </div>

      <div className={s.row3}>
        <Field
          label="Date & time"
          type="datetime-local"
          min={minTravelDateTime}
          value={form.travel_datetime}
          onChange={set('travel_datetime')}
          error={errors.travel_datetime}
        />
        <Field
          label="Passengers"
          type="number"
          min="1"
          max="60"
          step="1"
          value={form.passengers}
          onChange={set('passengers')}
          error={errors.passengers}
          placeholder="2"
        />
        <Field
          label="Suitcases"
          type="number"
          min="0"
          max="60"
          step="1"
          value={form.suitcases}
          onChange={set('suitcases')}
          error={errors.suitcases}
          placeholder="2"
        />
      </div>

      {!compact && (
        <div className={s.row2}>
          <Field
            label="Flight number"
            value={form.flight_number}
            onChange={set('flight_number')}
            placeholder="LX 318"
            hint="We track your flight and adjust for delays."
            maxLength={40}
          />
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 12 }}>
            <Checkbox
              label="Add a return trip"
              checked={form.return_trip}
              onChange={set('return_trip')}
            />
          </div>
        </div>
      )}

      <div className={s.row2}>
        <Field
          label="Full name"
          required
          value={form.full_name}
          onChange={set('full_name')}
          error={errors.full_name}
          placeholder="Anna Muster"
          autoComplete="name"
          maxLength={160}
        />
        <Field
          label="Phone"
          required
          type="tel"
          value={form.phone}
          onChange={set('phone')}
          error={errors.phone}
          hint="Digits only, including your country code."
          placeholder="41791234567"
          autoComplete="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={15}
        />
      </div>

      <Field
        label="Email"
        type="email"
        value={form.email}
        onChange={set('email')}
        error={errors.email}
        placeholder="you@example.com"
        autoComplete="email"
        maxLength={190}
      />

      <TextArea
        label="Message"
        value={form.message}
        onChange={set('message')}
        placeholder="Child seats, extra stops, ski equipment, anything else we should know."
      />

      <div>
        <Checkbox
          label="I agree to the privacy policy (revDSG / GDPR)."
          checked={form.consent}
          onChange={set('consent')}
        />
        {errors.consent && <span className={s.errorText}>{errors.consent}</span>}
      </div>

      <div className={s.formActions}>
        {/* Note first, action last: the primary button sits on the right. */}
        <p className={s.formNote}>
          Prefer to chat? WhatsApp is usually faster — we reply in about{' '}
          {settings.reply_time_minutes || '10'} minutes, 24/7.
        </p>
        <Button type="submit" disabled={submitting}>
          {sendTo === 'whatsapp'
            ? 'Send on WhatsApp'
            : submitting
              ? 'Sending…'
              : 'Send enquiry'}
        </Button>
      </div>
    </form>
  );
}
