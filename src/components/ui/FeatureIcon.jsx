/**
 * One icon per feature line, chosen from the wording itself.
 *
 * Spec tables, "ideal for" lists and "what is included" lists are all free
 * text coming from the database, so nothing can be keyed off an id. Matching
 * on the words keeps every list illustrated without the admin having to pick
 * an icon for each row, and anything unrecognised still gets a tick.
 *
 * All glyphs share one 24x24 grid and are drawn as strokes, so they inherit
 * colour and line weight from whatever is around them.
 */

const ICONS = {
  wifi: (
    <>
      <path d="M12 18.5h.01" />
      <path d="M8.5 15.3a5 5 0 0 1 7 0" />
      <path d="M5.5 12.1a9.2 9.2 0 0 1 13 0" />
      <path d="M2.5 9a13.4 13.4 0 0 1 19 0" />
    </>
  ),
  water: (
    <>
      <path d="M10 2h4v2.6l2 2.7V21a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V7.3l2-2.7Z" />
      <path d="M8 12h8" />
    </>
  ),
  greet: (
    <>
      <circle cx="12" cy="7" r="3" />
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  plane: <path d="M21 15.5 13.5 13V7a1.5 1.5 0 0 0-3 0v6L3 15.5V17l7.5-2v3.5L8 20v1.2l4-1 4 1V20l-2.5-1.5V15l7.5 2Z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  money: (
    <>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6Z" />
      <path d="M7.5 7.5h.01" />
    </>
  ),
  luggage: (
    <>
      <rect x="5" y="7" width="14" height="14" rx="2" />
      <path d="M9 7V4h6v3M9 11v6M15 11v6" />
    </>
  ),
  child: (
    <>
      <path d="M7 20v-5a5 5 0 0 1 5-5h5" />
      <path d="M7 15H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M17 10v10" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
    </>
  ),
  badge: <path d="m12 3 2.6 5.5 6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.4 9.4l6-.9L12 3Z" />,
  snow: (
    <>
      <path d="M12 2v20M4.2 6.5l15.6 11M19.8 6.5 4.2 17.5" />
      <path d="M9 4.5 12 7l3-2.5M9 19.5 12 17l3 2.5" />
    </>
  ),
  seat: (
    <>
      <path d="M7 4h3a3 3 0 0 1 3 3v7H7Z" />
      <path d="M7 14h10a2 2 0 0 1 2 2v4" />
      <path d="M5 20v-8" />
    </>
  ),
  ruler: (
    <>
      <rect x="2" y="8" width="20" height="8" rx="1.5" />
      <path d="M7 8v3M12 8v4M17 8v3" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 11a3 3 0 0 0 0-6M17 20a6 6 0 0 0-2-4.5" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <path d="M8.5 18H14a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h5.5" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5.5c0 4.3 2.9 7.8 7 9.5 4.1-1.7 7-5.2 7-9.5V6Z" />
      <path d="m9.5 12 1.8 1.8 3.4-3.6" />
    </>
  ),
  heart: <path d="M12 20s-7-4.4-7-9.4A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.6c0 5-7 9.4-7 9.4Z" />,
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
  refresh: (
    <>
      <path d="M21 12a9 9 0 0 1-15.5 6.2M3 12a9 9 0 0 1 15.5-6.2" />
      <path d="M3 18.5V13h5.5M21 5.5V11h-5.5" />
    </>
  ),
  car: (
    <>
      <path d="M4 16v-3.2L5.8 8A2 2 0 0 1 7.7 6.6h8.6A2 2 0 0 1 18.2 8L20 12.8V16" />
      <path d="M3 16h18v3h-3v-1.5H6V19H3Z" />
      <path d="M6.5 12.8h11" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
};

/* First match wins, so the more specific words come first. */
const RULES = [
  [/wi-?fi|internet|connectiv/i, 'wifi'],
  [/water|drink|refresh(ment)?s/i, 'water'],
  [/meet|greet|name sign|arrivals hall/i, 'greet'],
  [/flight|airport|plane|terminal|zrh|gva|bsl/i, 'plane'],
  [/wait|time|hour|minute|24\/7|punctual|on time|notice/i, 'clock'],
  [/toll|parking|vignette|price|rate|quote|fee|cost|fuel|surge|cancel/i, 'money'],
  [/luggage|suitcase|bag|boot|ski equipment/i, 'luggage'],
  [/child|baby|booster/i, 'child'],
  [/transmission|automatic|gearbox|engine|hybrid/i, 'gear'],
  [/winter|snow|ski|alpine|tyre|chain/i, 'snow'],
  [/seat|leather|heated|ventilated|massage|legroom|cabin|layout|recline/i, 'seat'],
  [/wheelbase|length|dimension|size|capacity/i, 'ruler'],
  [/passenger|people|group|family|solo|pair|guest|seven|three/i, 'people'],
  [/business|executive|board|meeting|corporate|roadshow|account/i, 'briefcase'],
  [/wedding|ribbon|celebration|anniversar/i, 'heart'],
  [/vip|discreet|privacy|confidential|secure|insur/i, 'shield'],
  [/charging|power|usb|socket/i, 'bolt'],
  [/change|flexible|itinerary|amend|adjust/i, 'refresh'],
  [/city|door-to-door|door to door|journey|route|intercity|stop|pickup|drop/i, 'route'],
  [/chauffeur|driver|class|saloon|van|vehicle|car|fleet|model/i, 'car'],
  [/transfer|travel|ride|everyday/i, 'pin'],
];

/** The icon key a line of text should use. */
export function featureIconName(text) {
  const label = String(text || '');
  const hit = RULES.find(([pattern]) => pattern.test(label));
  return hit ? hit[1] : 'check';
}

export default function FeatureIcon({ label, className }) {
  const name = featureIconName(label);
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}
