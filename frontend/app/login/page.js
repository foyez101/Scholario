'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import PasswordInput from '../../components/PasswordInput';
import styles from './login.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slowHint, setSlowHint] = useState(false);
  const hintTimer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(hintTimer.current);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setSlowHint(false);
    setSubmitting(true);

    // If the server hasn't responded after a few seconds, it's likely waking
    // up from sleep (free-tier hosting) - let the person know, so a slow
    // response doesn't just look like the page is stuck.
    hintTimer.current = setTimeout(() => setSlowHint(true), 4000);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError(
          'The server took too long to respond. It may be waking up after being idle - please try again in a moment.'
        );
      } else if (!err.response) {
        setError('Could not reach the server. Check your internet connection and try again.');
      } else {
        const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
        setError(msg);
        if (msg.toLowerCase().includes('verify')) {
          setNeedsVerification(true);
        }
      }
    } finally {
      clearTimeout(hintTimer.current);
      setSlowHint(false);
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Sign in</p>
        <h1 className={styles.title}>Welcome back</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Password
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              autoComplete="current-password"
            />
          </label>

          <div className={styles.rightAlign}>
            <Link href="/forgot-password" className={styles.smallLink}>
              Forgot password?
            </Link>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {needsVerification && (
            <Link href={`/verify-email?email=${encodeURIComponent(email)}`} className={styles.linkButton}>
              Go to verification &rarr;
            </Link>
          )}
          {submitting && slowHint && (
            <p className={styles.hint}>Still connecting - the server may be waking up. This can take up to a minute.</p>
          )}

          <button type="submit" disabled={submitting} className={styles.button}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className={styles.footer}>
          New here? <Link href="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
