import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { admin as adminApi } from '../../api/resources';
import { useAuth } from '../../context/AuthContext';
import useToast from '../../hooks/useToast';
import Seo from '../../components/seo/Seo';
import {
  AdminButton,
  AdminField,
  Alert,
  FormBar,
  FormPageHead,
  FormSection,
  Toast,
} from '../../components/admin/widgets';
import s from '../../components/admin/admin.module.css';

const ico = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

const PersonIcon = (
  <svg viewBox="0 0 24 24" {...ico}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </svg>
);

const LockIcon = (
  <svg viewBox="0 0 24 24" {...ico}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7" />
  </svg>
);

/**
 * Your own account: the details shown around the panel, and the password.
 * They save separately so a slip in one cannot undo the other.
 */
export default function Profile() {
  const navigate = useNavigate();
  const toast = useToast();
  const { admin, updateAdmin } = useAuth();

  const [details, setDetails] = useState({ name: '', email: '' });
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    setDetails({ name: admin?.name || '', email: admin?.email || '' });
  }, [admin?.name, admin?.email]);

  const setDetail = (key) => (e) => setDetails((d) => ({ ...d, [key]: e.target.value }));
  const setPassword = (key) => (e) => setPw((p) => ({ ...p, [key]: e.target.value }));

  async function saveDetails() {
    setSavingDetails(true);
    setDetailsError('');
    try {
      const data = await adminApi.updateProfile(details);
      updateAdmin(data.admin);
      toast.success('Profile updated.');
    } catch (err) {
      setDetailsError(err.message);
    } finally {
      setSavingDetails(false);
    }
  }

  async function savePassword() {
    setPwError('');

    if (pw.new_password.length < 8) {
      setPwError('The new password must be at least 8 characters.');
      return;
    }
    if (pw.new_password !== pw.confirm) {
      setPwError('The two new passwords do not match.');
      return;
    }

    setSavingPw(true);
    try {
      await adminApi.changePassword({
        current_password: pw.current_password,
        new_password: pw.new_password,
      });
      setPw({ current_password: '', new_password: '', confirm: '' });
      toast.success('Password changed.');
    } catch (err) {
      setPwError(err.message);
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <>
      <Seo title="Your profile · Admin" noindex bare />

      <FormPageHead
        title="Your profile"
        subtitle="The name and email shown around the admin panel, and your password."
        onBack={() => navigate('/admin')}
      >
        <AdminButton variant="gold" onClick={saveDetails} disabled={savingDetails}>
          {savingDetails ? 'Saving…' : 'Save profile'}
        </AdminButton>
      </FormPageHead>

      <FormSection title="Your details" icon={PersonIcon}>
        {detailsError && <Alert tone="error">{detailsError}</Alert>}

        <div className={s.formGrid}>
          <AdminField
            label="Name"
            value={details.name}
            onChange={setDetail('name')}
            placeholder="Site Administrator"
            required
          />
          <AdminField
            label="Email"
            type="email"
            value={details.email}
            onChange={setDetail('email')}
            hint="This is the address you sign in with."
            required
          />
        </div>
      </FormSection>

      <FormSection title="Password" icon={LockIcon}>
        {pwError && <Alert tone="error">{pwError}</Alert>}

        <div className={s.formGrid}>
          <AdminField
            label="Current password"
            type="password"
            value={pw.current_password}
            onChange={setPassword('current_password')}
            autoComplete="current-password"
          />
          <AdminField
            label="New password"
            type="password"
            value={pw.new_password}
            onChange={setPassword('new_password')}
            hint="At least 8 characters."
            autoComplete="new-password"
          />
          <AdminField
            label="Confirm new password"
            type="password"
            value={pw.confirm}
            onChange={setPassword('confirm')}
            autoComplete="new-password"
          />
        </div>

        <div className={s.formBarInline}>
          <AdminButton
            variant="outline"
            onClick={savePassword}
            disabled={savingPw || !pw.current_password || !pw.new_password}
          >
            {savingPw ? 'Changing…' : 'Change password'}
          </AdminButton>
        </div>
      </FormSection>

      <FormBar note="Your details and your password save separately.">
        <AdminButton variant="outline" onClick={() => navigate('/admin')} disabled={savingDetails}>
          Back to dashboard
        </AdminButton>
        <AdminButton variant="gold" onClick={saveDetails} disabled={savingDetails}>
          {savingDetails ? 'Saving…' : 'Save profile'}
        </AdminButton>
      </FormBar>

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
