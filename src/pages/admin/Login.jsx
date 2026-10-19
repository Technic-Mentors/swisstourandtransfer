import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Seo from '../../components/seo/Seo';
import { Alert } from '../../components/admin/widgets';
import { Button } from '../../components/ui';
import { Field } from '../../components/forms/Fields';
import s from '../../components/admin/admin.module.css';

/**
 * Shown at /admin whenever nobody is signed in.
 * On success AuthContext flips and the same route renders the dashboard.
 */
export default function Login() {
  const { login, sessionMessage } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email.trim(), form.password);
    } catch (err) {
      setError(err.message || 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Seo title="Admin sign in" noindex bare />

      <div className={s.loginWrap}>
        <div className={s.loginCard}>
          <div className={s.loginBrand}>
            <img src="/logo-mark.png" alt="" className={s.loginMark} width="96" height="54" />
            <div className={s.loginName}>SWISS</div>
            <div className={s.loginSub}>Tour &amp; Transfer</div>
          </div>

          <h1 className={s.loginTitle}>Admin panel</h1>
          <p className={s.loginText}>Sign in to manage vehicles, content and enquiries.</p>

          {sessionMessage && <Alert tone="info">{sessionMessage}</Alert>}
          {error && <Alert tone="error">{error}</Alert>}

          <form className={s.loginForm} onSubmit={onSubmit}>
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              autoComplete="username"
              required
            />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            <Button type="submit" full size="lg" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className={s.loginFoot}>Authorised users only.</p>
        </div>
      </div>
    </>
  );
}
