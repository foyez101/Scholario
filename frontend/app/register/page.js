'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import PasswordInput from '../../components/PasswordInput';
import PasswordStrength, { isPasswordStrong } from '../../components/PasswordStrength';
import cardStyles from '../login/login.module.css';
import styles from './register.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [slowHint, setSlowHint] = useState(false);
  const hintTimer = useRef(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!isPasswordStrong(form.password)) {
      setError('Please meet all the password requirements below.');
      return;
    }

    setSlowHint(false);
    setSubmitting(true);
    hintTimer.current = setTimeout(() => setSlowHint(true), 4000);

    try {
      const res = await register(form.name, form.email, form.password, form.role);
      router.push(`/verify-email?email=${encodeURIComponent(res.email)}`);
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError(
          'The server took too long to respond. It may be waking up after being idle - please try again in a moment.'
        );
      } else if (!err.response) {
        setError('Could not reach the server. Check your internet connection and try again.');
      } else {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      clearTimeout(hintTimer.current);
      setSlowHint(false);
      setSubmitting(false);
    }
  }

  return (
    <div className={cardStyles.wrap}>
      <div className={cardStyles.card}>
        <p className={cardStyles.eyebrow}>Create account</p>
        <h1 className={cardStyles.title}>Join Scholario</h1>

        <form onSubmit={handleSubmit} className={cardStyles.form}>
          <label className={cardStyles.label}>
            Full name
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
              className={cardStyles.input}
            />
          </label>

          <label className={cardStyles.label}>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
              className={cardStyles.input}
            />
          </label>

          <label className={cardStyles.label}>
            Password
            <PasswordInput
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
              className={cardStyles.input}
              autoComplete="new-password"
            />
          </label>
          <PasswordStrength password={form.password} />

          <label className={cardStyles.label}>
            Confirm password
            <PasswordInput
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              required
              className={cardStyles.input}
              autoComplete="new-password"
            />
          </label>

          <div className={cardStyles.label}>
            I am a...
            <div className={styles.roleRow}>
              {['STUDENT', 'TEACHER'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => update('role', r)}
                  className={`${styles.roleOption} ${form.role === r ? styles.roleSelected : ''}`}
                >
                  {r === 'STUDENT' ? 'Student' : 'Teacher'}
                </button>
              ))}
            </div>
          </div>

          {error && <p className={cardStyles.error}>{error}</p>}
          {submitting && slowHint && (
            <p className={cardStyles.hint}>
              Still connecting - the server may be waking up. This can take up to a minute.
            </p>
          )}

          <button type="submit" disabled={submitting} className={cardStyles.button}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className={cardStyles.footer}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
