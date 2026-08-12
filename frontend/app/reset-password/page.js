'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import { useToast } from '../../lib/ToastContext';
import PasswordInput from '../../components/PasswordInput';
import PasswordStrength, { isPasswordStrong } from '../../components/PasswordStrength';
import cardStyles from '../login/login.module.css';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!isPasswordStrong(newPassword)) {
      setError('Please meet all the password requirements below.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { email, code, newPassword });
      showToast('Password updated. You can now log in.');
      router.push('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={cardStyles.wrap}>
      <div className={cardStyles.card}>
        <p className={cardStyles.eyebrow}>Reset password</p>
        <h1 className={cardStyles.title}>Set a new password</h1>

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
            Reset code
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className={cardStyles.input}
              placeholder="123456"
            />
          </label>

          <label className={cardStyles.label}>
            New password
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className={cardStyles.input}
              autoComplete="new-password"
            />
          </label>
          <PasswordStrength password={newPassword} />

          <label className={cardStyles.label}>
            Confirm new password
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={cardStyles.input}
              autoComplete="new-password"
            />
          </label>

          {error && <p className={cardStyles.error}>{error}</p>}

          <button type="submit" disabled={submitting} className={cardStyles.button}>
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </form>

        <p className={cardStyles.footer}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
