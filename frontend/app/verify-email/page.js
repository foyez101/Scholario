'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { useToast } from '../../lib/ToastContext';
import cardStyles from '../login/login.module.css';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/verify-email', { email, code });
      setSession(res.data.token, res.data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError('');
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      showToast('A new code was sent, if that account needs verifying.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend the code.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className={cardStyles.wrap}>
      <div className={cardStyles.card}>
        <p className={cardStyles.eyebrow}>Verify your email</p>
        <h1 className={cardStyles.title}>Check your inbox</h1>
        <p className={cardStyles.subtitle}>
          We sent a 6-digit code to your email. Enter it below to activate your account.
        </p>

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

          <label className={cardStyles.label}>
            Verification code
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className={cardStyles.input}
              placeholder="123456"
            />
          </label>

          {error && <p className={cardStyles.error}>{error}</p>}

          <button type="submit" disabled={submitting} className={cardStyles.button}>
            {submitting ? 'Verifying…' : 'Verify account'}
          </button>
        </form>

        <p className={cardStyles.footer}>
          Didn&apos;t get a code?{' '}
          <button type="button" onClick={handleResend} disabled={resending} className={cardStyles.linkButton}>
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        </p>
        <p className={cardStyles.footer}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
