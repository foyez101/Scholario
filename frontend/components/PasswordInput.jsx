'use client';

import { useState } from 'react';
import styles from './PasswordInput.module.css';

export default function PasswordInput({ value, onChange, className, required, autoComplete, placeholder }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.wrap}>
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`${className || ''} ${styles.input}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className={styles.toggle}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M10.6 5.1A11 11 0 0 1 12 5c7 0 11 7 11 7a13.6 13.6 0 0 1-3.2 3.9M6.5 6.6C3.7 8.4 2 12 2 12s4 7 11 7a10.6 10.6 0 0 0 5-1.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 9.9a3 3 0 0 0 4.2 4.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
