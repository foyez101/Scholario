'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import styles from './admin.module.css';

const TABS = [
  { href: '/admin/classes', label: 'Classes' },
  { href: '/admin/subjects', label: 'Subjects' },
  { href: '/admin/teachers', label: 'Teachers' },
  { href: '/admin/students', label: 'Students' },
];

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Admin</p>
        <h1 className={styles.title}>Manage school data</h1>
      </div>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${styles.tab} ${pathname === tab.href ? styles.tabActive : ''}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div>{children}</div>
    </div>
  );
}
