'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/AuthContext';
import api from '../../../lib/api';
import StampBadge from '../../../components/StampBadge';
import styles from './assignment-detail.module.css';

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [content, setContent] = useState('');
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load this assignment.');
    } finally {
      setFetching(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      if (submission) {
        const res = await api.patch(`/submissions/${submission.id}`, { content });
        setSubmission(res.data.submission);
        setSuccessMsg('Your submission was updated.');
      } else {
        const res = await api.post('/submissions', { assignmentId: id, content });
        setSubmission(res.data.submission);
        setSuccessMsg('Your answer was submitted.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user || fetching) return <p>Loading…</p>;
  if (error && !assignment) return <p className={styles.error}>{error}</p>;
  if (!assignment) return null;

  const deadlinePassed = new Date() > new Date(assignment.deadline);
  const canEdit = user.role === 'STUDENT' && !deadlinePassed;

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
      </div>

      {user.role === 'STUDENT' && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Your submission</h2>

          {submission?.status === 'GRADED' && (
            <div className={styles.gradeBox}>
              <div className={styles.gradeRow}>
                <StampBadge value={submission.status} />
                <span className={styles.marks}>
                  {submission.marks} / {assignment.maxMarks}
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
              {successMsg && <p className={styles.success}>{successMsg}</p>}
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
    </div>
  );
}
