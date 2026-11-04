/**
 * Enquiry notification emails, sent straight from the browser through EmailJS.
 *
 * Bookings are still taken over WhatsApp — this only makes sure a copy of
 * every enquiry lands in the inbox as well, so nothing is lost if a chat is
 * missed. Sending is fire-and-forget: a failure here must never block the
 * customer, so every error is swallowed after a console warning.
 *
 * The three ids below come from the EmailJS dashboard. The public key is
 * meant to be public — it only authorises sending this one template.
 */

const SERVICE_ID = 'service_5szax06';
const TEMPLATE_ID = 'template_salbc27';
const PUBLIC_KEY = 'Z60B__CBLqZBVFbmC';

const ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

/** Where replies go when the customer left the email field empty. */
const FALLBACK_REPLY_TO = 'swisstourntransfers@gmail.com';

/** Empty fields read as a dash in the email rather than as a blank row. */
const DASH = '—';

const text = (value) => {
  const out = String(value ?? '').trim();
  return out || DASH;
};

/** Swiss-readable date, and a dash when there is no date to show. */
function when(value) {
  if (!value) return DASH;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return text(value);
  return date.toLocaleString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Sends one enquiry to the inbox.
 *
 * @param {object} enquiry   The raw form values, plus `form_type`.
 * @returns {Promise<boolean>} Whether it went out. Never rejects.
 */
export async function sendEnquiryEmail(enquiry = {}) {
  const digits = String(enquiry.phone ?? '').replace(/\D/g, '');

  const params = {
    form_type: text(enquiry.form_type || 'Booking enquiry'),
    submitted_at: when(new Date()),

    full_name: text(enquiry.full_name),
    phone: digits || DASH,
    email: text(enquiry.email),
    /* EmailJS rejects an empty Reply-To, so an enquiry left without an email
       replies to the inbox itself. */
    reply_to: String(enquiry.email ?? '').trim() || FALLBACK_REPLY_TO,

    service_type: text(enquiry.service_type),
    vehicle_name: text(enquiry.vehicle_name),
    pickup: text(enquiry.pickup),
    dropoff: text(enquiry.dropoff),
    travel_datetime: when(enquiry.travel_datetime),
    flight_number: text(enquiry.flight_number),
    passengers: text(enquiry.passengers),
    suitcases: text(enquiry.suitcases),
    return_trip: enquiry.return_trip ? 'Yes' : 'No',
    message: text(enquiry.message),

    source_page: text(enquiry.source_page),
    page_url: typeof window === 'undefined' ? DASH : window.location.href,
    /* The quick bar collects no phone number, so the reply button in the
       email falls back to the inbox instead of a broken wa.me link. */
    whatsapp_url: digits ? `https://wa.me/${digits}` : `mailto:${FALLBACK_REPLY_TO}`,
  };

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: params,
      }),
    });

    if (!response.ok) {
      console.warn('[email] EmailJS refused the enquiry:', response.status, await response.text());
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[email] Could not send the enquiry notification:', err);
    return false;
  }
}

export default sendEnquiryEmail;
