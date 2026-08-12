'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import cardStyles from '../login/login.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className={cardStyles.wrap}>
        <div className={cardStyles.card}>
          <p className={cardStyles.eyebrow}>Check your email</p>
          <h1 className={cardStyles.title}>Reset code sent</h1>
          <p className={cardStyles.subtitle}>
            If an account exists for {email}, a reset code was sent. Enter it on the next screen.
          </p>
          <Link
            href={`/reset-password?email=${encodeURIComponent(email)}`}
            className={`${cardStyles.button} ${cardStyles.buttonLink}`}
          >
            Enter reset code
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cardStyles.wrap}>
      <div className={cardStyles.card}>
        <p className={cardStyles.eyebrow}>Forgot password</p>
        <h1 className={cardStyles.title}>Reset your password</h1>
        <p className={cardStyles.subtitle}>Enter your account email and we&apos;ll send you a reset code.</p>

        <form onSubmit={handleSubmit} className={cardStyles.form}>
          <label className={cardStyles.label}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={cardStyles.input}
            />
          </label>

          {error && <p className={cardStyles.error}>{error}</p>}

          <button type="submit" disabled={submitting} className={cardStyles.button}>
            {submitting ? 'Sending…' : 'Send reset code'}
          </button>
        </form>

        <p className={cardStyles.footer}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
