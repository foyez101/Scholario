import styles from './PasswordStrength.module.css';

const RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function isPasswordStrong(password) {
  return RULES.every((r) => r.test(password || ''));
}

export default function PasswordStrength({ password }) {
  if (!password) return null;

  return (
    <ul className={styles.list}>
      {RULES.map((r) => {
        const met = r.test(password);
        return (
          <li key={r.label} className={met ? styles.met : styles.unmet}>
            {met ? '\u2713' : '\u2022'} {r.label}
          </li>
        );
      })}
    </ul>
  );
}
