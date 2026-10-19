import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { publicApi } from '../api/resources';

const SiteContext = createContext(null);

/** Sensible values so the site still renders if the API is briefly unreachable. */
const FALLBACK = {
  company_name: 'Swiss Tour & Transfer',
  tagline: 'Explore · Travel · Arrive',
  whatsapp_number: '41000000000',
  whatsapp_template_vehicle: "Hello, I would like to book the {vehicle}.",
  whatsapp_template_general: 'Hello, I would like to enquire about a chauffeur service.',
  show_floating_whatsapp: '1',
  show_sticky_mobile_bar: '1',
  phone: '',
  email: '',
  announcement_enabled: '0',
};

/**
 * Settings are needed by the header, footer, every WhatsApp button and the
 * announcement bar, so they are fetched once here and shared.
 */
export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    publicApi
      .settings()
      .then((data) => {
        if (active && data?.settings) setSettings({ ...FALLBACK, ...data.settings });
      })
      .catch(() => {
        /* keep the fallback - the site stays usable */
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => {
    const flag = (key) => settings[key] === '1' || settings[key] === 1 || settings[key] === true;

    return {
      settings,
      loading,
      get: (key, fallback = '') => settings[key] ?? fallback,
      flag,
      whatsappNumber: String(settings.whatsapp_number || '').replace(/\D/g, ''),
      socials: [
        { name: 'Instagram', url: settings.social_instagram },
        { name: 'Facebook', url: settings.social_facebook },
        { name: 'LinkedIn', url: settings.social_linkedin },
        { name: 'TikTok', url: settings.social_tiktok },
      ].filter((s) => s.url),
    };
  }, [settings, loading]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside <SiteProvider>');
  return ctx;
}

export default SiteContext;
