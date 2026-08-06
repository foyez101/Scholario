'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/AuthContext';
import api from '../../../lib/api';
import styles from './new.module.css';

export default function NewAssignmentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [options, setOptions] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    teachingOptionId: '',
    deadline: '',
    maxMarks: 100,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'TEACHER')) {
      router.replace('/assignments');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== 'TEACHER') return;
    api
      .get('/assignments/teaching-options')
      .then((res) => {
        setOptions(res.data.options);
        if (res.data.options.length > 0) {
          setForm((f) => ({ ...f, teachingOptionId: res.data.options[0].id }));
        }
      })
      .catch(() => setError('Could not load your teaching assignments.'))
      .finally(() => setFetching(false));
  }, [user]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const selected = options.find((o) => o.id === form.teachingOptionId);
      const res = await api.post('/assignments', {
        title: form.title,
        description: form.description,
        subjectId: selected.subject.id,
        classId: selected.class.id,
        deadline: form.deadline,
        maxMarks: Number(form.maxMarks),
      });
      router.push(`/assignments/${res.data.assignment.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user || fetching) return <p>Loading…</p>;

  if (options.length === 0) {
    return (
      <div className={styles.card}>
        <p className={styles.note}>
          You&apos;re not assigned to teach any subject/class yet. Ask an admin to assign
          you before creating assignments.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <p className={styles.eyebrow}>New assignment</p>
      <h1 className={styles.title}>Create an assignment</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          Title
          <input
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            required
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          Description
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            required
            rows={4}
            className={styles.textarea}
          />
        </label>

        <label className={styles.label}>
          Class &amp; subject
          <select
            value={form.teachingOptionId}
            onChange={(e) => update('teachingOptionId', e.target.value)}
            className={styles.input}
          >
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.subject.name} — {o.class.name}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.row}>
          <label className={styles.label}>
            Deadline
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => update('deadline', e.target.value)}
              required
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Max marks
            <input
              type="number"
              min={1}
              value={form.maxMarks}
              onChange={(e) => update('maxMarks', e.target.value)}
              required
              className={styles.input}
            />
          </label>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" disabled={submitting} className={styles.button}>
          {submitting ? 'Creating…' : 'Create assignment (as draft)'}
        </button>
      </form>
    </div>
  );
}
