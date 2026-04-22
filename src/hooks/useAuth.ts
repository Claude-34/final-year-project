import { useAuthStore } from '@/store/auth.store';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clearSession = useAuthStore((s) => s.clearSession);
  const setSession = useAuthStore((s) => s.setSession);

  return { user, isAuthenticated, clearSession, setSession };
}
