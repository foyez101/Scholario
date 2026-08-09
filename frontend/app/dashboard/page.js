'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import api from '../../lib/api';
import StampBadge from '../../components/StampBadge';
import styles from './dashboard.module.css';

const QUICK_LINKS = {
  STUDENT: [
    {
      href: '/assignments',
      label: 'Your assignments',
      desc: 'See what\u2019s due, submit your work, and check your marks.',
    },
  ],
  TEACHER: [
    {
      href: '/assignments',
      label: 'Assignments',
      desc: 'Create, publish, and grade assignments for your classes.',
    },
    {
      href: '/assignments/new',
      label: 'New assignment',
      desc: 'Set up a new assignment with a deadline and marks.',
    },
  ],
  ADMIN: [
    { href: '/admin/classes', label: 'Classes & subjects', desc: 'Add and manage classes and subjects.' },
    { href: '/admin/teachers', label: 'Teacher assignments', desc: 'Assign teachers to subjects and classes.' },
    { href: '/admin/students', label: 'Enrollments', desc: 'Enroll students into classes.' },
  ],
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [fetchingStats, setFetchingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadStats() {
    setFetchingStats(true);
    try {
      if (user.role === 'STUDENT') {
        const [assignmentsRes, submissionsRes] = await Promise.all([
          api.get('/assignments'),
          api.get('/submissions'),
        ]);
        const assignments = assignmentsRes.data.assignments;
        const submissions = submissionsRes.data.submissions;
        const submittedIds = new Set(submissions.map((s) => s.assignmentId));
        const graded = submissions.filter((s) => s.status === 'GRADED').length;
        const pending = assignments.filter((a) => !submittedIds.has(a.id)).length;
        setStats([
          { label: 'Assignments', value: assignments.length },
          { label: 'Submitted', value: submissions.length },
          { label: 'Graded', value: graded },
          { label: 'To do', value: pending },
        ]);
      } else if (user.role === 'TEACHER') {
        const [assignmentsRes, submissionsRes] = await Promise.all([
          api.get('/assignments'),
          api.get('/submissions'),
        ]);
        const assignments = assignmentsRes.data.assignments;
        const submissions = submissionsRes.data.submissions;
        const published = assignments.filter((a) => a.status === 'PUBLISHED').length;
        const drafts = assignments.filter((a) => a.status === 'DRAFT').length;
        const needsGrading = submissions.filter((s) => s.status !== 'GRADED').length;
        setStats([
          { label: 'Assignments', value: assignments.length },
          { label: 'Published', value: published },
          { label: 'Drafts', value: drafts },
          { label: 'Needs grading', value: needsGrading },
        ]);
      } else if (user.role === 'ADMIN') {
        const [classesRes, subjectsRes, teachersRes, studentsRes] = await Promise.all([
          api.get('/admin/classes'),
          api.get('/admin/subjects'),
          api.get('/admin/users', { params: { role: 'TEACHER' } }),
          api.get('/admin/users', { params: { role: 'STUDENT' } }),
        ]);
        setStats([
          { label: 'Classes', value: classesRes.data.classes.length },
          { label: 'Subjects', value: subjectsRes.data.subjects.length },
          { label: 'Teachers', value: teachersRes.data.users.length },
          { label: 'Students', value: studentsRes.data.users.length },
        ]);
      }
    } catch {
      setStats(null);
    } finally {
      setFetchingStats(false);
    }
  }

  if (loading || !user) {
    return <p>Loading…</p>;
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Dashboard</p>
          <h1 className={styles.title}>Welcome, {user.name.split(' ')[0]}</h1>
        </div>
        <StampBadge value={user.role} />
      </div>

      {!fetchingStats && stats && (
        <div className={styles.statsGrid}>
          {stats.map((s) => (
            <div key={s.label} className={styles.statCard}>
              <p className={styles.statValue}>{s.value}</p>
              <p className={styles.statLabel}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className={styles.linksGrid}>
        {(QUICK_LINKS[user.role] || []).map((link) => (
          <Link key={link.href} href={link.href} className={styles.linkCard}>
            <h3 className={styles.linkTitle}>{link.label}</h3>
            <p className={styles.linkDesc}>{link.desc}</p>
            <span className={styles.linkArrow}>&rarr;</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
