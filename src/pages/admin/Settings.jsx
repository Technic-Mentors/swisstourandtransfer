import { useCallback, useState } from 'react';
import { admin } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import Seo from '../../components/seo/Seo';
import { AdminPageHead } from '../../components/admin/AdminLayout';
import {
  AdminButton,
  AdminCheckbox,
  AdminField,
  AdminTextArea,
  Alert,
  Card,
  CardHead,
  Toast,
} from '../../components/admin/widgets';
import { Spinner } from '../../components/ui';
import s from '../../components/admin/admin.module.css';

const BOOLEAN_KEYS = ['show_floating_whatsapp', 'show_sticky_mobile_bar', 'announcement_enabled'];

export default function Settings() {
  const toast = useToast();
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwBusy, setPwBusy] = useState(false);
  const [testTo, setTestTo] = useState('');
  const [testBusy, setTestBusy] = useState(false);

  const load = useCallback(() => admin.settings(), []);
  const { data, loading, error, refetch } = useFetch(load, []);
  const settings = data?.settings ?? {};
  const mailConfigured = Boolean(data?.mail?.configured);

  const value = (key, fallback = '') => draft[key] ?? settings[key] ?? fallback;
  const flag = (key) => {
    const raw = draft[key] ?? settings[key];
    return raw === '1' || raw === 1 || raw === true;
  };

  const set = (key) => (e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }));
  const setFlag = (key) => (e) => setDraft((prev) => ({ ...prev, [key]: e.target.checked ? '1' : '0' }));

  const dirty = Object.keys(draft).length > 0;

  async function save() {
    setSaving(true);
    try {
      await admin.saveSettings(draft);
      setDraft({});
      refetch();
      toast.success('Settings saved. Every page and booking button is updated.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function sendTest() {
    setTestBusy(true);
    try {
      const res = await admin.sendTestEmail(testTo || value('notification_email') || value('email'));
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTestBusy(false);
    }
  }

  async function changePassword() {
    if (pw.new_password !== pw.confirm) {
      toast.error('The new passwords do not match.');
      return;
    }
    if (pw.new_password.length < 8) {
      toast.error('The new password must be at least 8 characters.');
      return;
    }

    setPwBusy(true);
    try {
      await admin.changePassword({
        current_password: pw.current_password,
        new_password: pw.new_password,
      });
      setPw({ current_password: '', new_password: '', confirm: '' });
      toast.success('Password updated.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPwBusy(false);
    }
  }

  if (loading) return <Spinner label="Loading settings" />;

  return (
    <>
      <Seo title="WhatsApp & contact · Admin" noindex bare />

      <AdminPageHead
        title="WhatsApp &amp; contact details"
        subtitle="Changes here update every page and every booking button at once."
      >
        <AdminButton variant="gold" onClick={save} disabled={saving || !dirty}>
          {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
        </AdminButton>
      </AdminPageHead>

      {error && <Alert tone="error">{error.message}</Alert>}

      <div className={s.split}>
        <div>
          <Card style={{ marginBottom: 22 }}>
            <CardHead title="WhatsApp booking" />
            <div className={s.cardPad}>
              <div className={s.formGrid}>
                <AdminField
                  label="Main WhatsApp number"
                  required
                  value={value('whatsapp_number')}
                  onChange={set('whatsapp_number')}
                  placeholder="41791234567"
                  hint="International format, digits only is safest. This is the number every booking button opens."
                />

                <AdminTextArea
                  label="Vehicle message template"
                  rows={4}
                  value={value('whatsapp_template_vehicle')}
                  onChange={set('whatsapp_template_vehicle')}
                  hint="Placeholders: {vehicle} {city} {service} {page_url}"
                />

                <AdminTextArea
                  label="General message template"
                  rows={3}
                  value={value('whatsapp_template_general')}
                  onChange={set('whatsapp_template_general')}
                />

                <AdminTextArea
                  label="City page template"
                  rows={3}
                  value={value('whatsapp_template_city')}
                  onChange={set('whatsapp_template_city')}
                  hint="Used on city landing pages. {city} is replaced automatically."
                />

                <AdminTextArea
                  label="Service page template"
                  rows={3}
                  value={value('whatsapp_template_service')}
                  onChange={set('whatsapp_template_service')}
                  hint="Used on service pages. {service} is replaced automatically."
                />

                <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
                  <AdminCheckbox
                    label="Show the floating WhatsApp button"
                    checked={flag('show_floating_whatsapp')}
                    onChange={setFlag('show_floating_whatsapp')}
                  />
                  <AdminCheckbox
                    label="Show the sticky mobile bar"
                    checked={flag('show_sticky_mobile_bar')}
                    onChange={setFlag('show_sticky_mobile_bar')}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHead title="Contact details" />
            <div className={s.cardPad}>
              <div className={s.formGrid}>
                <div className={s.grid2}>
                  <AdminField label="Company name" value={value('company_name')} onChange={set('company_name')} />
                  <AdminField label="Tagline" value={value('tagline')} onChange={set('tagline')} />
                </div>

                <div className={s.grid2}>
                  <AdminField label="Phone" value={value('phone')} onChange={set('phone')} />
                  <AdminField label="Email" type="email" value={value('email')} onChange={set('email')} />
                </div>

                <AdminField label="Address" value={value('address')} onChange={set('address')} />
                <AdminField
                  label="Opening hours"
                  value={value('opening_hours')}
                  onChange={set('opening_hours')}
                />

                <AdminField
                  label="Google Maps embed URL"
                  value={value('maps_embed_url')}
                  onChange={set('maps_embed_url')}
                  hint="In Google Maps: Share → Embed a map → copy the src from the iframe."
                />
                <AdminField
                  label="Google Maps link"
                  value={value('maps_link')}
                  onChange={set('maps_link')}
                  hint="Opens when someone taps the address."
                />
              </div>
            </div>
          </Card>
        </div>

        <div className={s.splitPanel}>
          <Card style={{ marginBottom: 22 }}>
            <CardHead title="Enquiry emails" />
            <div className={s.cardPad}>
              {mailConfigured ? (
                <Alert tone="success">
                  Email is configured. Every enquiry submitted through the website is sent to the
                  address below.
                </Alert>
              ) : (
                <Alert tone="info">
                  Enquiry emails are off, so enquiries are only saved and listed under Enquiries.
                  To turn them on, put your Gmail address and a Google App Password into
                  <strong> Backend/.env</strong> as <strong>GMAIL_USER</strong> and{' '}
                  <strong>GMAIL_APP_PASSWORD</strong>, then restart the backend.
                </Alert>
              )}

              <div className={s.formGrid}>
                <AdminField
                  label="Send new enquiries to"
                  type="email"
                  value={value('notification_email')}
                  onChange={set('notification_email')}
                  placeholder="bookings@swisstourtransfer.ch"
                  hint="Leave empty to use the contact email address above."
                />

                <AdminField
                  label="Send a test to (optional)"
                  type="email"
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder="Defaults to the address above"
                />
              </div>

              <div className={s.formFoot}>
                <div className={s.formFootActions}>
                  <AdminButton variant="outline" onClick={sendTest} disabled={testBusy || !mailConfigured}>
                    {testBusy ? 'Sending…' : 'Send test email'}
                  </AdminButton>
                </div>
              </div>
            </div>
          </Card>

          <Card style={{ marginBottom: 22 }}>
            <CardHead title="Social media" />
            <div className={s.cardPad}>
              <div className={s.formGrid}>
                <AdminField
                  label="Instagram"
                  value={value('social_instagram')}
                  onChange={set('social_instagram')}
                  placeholder="https://instagram.com/…"
                />
                <AdminField
                  label="Facebook"
                  value={value('social_facebook')}
                  onChange={set('social_facebook')}
                  placeholder="https://facebook.com/…"
                />
                <AdminField
                  label="LinkedIn"
                  value={value('social_linkedin')}
                  onChange={set('social_linkedin')}
                  placeholder="https://linkedin.com/…"
                />
                <AdminField
                  label="TikTok"
                  value={value('social_tiktok')}
                  onChange={set('social_tiktok')}
                  placeholder="Leave empty to hide"
                />
              </div>
            </div>
          </Card>

          <Card style={{ marginBottom: 22 }}>
            <CardHead title="Trust signals" />
            <div className={s.cardPad}>
              <div className={s.formGrid}>
                <div className={s.grid2}>
                  <AdminField
                    label="Google rating"
                    value={value('google_rating')}
                    onChange={set('google_rating')}
                    placeholder="4.9"
                  />
                  <AdminField
                    label="Review count"
                    value={value('google_review_count')}
                    onChange={set('google_review_count')}
                    placeholder="127"
                  />
                </div>
                <AdminField
                  label="Typical reply time (minutes)"
                  value={value('reply_time_minutes')}
                  onChange={set('reply_time_minutes')}
                  placeholder="10"
                  hint="Shown on the booking and enquiry pages."
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardHead title="Your password" />
            <div className={s.cardPad}>
              <div className={s.formGrid}>
                <AdminField
                  label="Current password"
                  type="password"
                  autoComplete="current-password"
                  value={pw.current_password}
                  onChange={(e) => setPw((p) => ({ ...p, current_password: e.target.value }))}
                />
                <AdminField
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                  value={pw.new_password}
                  onChange={(e) => setPw((p) => ({ ...p, new_password: e.target.value }))}
                  hint="At least 8 characters."
                />
                <AdminField
                  label="Confirm new password"
                  type="password"
                  autoComplete="new-password"
                  value={pw.confirm}
                  onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                />
              </div>

              <div className={s.formFoot}>
                <div className={s.formFootActions}>
                  <AdminButton
                    onClick={changePassword}
                    disabled={pwBusy || !pw.current_password || !pw.new_password}
                  >
                    {pwBusy ? 'Updating…' : 'Change password'}
                  </AdminButton>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
