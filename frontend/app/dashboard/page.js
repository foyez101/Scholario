'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import StampBadge from '../../components/StampBadge';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <p>Loading…</p>;
  }

  return (
    <div className={styles.card}>
      <p className={styles.eyebrow}>Dashboard</p>
      <h1 className={styles.title}>Welcome, {user.name.split(' ')[0]}</h1>
      <div className={styles.row}>
        <span>Signed in as</span>
        <StampBadge value={user.role} />
      </div>
      <p className={styles.note}>
        This is a starting point — role-specific views (classes, assignments, and
        submissions) get built next.
      </p>
    </div>
  );
}
