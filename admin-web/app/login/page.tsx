'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ApiError, login } from '@/lib/api';
import { loadSession, saveSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@authority.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existing = loadSession();
    if (existing?.user.role === 'admin') router.replace('/dashboard');
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const session = await login(email, password);
      if (session.user.role !== 'admin') {
        setError('This account is not an administrator.');
        return;
      }
      saveSession(session);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '1.5rem',
      }}
    >
      <form
        onSubmit={onSubmit}
        className="card"
        style={{ width: '100%', maxWidth: 400, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Authority Console</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Sign in with your seeded admin account.
          </p>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Email</span>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Password</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="ADMIN_SEED_PASSWORD"
          />
        </label>

        {error ? (
          <p style={{ color: 'var(--danger)', fontSize: '0.9rem', margin: 0 }}>{error}</p>
        ) : null}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
