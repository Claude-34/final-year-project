'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { AuthGuard } from '@/components/AuthGuard';
import { fetchReport, patchReport } from '@/lib/api';
import type { PotholeReport, ReportStatus } from '@/lib/types';

const STATUSES: ReportStatus[] = ['reported', 'verified', 'assigned', 'in_progress', 'repaired'];
const CREWS = ['Crew A', 'Crew B', 'Crew C'];

export default function ReportDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const [report, setReport] = useState<PotholeReport | null>(null);
  const [status, setStatus] = useState<ReportStatus>('reported');
  const [crew, setCrew] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchReport(id)
      .then((r) => {
        setReport(r);
        setStatus(r.status);
        setCrew(r.assignedCrew ?? '');
        setNotes(r.notes ?? '');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [id]);

  async function save() {
    if (!id) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await patchReport(id, {
        status,
        assignedCrew: crew || undefined,
        notes: notes || undefined,
      });
      setReport((prev) => (prev ? { ...prev, ...updated, status, assignedCrew: crew, notes } : prev));
      setMessage('Saved successfully.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGuard>
      <AdminShell>
        <Link href="/reports" style={{ color: 'var(--muted)', fontSize: '0.9rem', textDecoration: 'none' }}>
          ← Back to reports
        </Link>

        {error ? <p style={{ color: 'var(--danger)', marginTop: '1rem' }}>{error}</p> : null}
        {!report && !error ? <p style={{ color: 'var(--muted)', marginTop: '1rem' }}>Loading…</p> : null}

        {report ? (
          <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1.5rem', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{report.id}</h1>
              <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
                {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)} ·{' '}
                {new Date(report.detectedAt).toLocaleString()}
              </p>

              {report.imageUrl && report.imageUrl.startsWith('http') ? (
                <div className="card" style={{ overflow: 'hidden', position: 'relative', aspectRatio: '16/10' }}>
                  <Image src={report.imageUrl} alt="Pothole" fill style={{ objectFit: 'cover' }} unoptimized />
                </div>
              ) : (
                <div className="card" style={{ padding: '2rem', color: 'var(--muted)', textAlign: 'center' }}>
                  No cloud image URL (local URI or upload pending)
                </div>
              )}

              <div className="card" style={{ padding: '1rem', marginTop: '1rem' }}>
                <p>
                  <strong>Severity:</strong> {report.severity}
                </p>
                <p>
                  <strong>Priority:</strong> {(report.priorityScore * 100).toFixed(1)}%
                </p>
                <p>
                  <strong>Confidence:</strong> {(report.confidence * 100).toFixed(1)}%
                </p>
                {report.reporter ? (
                  <p>
                    <strong>Reporter:</strong> {report.reporter.name} ({report.reporter.email})
                  </p>
                ) : null}
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
              <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Triage</h2>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Status</span>
                <select className="input" value={status} onChange={(e) => setStatus(e.target.value as ReportStatus)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Assigned crew</span>
                <select className="input" value={crew} onChange={(e) => setCrew(e.target.value)}>
                  <option value="">Unassigned</option>
                  {CREWS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Notes</span>
                <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </label>

              <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>

              {message ? <p style={{ color: 'var(--success)', margin: 0, fontSize: '0.9rem' }}>{message}</p> : null}
            </div>
          </div>
        ) : null}
      </AdminShell>
    </AuthGuard>
  );
}
