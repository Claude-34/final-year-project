'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { AuthGuard } from '@/components/AuthGuard';
import { fetchReports } from '@/lib/api';
import type { PotholeReport, ReportStatus } from '@/lib/types';

const STATUSES: Array<ReportStatus | ''> = ['', 'reported', 'verified', 'assigned', 'in_progress', 'repaired'];

function SeverityBadge({ severity }: { severity: string }) {
  const cls = severity === 'high' ? 'badge-high' : severity === 'medium' ? 'badge-medium' : 'badge-low';
  return <span className={`badge ${cls}`}>{severity}</span>;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<PotholeReport[]>([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchReports(status ? { status } : undefined)
      .then(setReports)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <AuthGuard>
      <AdminShell>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Reports</h1>
            <p style={{ color: 'var(--muted)', margin: '0.25rem 0 0' }}>{reports.length} shown</p>
          </div>
          <select className="input" style={{ width: 'auto', minWidth: 180 }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {s!.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
        {loading ? <p style={{ color: 'var(--muted)' }}>Loading…</p> : null}

        {!loading && reports.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
            No reports yet. Submit one from the mobile app.
          </div>
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {reports.map((r) => (
            <Link
              key={r.id}
              href={`/reports/${r.id}`}
              className="card"
              style={{
                padding: '1rem 1.25rem',
                textDecoration: 'none',
                color: 'inherit',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '0.5rem',
                alignItems: 'center',
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>{r.id}</p>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
                  Priority {(r.priorityScore * 100).toFixed(0)}% · {r.status.replace('_', ' ')}
                  {r.reporter ? ` · ${r.reporter.name}` : ''}
                </p>
              </div>
              <SeverityBadge severity={r.severity} />
            </Link>
          ))}
        </div>
      </AdminShell>
    </AuthGuard>
  );
}
