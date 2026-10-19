import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { publicApi } from '../api/resources';

/** Replace {vehicle} {city} {service} {page_url} in an admin-defined template. */
function fill(template, vars) {
  return String(template || '').replace(/\{(\w+)\}/g, (match, key) => {
    const value = vars[key];
    return value === undefined || value === null || value === '' ? match : String(value);
  });
}

/**
 * The single entry point for every WhatsApp button on the site.
 *
 * Reads the number and message templates from admin settings, records the
 * click for the dashboard, then opens wa.me. Tracking is fire-and-forget: a
 * failed analytics call must never stop the booking.
 */
export default function useWhatsApp() {
  const { settings, whatsappNumber } = useSite();
  const location = useLocation();

  const buildMessage = useCallback(
    ({ vehicle = null, city = '', service = '', custom = '' } = {}) => {
      if (custom) return custom;

      const pageUrl = typeof window === 'undefined' ? '' : window.location.href;

      let template;
      if (vehicle) {
        template =
          (vehicle.whatsapp_template && vehicle.whatsapp_template.trim()) ||
          settings.whatsapp_template_vehicle;
      } else if (city) {
        template = settings.whatsapp_template_city || settings.whatsapp_template_general;
      } else if (service) {
        template = settings.whatsapp_template_service || settings.whatsapp_template_general;
      } else {
        template = settings.whatsapp_template_general;
      }

      return fill(template, {
        vehicle: vehicle?.name || '',
        city,
        service,
        page_url: pageUrl,
      });
    },
    [settings],
  );

  const buildUrl = useCallback(
    (options = {}) => {
      const message = buildMessage(options);
      return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    },
    [buildMessage, whatsappNumber],
  );

  const track = useCallback(
    ({ vehicle = null, pageType = 'page' } = {}) => {
      publicApi
        .trackWhatsApp({
          vehicle_id: vehicle?.id ?? null,
          vehicle_name: vehicle?.name ?? null,
          page_path: location.pathname,
          page_type: pageType,
        })
        .catch(() => {
          /* analytics must never block a booking */
        });
    },
    [location.pathname],
  );

  /** Track the click, then hand back the URL for the anchor to follow. */
  const open = useCallback(
    (options = {}) => {
      track(options);
      return buildUrl(options);
    },
    [track, buildUrl],
  );

  return { buildMessage, buildUrl, track, open, whatsappNumber };
}
