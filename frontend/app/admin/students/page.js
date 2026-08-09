'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { useToast } from '../../../lib/ToastContext';
import styles from '../admin-relation.module.css';

export default function AdminStudentsPage() {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [form, setForm] = useState({ studentId: '', classId: '' });
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
      const [studentsRes, classesRes, enrollmentsRes] = await Promise.all([
        api.get('/admin/users', { params: { role: 'STUDENT' } }),
        api.get('/admin/classes'),
        api.get('/admin/enrollments'),
      ]);
      setStudents(studentsRes.data.users);
      setClasses(classesRes.data.classes);
      setEnrollments(enrollmentsRes.data.enrollments);
      setForm((f) => ({
        studentId: f.studentId || studentsRes.data.users[0]?.id || '',
        classId: f.classId || classesRes.data.classes[0]?.id || '',
      }));
    } catch {
      showToast('Could not load enrollment data.', 'error');
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
      await api.post('/admin/enrollments', form);
      showToast('Student enrolled.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not enroll this student.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remove this enrollment?')) return;
    try {
      await api.delete(`/admin/enrollments/${id}`);
      showToast('Enrollment removed.');
      setEnrollments((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not remove this enrollment.', 'error');
    }
  }

  if (fetching) return <p>Loading…</p>;

  if (students.length === 0) {
    return <div className={styles.empty}>No student accounts exist yet. Ask a student to register first.</div>;
  }
  if (classes.length === 0) {
    return <div className={styles.empty}>Add at least one class before enrolling students.</div>;
  }

  return (
    <div>
      <form onSubmit={handleCreate} className={styles.form}>
        <label className={styles.label}>
          Student
          <select
            value={form.studentId}
            onChange={(e) => update('studentId', e.target.value)}
            className={styles.select}
          >
            {students.map((s) => (
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
          {submitting ? 'Enrolling…' : 'Enroll'}
        </button>
      </form>
      {error && <p className={styles.error}>{error}</p>}

      {enrollments.length === 0 ? (
        <div className={styles.empty}>No enrollments yet.</div>
      ) : (
        <div className={styles.list}>
          {enrollments.map((en) => (
            <div key={en.id} className={styles.row}>
              <span className={styles.rowText}>
                <strong>{en.student.name}</strong> is enrolled in <strong>{en.class.name}</strong>
              </span>
              <button onClick={() => handleDelete(en.id)} className={styles.deleteButton}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
