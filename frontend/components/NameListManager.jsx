'use client';

import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useToast } from '../lib/ToastContext';
import styles from './NameListManager.module.css';

export default function NameListManager({ endpoint, responseKey, itemLabel }) {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
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
      const res = await api.get(endpoint);
      setItems(res.data[responseKey]);
    } catch {
      showToast(`Could not load ${itemLabel.toLowerCase()}s.`, 'error');
    } finally {
      setFetching(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post(endpoint, { name });
      setName('');
      showToast(`${itemLabel} added.`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || `Could not add this ${itemLabel.toLowerCase()}.`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm(`Delete this ${itemLabel.toLowerCase()}?`)) return;
    try {
      await api.delete(`${endpoint}/${id}`);
      showToast(`${itemLabel} deleted.`);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      showToast(err.response?.data?.message || `Could not delete this ${itemLabel.toLowerCase()}.`, 'error');
    }
  }

  return (
    <div>
      <form onSubmit={handleCreate} className={styles.form}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`New ${itemLabel.toLowerCase()} name`}
          required
          className={styles.input}
        />
        <button type="submit" disabled={submitting} className={styles.addButton}>
          {submitting ? 'Adding…' : `Add ${itemLabel.toLowerCase()}`}
        </button>
      </form>
      {error && <p className={styles.error}>{error}</p>}

      {fetching ? (
        <p className={styles.note}>Loading…</p>
      ) : items.length === 0 ? (
        <div className={styles.empty}>No {itemLabel.toLowerCase()}s yet.</div>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <div key={item.id} className={styles.row}>
              <span className={styles.name}>{item.name}</span>
              <button onClick={() => handleDelete(item.id)} className={styles.deleteButton}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
