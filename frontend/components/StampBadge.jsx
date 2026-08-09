import styles from './StampBadge.module.css';

const LABELS = {
  ADMIN: 'Admin',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  SUBMITTED: 'Submitted',
  GRADED: 'Graded',
  RESUBMITTED: 'Needs review',
  NOT_SUBMITTED: 'Not submitted',
};

const TONE = {
  PUBLISHED: 'good',
  GRADED: 'good',
  RESUBMITTED: 'warn',
  NOT_SUBMITTED: 'warn',
};

export default function StampBadge({ value }) {
  const tone = TONE[value] || 'neutral';
  return <span className={`${styles.badge} ${styles[tone]}`}>{LABELS[value] || value}</span>;
}
