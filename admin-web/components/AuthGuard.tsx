'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { loadSession } from '@/lib/auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (!session || session.user.role !== 'admin') {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--muted)' }}>Checking session…</p>
      </main>
    );
  }

  return <>{children}</>;
}
