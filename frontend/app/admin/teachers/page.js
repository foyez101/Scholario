'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { useToast } from '../../../lib/ToastContext';
import styles from '../admin-relation.module.css';

export default function AdminTeachersPage() {
  const { showToast } = useToast();
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ teacherId: '', subjectId: '', classId: '' });
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setFetching(true);
    try {
      const [teachersRes, subjectsRes, classesRes, assignmentsRes] = await Promise.all([
        api.get('/admin/users', { params: { role: 'TEACHER' } }),
        api.get('/admin/subjects'),
        api.get('/admin/classes'),
        api.get('/admin/teacher-assignments'),
      ]);
      setTeachers(teachersRes.data.users);
      setSubjects(subjectsRes.data.subjects);
      setClasses(classesRes.data.classes);
      setAssignments(assignmentsRes.data.teacherAssignments);
      setForm((f) => ({
        teacherId: f.teacherId || teachersRes.data.users[0]?.id || '',
        subjectId: f.subjectId || subjectsRes.data.subjects[0]?.id || '',
        classId: f.classId || classesRes.data.classes[0]?.id || '',
      }));
    } catch {
      showToast('Could not load teacher assignment data.', 'error');
    } finally {
      setFetching(false);
    }
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/admin/teacher-assignments', form);
      showToast('Teacher assigned.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create this assignment.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this teaching assignment?')) return;
    try {
      await api.delete(`/admin/teacher-assignments/${id}`);
      showToast('Assignment removed.');
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not remove this assignment.', 'error');
    }
  }

  if (fetching) return <p>Loading…</p>;

  if (teachers.length === 0) {
    return <div className={styles.empty}>No teacher accounts exist yet. Ask a teacher to register first.</div>;
  }
  if (subjects.length === 0 || classes.length === 0) {
    return <div className={styles.empty}>Add at least one class and one subject before assigning teachers.</div>;
  }

  return (
    <div>
      <form onSubmit={handleCreate} className={styles.form}>
        <label className={styles.label}>
          Teacher
          <select
            value={form.teacherId}
            onChange={(e) => update('teacherId', e.target.value)}
            className={styles.select}
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.label}>
          Subject
          <select
            value={form.subjectId}
            onChange={(e) => update('subjectId', e.target.value)}
            className={styles.select}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.label}>
          Class
          <select value={form.classId} onChange={(e) => update('classId', e.target.value)} className={styles.select}>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={submitting} className={styles.addButton}>
          {submitting ? 'Assigning…' : 'Assign'}
        </button>
      </form>
      {error && <p className={styles.error}>{error}</p>}

      {assignments.length === 0 ? (
        <div className={styles.empty}>No teacher assignments yet.</div>
      ) : (
        <div className={styles.list}>
          {assignments.map((a) => (
            <div key={a.id} className={styles.row}>
              <span className={styles.rowText}>
                <strong>{a.teacher.name}</strong> teaches <strong>{a.subject.name}</strong> in{' '}
                <strong>{a.class.name}</strong>
              </span>
              <button onClick={() => handleDelete(a.id)} className={styles.deleteButton}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
