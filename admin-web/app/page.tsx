'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { loadSession } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const session = loadSession();
    if (session?.user.role === 'admin') {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <p style={{ color: 'var(--muted)' }}>Loading…</p>
    </main>
  );
}
