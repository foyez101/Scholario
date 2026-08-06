'use client';

import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import StampBadge from './StampBadge';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.left}>
          <Link href="/" className={styles.brand}>
            <span className={styles.mark}>S</span>
            <span className={styles.wordmark}>Scholario</span>
          </Link>
          {user && (
            <nav className={styles.links}>
              <Link href="/dashboard" className={styles.link}>
                Dashboard
              </Link>
              <Link href="/assignments" className={styles.link}>
                Assignments
              </Link>
            </nav>
          )}
        </div>
        {user && (
          <div className={styles.right}>
            <StampBadge value={user.role} />
            <span className={styles.avatar}>{user.name.charAt(0)}</span>
            <button onClick={logout} className={styles.logout}>
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
