'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/AuthContext';
import { useToast } from '../../../lib/ToastContext';
import api from '../../../lib/api';
import StampBadge from '../../../components/StampBadge';
import LockIcon from '../../../components/LockIcon';
import SubmissionRow from '../../../components/SubmissionRow';
import styles from './assignment-detail.module.css';

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null); // the student's own submission
  const [submissions, setSubmissions] = useState([]); // teacher's view of everyone's
  const [content, setContent] = useState('');
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  async function load() {
    setFetching(true);
    setError('');
    try {
      const aRes = await api.get(`/assignments/${id}`);
      setAssignment(aRes.data.assignment);

      if (user.role === 'STUDENT') {
        const sRes = await api.get('/submissions', { params: { assignmentId: id } });
        const existing = sRes.data.submissions[0] || null;
        setSubmission(existing);
        setContent(existing ? existing.content : '');
      }

      if (user.role === 'TEACHER' && aRes.data.assignment.teacherId === user.id) {
        const subsRes = await api.get('/submissions', { params: { assignmentId: id } });
        setSubmissions(subsRes.data.submissions);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load this assignment.');
    } finally {
      setFetching(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (submission) {
        const res = await api.patch(`/submissions/${submission.id}`, { content });
        setSubmission(res.data.submission);
        showToast('Your submission was updated.');
      } else {
        const res = await api.post('/submissions', { assignmentId: id, content });
        setSubmission(res.data.submission);
        showToast('Your answer was submitted.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTogglePublish() {
    try {
      const res = await api.patch(`/assignments/${id}/publish`);
      setAssignment(res.data.assignment);
      showToast(res.data.assignment.status === 'PUBLISHED' ? 'Assignment published.' : 'Moved back to draft.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not change publish status.', 'error');
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this assignment? This cannot be undone.')) return;
    try {
      await api.delete(`/assignments/${id}`);
      showToast('Assignment deleted.');
      router.push('/assignments');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete this assignment.', 'error');
    }
  }

  function handleGraded(updatedSubmission) {
    setSubmissions((prev) => prev.map((s) => (s.id === updatedSubmission.id ? updatedSubmission : s)));
    showToast('Grade saved.');
  }

  if (loading || !user || fetching) return <p>Loading…</p>;
  if (error && !assignment) return <p className={styles.error}>{error}</p>;
  if (!assignment) return null;

  const deadlinePassed = new Date() > new Date(assignment.deadline);
  const canEdit = user.role === 'STUDENT' && !deadlinePassed;
  const isOwner = user.role === 'TEACHER' && assignment.teacherId === user.id;

  return (
    <div>
      <div className={styles.card}>
        <div className={styles.top}>
          <div>
            <p className={styles.eyebrow}>
              {assignment.subject.name} &middot; {assignment.class.name}
            </p>
            <h1 className={styles.title}>{assignment.title}</h1>
          </div>
          <StampBadge value={assignment.status} />
        </div>

        <p className={styles.description}>{assignment.description}</p>

        <div className={styles.metaRow}>
          <span>
            Due{' '}
            {new Date(assignment.deadline).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span>Max marks: {assignment.maxMarks}</span>
        </div>

        {isOwner && (
          <div className={styles.ownerActions}>
            <button onClick={handleTogglePublish} className={styles.secondaryButton}>
              {assignment.status === 'DRAFT' ? 'Publish' : 'Unpublish'}
            </button>
            <button onClick={handleDelete} className={styles.dangerButton}>
              Delete
            </button>
          </div>
        )}
      </div>

      {user.role === 'STUDENT' && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Your submission</h2>

          {submission?.status === 'GRADED' && (
            <div className={styles.gradeBox}>
              <div className={styles.gradeRow}>
                <StampBadge value={submission.status} />
                <span className={styles.marks}>
                  <LockIcon className={styles.lockIcon} /> {submission.marks} / {assignment.maxMarks}
                </span>
              </div>
              {submission.feedback && <p className={styles.feedback}>{submission.feedback}</p>}
            </div>
          )}

          {submission?.status === 'RESUBMITTED' && (
            <p className={styles.note}>
              You edited this after it was graded — your teacher needs to review it again.
            </p>
          )}

          {canEdit ? (
            <form onSubmit={handleSubmit} className={styles.form}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={6}
                placeholder="Type your answer here..."
                className={styles.textarea}
              />
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" disabled={submitting} className={styles.button}>
                {submitting ? 'Saving…' : submission ? 'Update submission' : 'Submit answer'}
              </button>
            </form>
          ) : (
            <div>
              {deadlinePassed && (
                <p className={styles.note}>
                  The deadline has passed
                  {submission ? ' — your submission is locked.' : ', and you did not submit this assignment.'}
                </p>
              )}
              {submission && <p className={styles.readonlyContent}>{submission.content}</p>}
            </div>
          )}
        </div>
      )}

      {isOwner && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Submissions ({submissions.length})</h2>
          {submissions.length === 0 && <p className={styles.note}>No submissions yet.</p>}
          {submissions.map((s) => (
            <SubmissionRow key={s.id} submission={s} maxMarks={assignment.maxMarks} onGraded={handleGraded} />
          ))}
        </div>
      )}
    </div>
  );
}
