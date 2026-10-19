import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { API_URL } from '../../config';
import { admin } from '../../api/resources';
import { getToken } from '../../api/client';
import useFetch from '../../hooks/useFetch';
import useAdminTheme from '../../hooks/useAdminTheme';
import useToast from '../../hooks/useToast';
import Seo from '../../components/seo/Seo';
import { Icons } from '../../components/admin/AdminLayout';
import { Alert, Card, StatusBadge, Toast, cx } from '../../components/admin/widgets';
import { Spinner } from '../../components/ui';
import s from '../../components/admin/admin.module.css';

// Series colours follow the active theme: gold/teal on dark, violet/coral on light.
const SERIES = {
  dark: { primary: '#d2ad6e', secondary: '#4fd1c5' },
  light: { primary: '#6c5dd3', secondary: '#ff6b6b' },
};

// The six tile gradients, reused by the donut and the ranked list so the whole
// dashboard reads as one palette. Each resolves per theme from tokens.css.
const TONES = ['Violet', 'Emerald', 'Blue', 'Amber', 'Rose', 'Cyan'];

const PRESETS = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '12m', label: '12M' },
];

const statusColours = (c) => ({
  new: c.primary,
  contacted: c.secondary,
  confirmed: '#46c58a',
  closed: '#8d9bb5',
});

const STATUS_LABELS = { new: 'New', contacted: 'Contacted', confirmed: 'Booked', closed: 'Closed' };

/* ------------------------------------------------------------- formatting */

const fmtDay = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/**
 * Show the year whenever leaving it out would be ambiguous — a range that
 * spans a year boundary, or a comparison window from a different year.
 */
const fmtRange = (from, to, { year = 'auto', reference } = {}) => {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);

  const spansYears = start.getFullYear() !== end.getFullYear();
  const differsFromReference = reference !== undefined && end.getFullYear() !== reference;
  const withYear = year === true || (year === 'auto' && (spansYears || differsFromReference));

  const opts = { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) };
  const a = start.toLocaleDateString('en-GB', opts);
  const b = end.toLocaleDateString('en-GB', opts);
  return a === b ? a : `${a} – ${b}`;
};

function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

