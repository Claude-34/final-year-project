'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { clearSession, loadSession } from '@/lib/auth';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = loadSession();

  function logout() {
    clearSession();
    router.replace('/login');
  }

  const nav = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/reports', label: 'Reports' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <strong style={{ fontSize: '1.05rem' }}>Pothole Authority</strong>
          <nav style={{ display: 'flex', gap: '0.5rem' }}>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: 6,
                  textDecoration: 'none',
                  color: pathname.startsWith(item.href) ? 'var(--text)' : 'var(--muted)',
                  background: pathname.startsWith(item.href) ? 'var(--bg)' : 'transparent',
                  fontWeight: pathname.startsWith(item.href) ? 600 : 400,
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{session?.user.email}</span>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>
      <main style={{ flex: 1, padding: '1.5rem', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
