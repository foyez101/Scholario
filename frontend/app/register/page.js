'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import cardStyles from '../login/login.module.css';
import styles from './register.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
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
            <input
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
              minLength={6}
              className={cardStyles.input}
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
