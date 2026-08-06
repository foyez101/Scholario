'use client';

import { useState } from 'react';
import api from '../lib/api';
import StampBadge from './StampBadge';
import LockIcon from './LockIcon';
import styles from './SubmissionRow.module.css';

export default function SubmissionRow({ submission, maxMarks, onGraded }) {
  const [marks, setMarks] = useState(submission.marks ?? '');
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  // Already-graded submissions start locked; ungraded ones start open for grading.
  const [editing, setEditing] = useState(submission.status !== 'GRADED');

  async function handleGrade(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await api.patch(`/submissions/${submission.id}/grade`, {
        marks: Number(marks),
        feedback,
      });
      onGraded(res.data.submission);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this grade.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setMarks(submission.marks ?? '');
    setFeedback(submission.feedback ?? '');
    setError('');
    setEditing(false);
  }

  return (
    <div className={styles.row}>
      <button type="button" onClick={() => setExpanded((v) => !v)} className={styles.summary}>
        <span className={styles.name}>{submission.student.name}</span>
        <StampBadge value={submission.status} />
        {submission.status === 'GRADED' && (
          <span className={styles.marks}>
            {submission.marks} / {maxMarks}
          </span>
        )}
        <span className={styles.chevron}>{expanded ? '\u2212' : '+'}</span>
      </button>

      {expanded && (
        <div className={styles.details}>
          <p className={styles.content}>{submission.content}</p>

          {editing ? (
            <form onSubmit={handleGrade} className={styles.form}>
              <label className={styles.label}>
                Marks (out of {maxMarks})
                <input
                  type="number"
                  min={0}
                  max={maxMarks}
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  required
                  className={styles.input}
                />
              </label>
              <label className={styles.label}>
                Feedback
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className={styles.textarea}
                />
              </label>
              {error && <p className={styles.error}>{error}</p>}
              <div className={styles.formActions}>
                <button type="submit" disabled={saving} className={styles.button}>
                  {saving ? 'Saving…' : 'Update grade'}
                </button>
                {submission.status === 'GRADED' && (
                  <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className={styles.lockedGrade}>
              <div className={styles.lockedRow}>
                <LockIcon className={styles.lockIcon} />
                <span className={styles.marksLocked}>
                  {submission.marks} / {maxMarks}
                </span>
              </div>
              {submission.feedback && <p className={styles.feedbackLocked}>{submission.feedback}</p>}
              <button type="button" onClick={() => setEditing(true)} className={styles.editButton}>
                Edit grade
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
