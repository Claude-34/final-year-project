'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { AuthGuard } from '@/components/AuthGuard';
import { fetchStats } from '@/lib/api';
import type { AdminStats } from '@/lib/types';

function Kpi({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="card" style={{ padding: '1.25rem', flex: 1, minWidth: 140 }}>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0 }}>{label}</p>
      <p style={{ fontSize: '2rem', fontWeight: 700, margin: '0.35rem 0 0', color: accent ?? 'var(--text)' }}>
        {value}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load stats'));
  }, []);

  return (
    <AuthGuard>
      <AdminShell>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
          Triage overview for road maintenance teams.
        </p>

        {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}

        {stats ? (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <Kpi label="Total reports" value={stats.total} />
              <Kpi label="Open defects" value={stats.open} accent="var(--warning)" />
              <Kpi label="High priority" value={stats.highPriority} accent="#f87171" />
              <Kpi label="Active work" value={stats.assigned} accent="var(--accent)" />
              <Kpi label="Repaired" value={stats.repaired} accent="var(--success)" />
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>By status</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <div key={status} style={{ padding: '0.75rem', background: 'var(--bg)', borderRadius: 8 }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'capitalize' }}>
                      {status.replace('_', ' ')}
                    </p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '1.25rem', fontWeight: 600 }}>{count}</p>
                  </div>
                ))}
              </div>
            </div>

            <p style={{ marginTop: '1.5rem' }}>
              <Link href="/reports" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                View all reports →
              </Link>
            </p>
          </>
        ) : !error ? (
          <p style={{ color: 'var(--muted)' }}>Loading stats…</p>
        ) : null}
      </AdminShell>
    </AuthGuard>
  );
}
