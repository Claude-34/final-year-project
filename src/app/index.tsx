import { Redirect } from 'expo-router';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuthStore } from '@/store/auth.store';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return <LoadingSpinner label="Loading session..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/dashboard" />;
}
