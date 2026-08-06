'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';
import StampBadge from '../../components/StampBadge';
import styles from './assignments.module.css';

export default function AssignmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api
      .get('/assignments')
      .then((res) => setAssignments(res.data.assignments))
      .catch(() => setError('Could not load assignments.'))
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || !user) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <div>
            <p className={styles.eyebrow}>Assignments</p>
            <h1 className={styles.title}>
              {user.role === 'STUDENT' ? 'Your assignments' : 'Assignments'}
            </h1>
          </div>
          {user.role === 'TEACHER' && (
            <Link href="/assignments/new" className={styles.newButton}>
              + New assignment
            </Link>
          )}
        </div>
      </div>

      {fetching && <p>Loading assignments…</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!fetching && !error && assignments.length === 0 && (
        <div className={styles.empty}>
          {user.role === 'STUDENT'
            ? "No assignments yet. Once your teacher publishes one, it'll show up here."
            : 'No assignments found.'}
        </div>
      )}

      <div className={styles.list}>
        {assignments.map((a) => (
          <Link href={`/assignments/${a.id}`} key={a.id} className={styles.card}>
            <div className={styles.cardTop}>
              <h3 className={styles.cardTitle}>{a.title}</h3>
              <StampBadge value={a.status} />
            </div>
            <p className={styles.meta}>
              {a.subject.name} &middot; {a.class.name}
            </p>
            <p className={styles.deadline}>
              Due{' '}
              {new Date(a.deadline).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