const relativeDay = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const that = new Date(d);
  that.setHours(0, 0, 0, 0);
  const diff = Math.round((today - that) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

/* ---------------------------------------------------------------- sparkline */

/** Tiny inline trend line for the stat cards. */
function Sparkline({ data = [], colour }) {
  if (data.length < 2) return null;

  const w = 72;
  const h = 24;
  const max = Math.max(...data, 1);
  const step = w / (data.length - 1);

  const points = data.map((value, i) => [i * step, h - (value / max) * (h - 3) - 1.5]);
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const id = `spark-${colour.replace('#', '')}`;

  return (
    <svg className={s.statSpark} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colour} stopOpacity="0.28" />
          <stop offset="100%" stopColor={colour} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={colour} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* --------------------------------------------------------------- stat card */

function StatCard({ label, icon, tone = 'Violet', value, note, delta, spark, sparkColour, live, to }) {
  let deltaNode = null;

  if (delta) {
    const { direction, percent, previous, current } = delta;
    const cls = direction === 'up' ? s.deltaUp : direction === 'down' ? s.deltaDown : s.deltaFlat;
    const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '—';

    // With no previous data a percentage is meaningless, so show the raw move.
    const text =
      percent === null
        ? direction === 'flat'
          ? 'no change'
          : `${current} vs ${previous} before`
        : `${percent}% vs ${previous} before`;

    deltaNode = (
      <span className={cx(s.statDelta, cls)}>
        {arrow} {text}
      </span>
    );
  }

  const body = (
    <>
      <div className={s.statTop}>
        <span className={s.statLabel}>{label}</span>
        <span className={s.statIcon}>{icon}</span>
      </div>

      <div className={s.statValueRow}>
        <span className={s.statValue}>{value}</span>
        {live ? (
          <span className={s.liveTag}>
            <span className={s.legendDot} style={{ background: 'var(--admin-green)' }} />
            Live
          </span>
        ) : null}
      </div>

      {deltaNode || <span className={s.statNote}>{note}</span>}
      {spark ? <Sparkline data={spark} colour={sparkColour} /> : null}
    </>
  );

  // A tile that summarises a screen takes you straight to it.
  if (to) {
    return (
      <Link to={to} className={cx(s.stat, s.statLink, s[`tone${tone}`])} aria-label={`${label} — open`}>
        <span className={s.statRail} aria-hidden="true" />
        {body}
        <span className={s.statGo} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </span>
      </Link>
    );
  }

  return (
    <div className={cx(s.stat, s[`tone${tone}`])}>
      <span className={s.statRail} aria-hidden="true" />
      {body}
    </div>
  );
}

/* ------------------------------------------------------------------ donut */

function Donut({ segments }) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  const r = 32;
  const circumference = 2 * Math.PI * r;

  let offset = 0;

  return (
    <div className={s.donutWrap}>
      <svg className={s.donut} viewBox="0 0 78 78" aria-hidden="true">
        <defs>
          {segments.map((seg, i) => (
            <linearGradient key={seg.label} id={`donut-${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={`var(--tone-${seg.tone}-a)`} />
              <stop offset="100%" stopColor={`var(--tone-${seg.tone}-b)`} />
            </linearGradient>
          ))}
        </defs>

        <circle cx="39" cy="39" r={r} fill="none" stroke="var(--admin-border)" strokeWidth="9" />
        {total > 0 &&
          segments.map((seg, i) => {
            const length = (seg.value / total) * circumference;
            // A hairline gap between slices keeps the gradients legible.
            const drawn = Math.max(length - (segments.length > 1 ? 2 : 0), 0.5);
            const dash = `${drawn} ${circumference - drawn}`;
            const node = (
              <circle
                key={seg.label}
                cx="39"
                cy="39"
                r={r}
                fill="none"
                stroke={`url(#donut-${i})`}
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                transform="rotate(-90 39 39)"
              />
            );
            offset += length;
            return node;
          })}
      </svg>

      <span className={s.donutCentre}>
        <span className={s.donutTotal}>{total}</span>
        <span className={s.donutCaption}>total</span>
      </span>
    </div>
  );
}

/* -------------------------------------------------------------- dashboard */

export default function Dashboard() {
  const toast = useToast();
  const navigate = useNavigate();
  const { isLight } = useAdminTheme();
  const colours = isLight ? SERIES.light : SERIES.dark;
  const STATUS_COLOURS = statusColours(colours);

  const [preset, setPreset] = useState('30d');
  const [custom, setCustom] = useState({ from: '', to: '' });
  const [showCustom, setShowCustom] = useState(false);
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  const usingCustom = Boolean(custom.from && custom.to);
  const params = usingCustom ? { from: custom.from, to: custom.to } : { preset };

  const load = useCallback(
    () => admin.dashboard(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [preset, custom.from, custom.to],
  );
  const { data, loading, error } = useFetch(load, [preset, custom.from, custom.to]);

  async function runExport() {
    setExporting(true);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${API_URL}/admin/dashboard/export?${qs}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enquiries-${data?.range.from}-to-${data?.range.to}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success('Enquiries exported.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  }

  function onSearch(event) {
    event.preventDefault();
    const q = search.trim();
    if (q) navigate(`/admin/enquiries?q=${encodeURIComponent(q)}`);
  }

  if (loading && !data) return <Spinner label="Loading dashboard" />;
  if (error) return <Alert tone="error">{error.message}</Alert>;

  const { range, stats, todo, series, status, breakdown, topVehicles, latest } = data;

  const statusTotal = Object.values(status).reduce((a, b) => a + b, 0);
  const breakdownMax = Math.max(...breakdown.map((b) => b.total), 1);
  // A vehicle's pull is enquiries plus WhatsApp clicks; with none, the bars
  // would all be empty, so they are left off entirely.
  const rankScore = (v) => Number(v.enquiry_count || 0) + Number(v.click_count || 0);
  const rankMax = Math.max(...topVehicles.map(rankScore), 0);

  // With a single service the meter list looks broken, so show what it is
  // being compared against.
  const breakdownRows =
    breakdown.length === 1 ? [...breakdown, { label: 'Other services', total: 0 }] : breakdown;

  return (
    <>
      <Seo title="Dashboard · Admin" noindex bare />

      {/* ------------------------------------------------------- top bar */}
      <div className={s.topBar}>
        <div className={s.topTitleRow}>
          <h1 className={s.pageTitle}>Dashboard</h1>
          <span className={s.topRangeLabel}>
            {fmtRange(range.from, range.to, { year: true })} · vs{' '}
            {fmtRange(range.previousFrom, range.previousTo, {
              reference: new Date(`${range.to}T00:00:00`).getFullYear(),
            })}
          </span>
        </div>

        <div className={s.topTools}>
          {showCustom && (
            <div className={s.inlineRange}>
              <input
                type="date"
                className={s.control}
                value={custom.from}
                max={custom.to || undefined}
                onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))}
                aria-label="From date"
              />
              <span className={s.dateRangeDash}>–</span>
              <input
                type="date"
                className={s.control}
                value={custom.to}
                min={custom.from || undefined}
                onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))}
                aria-label="To date"
              />
            </div>
          )}

          <div className={s.segment} role="tablist" aria-label="Date range">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                role="tab"
                aria-selected={!usingCustom && preset === p.value}
                className={cx(s.segmentBtn, !usingCustom && preset === p.value && s.segmentOn)}
                onClick={() => {
                  setCustom({ from: '', to: '' });
                  setShowCustom(false);
                  setPreset(p.value);
                }}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              className={cx(s.segmentBtn, (usingCustom || showCustom) && s.segmentOn)}
              onClick={() => {
                if (showCustom) setCustom({ from: '', to: '' });
                setShowCustom((v) => !v);
              }}
            >
              Custom
            </button>
          </div>

          <form className={s.topSearch} onSubmit={onSearch}>
            <svg className={s.topSearchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search enquiries…"
              aria-label="Search enquiries"
            />
          </form>

          <button type="button" className={cx(s.btn, s.btnGold)} onClick={runExport} disabled={exporting}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 3v12m0 0-4-4m4 4 4-4M4 19h16" />
            </svg>
            {exporting ? 'Exporting…' : 'Export'}
          </button>
        </div>
      </div>

      {/* --------------------------------------------------- stat cards */}
      <div className={s.statGrid}>
        <StatCard
          label="Enquiries"
          icon={Icons.enquiries}
          value={stats.enquiries.value}
          delta={stats.enquiries.delta}
          spark={stats.enquiries.spark}
          sparkColour={colours.primary}
          tone="Violet"
          to="/admin/enquiries"
        />
        <StatCard
          label="WhatsApp"
          icon={Icons.whatsapp}
          value={stats.whatsapp.value}
          delta={stats.whatsapp.delta}
          spark={stats.whatsapp.spark}
          sparkColour={colours.secondary}
          tone="Emerald"
          to="/admin/settings"
        />
        <StatCard
          label="Vehicles"
          icon={Icons.vehicles}
          value={stats.vehicles.value}
          note={`${stats.vehicles.visible} visible on site`}
          tone="Blue"
          to="/admin/vehicles"
        />
        <StatCard
          label="Reviews"
          icon={Icons.reviews}
          value={stats.reviews.value}
          note={stats.reviews.value ? 'Waiting for approval' : 'All reviewed'}
          tone="Amber"
          to="/admin/testimonials"
        />
        <StatCard
          label="Offers"
          icon={Icons.promotions}
          value={stats.offers.value}
          note="Live right now"
          live={stats.offers.value > 0}
          tone="Rose"
          to="/admin/promotions"
        />
        <StatCard
          label="Gallery"
          icon={Icons.gallery}
          value={stats.gallery.value}
          note={`${stats.gallery.servicesLive} services live`}
          tone="Cyan"
          to="/admin/gallery"
        />
      </div>

      {/* --------------------------------------------------- chip row */}
      <div className={s.chipRow}>
        <Link to="/admin/enquiries" className={cx(s.chip, todo.unanswered > 0 && s.chipAlert)}>
          {Icons.enquiries}
          {todo.unanswered} to reply
        </Link>
        <Link to="/admin/testimonials" className={cx(s.chip, todo.reviewsPending > 0 && s.chipAlert)}>
          {Icons.testimonials}
          {todo.reviewsPending} review{todo.reviewsPending === 1 ? '' : 's'} to approve
        </Link>
        <Link to="/admin/settings" className={s.chip}>
          {Icons.whatsapp}
          {todo.clicks} WhatsApp click{todo.clicks === 1 ? '' : 's'}
          {todo.clicks === 0 ? ' · check tracking' : ''}
        </Link>

        <span className={s.chipSpacer} />

        <Link to="/admin/vehicles" className={s.chip}>
          {Icons.plus}
          Vehicle
        </Link>
        <Link to="/admin/gallery" className={s.chip}>
          {Icons.upload}
          Photos
        </Link>
        <Link to="/admin/promotions" className={s.chip}>
          {Icons.promotions}
          Offer
        </Link>
        <Link to="/admin/content" className={s.chip}>
          {Icons.edit}
          Homepage
        </Link>
      </div>

      {/* ------------------------------------------- chart + breakdown */}
      <div className={s.dashGrid}>
        <Card to="/admin/enquiries">
          <div className={s.cardHead}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <h2 className={s.cardTitle}>Performance</h2>
              <span className={s.cardSubtle}>daily</span>
            </div>
            <div className={s.legendChips}>
              <span className={s.legendChip}>
                <span className={s.legendLine} style={{ background: colours.primary }} />
                Enquiries <span className={s.legendValue}>{stats.enquiries.value}</span>
              </span>
              <span className={s.legendChip}>
                <span
                  className={s.legendLine}
                  style={{ background: `repeating-linear-gradient(90deg, ${colours.secondary} 0 4px, transparent 4px 7px)` }}
                />
                WhatsApp <span className={s.legendValue}>{stats.whatsapp.value}</span>
              </span>
            </div>
          </div>

          <div className={s.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillEnq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colours.primary} stopOpacity="0.46" />
                    <stop offset="62%" stopColor={colours.primary} stopOpacity="0.1" />
                    <stop offset="100%" stopColor={colours.primary} stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="fillWa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colours.secondary} stopOpacity="0.26" />
                    <stop offset="100%" stopColor={colours.secondary} stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="strokeEnq" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={colours.secondary} />
                    <stop offset="100%" stopColor={colours.primary} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="var(--admin-border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={fmtDay}
                  tick={{ fill: 'var(--admin-text-faint)', fontSize: 11 }}
                  axisLine={{ stroke: 'var(--admin-border)' }}
                  tickLine={false}
                  minTickGap={28}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: 'var(--admin-text-faint)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    background: isLight ? '#ffffff' : '#1d2a3b',
                    border: `1px solid ${isLight ? '#e4ded1' : '#2a3a4e'}`,
                    borderRadius: 10,
                    color: isLight ? '#1d2733' : '#e6ecf4',
                    fontSize: 13,
                    boxShadow: isLight ? '0 8px 24px rgba(38,30,15,.14)' : 'none',
                  }}
                  labelStyle={{ color: colours.primary, marginBottom: 4 }}
                  labelFormatter={fmtDay}
                />
                <Area
                  type="monotone"
                  dataKey="enquiries"
                  name="Enquiries"
                  stroke="url(#strokeEnq)"
                  strokeWidth={2.6}
                  fill="url(#fillEnq)"
                  dot={false}
                  activeDot={{ r: 5, fill: colours.primary, stroke: 'var(--admin-surface)', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  name="WhatsApp"
                  stroke={colours.secondary}
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  fill="url(#fillWa)"
                  dot={false}
                  activeDot={{ r: 4.5, fill: colours.secondary, stroke: 'var(--admin-surface)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card to="/admin/enquiries">
          <div className={s.cardHead}>
            <h2 className={s.cardTitle}>Breakdown</h2>
            <Link to="/admin/enquiries" className={s.actionLink}>
              View all →
            </Link>
          </div>

          <div className={s.cardPad}>
            <div className={s.donutRow}>
              <Donut
                segments={breakdown.slice(0, 5).map((b, i) => ({
                  label: b.label,
                  value: b.total,
                  tone: TONES[i % TONES.length].toLowerCase(),
                }))}
              />

              <div className={s.meterList}>
                {breakdownRows.length ? (
                  breakdownRows.slice(0, 4).map((b) => (
                    <div className={s.meterRow} key={b.label}>
                      <div className={s.meterTop}>
                        <span className={s.meterLabel}>{b.label}</span>
                        <span className={s.meterValue}>{b.total}</span>
                      </div>
                      <div className={s.meter}>
                        <div className={s.meterFill} style={{ width: `${(b.total / breakdownMax) * 100}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={s.statNote}>No enquiries in this period.</p>
                )}
              </div>
            </div>

            <div className={s.statusBlock}>
              <span className={s.dateRangeLabel}>Enquiry status</span>

              <div className={s.statusBar} style={{ marginTop: 10 }}>
                {statusTotal > 0 &&
                  Object.entries(status).map(([key, value]) =>
                    value > 0 ? (
                      <span
                        key={key}
                        className={s.statusSeg}
                        style={{ width: `${(value / statusTotal) * 100}%`, background: STATUS_COLOURS[key] }}
                      />
                    ) : null,
                  )}
              </div>

              <div className={s.statusLegend}>
                {Object.entries(status).map(([key, value]) => (
                  <span className={s.legendItem} key={key}>
                    <span className={s.legendDot} style={{ background: STATUS_COLOURS[key] }} />
                    {STATUS_LABELS[key]} <span className={s.legendCount}>{value}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ------------------------------------ latest enquiries + ranked */}
      <div className={s.dashGrid}>
        <Card to="/admin/enquiries">
          <div className={s.cardHead}>
            <h2 className={s.cardTitle}>Latest enquiries</h2>
            <Link to="/admin/enquiries" className={s.actionLink}>
              View all →
            </Link>
          </div>

          {latest.length ? (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Route</th>
                    <th>Received</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {latest.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className={s.rowMedia}>
                          <span className={s.rowAvatar}>{initials(row.full_name)}</span>
                          <div>
                            <div className={s.cellStrong}>{row.full_name}</div>
                            <div className={s.cellMuted}>{row.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td>{row.service_type || row.vehicle_name || '—'}</td>
                      <td>
                        {row.pickup || row.dropoff ? (
                          <span className={s.routeCell}>
                            {row.pickup || '?'}
                            <span className={s.routeArrow}>→</span>
                            {row.dropoff || '?'}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{relativeDay(row.created_at)}</td>
                      <td>
                        <StatusBadge
                          tone={row.status === 'new' ? 'warn' : row.status === 'closed' ? 'off' : 'live'}
                          onLabel={STATUS_LABELS[row.status] || row.status}
                          dot
                        />
                      </td>
                      <td>
                        <div className={s.actionCell}>
                          <a
                            className={s.iconBtn}
                            href={`https://wa.me/${String(row.phone || '').replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Reply to ${row.full_name} on WhatsApp`}
                            title="Reply on WhatsApp"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2a10 10 0 0 0-8.7 15l-1.2 4.4L6.7 20A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20z" />
                              <path d="M16.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.6.2l-.7 1c-.2.2-.3.2-.6.1-1.6-.7-2.7-1.8-3.2-3-.2-.4 0-.5.1-.7l.4-.5c.1-.2.1-.3 0-.5l-.9-2c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4-.6.7-.9 1.5-.9 2.4 0 1.5 1.1 2.9 1.2 3.1 1.4 2.2 3.1 3.3 5.2 3.8.8.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.4.2-.6.2-1.2.2-1.3-.1-.1-.2-.2-.5-.3z" />
                            </svg>
                          </a>
                          <Link to="/admin/enquiries" className={cx(s.btn, s.btnOutline, s.btnSm)}>
                            Open
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={s.empty}>No enquiries in this period.</div>
          )}
        </Card>

        <Card to="/admin/vehicles">
          <div className={s.cardHead}>
            <h2 className={s.cardTitle}>Most enquired</h2>
            <Link to="/admin/vehicles" className={s.actionLink}>
              All vehicles →
            </Link>
          </div>

          <div className={s.cardPad} style={{ paddingTop: 4, paddingBottom: 8 }}>
            {topVehicles.length ? (
              topVehicles.map((vehicle, i) => (
                <div className={cx(s.rankRow, s[`tone${TONES[i % TONES.length]}`])} key={vehicle.id}>
                  <span className={s.rankNum}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={s.rankBody}>
                    <span className={s.rankName}>{vehicle.name}</span>
                    {rankMax > 0 && (
                      <span className={s.rankTrack}>
                        <span
                          className={s.rankBar}
                          style={{ width: `${Math.max((rankScore(vehicle) / rankMax) * 100, 3)}%` }}
                        />
                      </span>
                    )}
                  </span>
                  <span className={s.rankValue}>
                    {vehicle.enquiry_count} · {vehicle.click_count}
                  </span>
                </div>
              ))
            ) : (
              <div className={s.empty}>No vehicles yet.</div>
            )}
          </div>
        </Card>
      </div>

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
