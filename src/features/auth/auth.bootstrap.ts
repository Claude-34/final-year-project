import { loadPersistedSession } from '@/features/auth/auth.service';
import { useAuthStore } from '@/store/auth.store';

export async function hydrateAuthSession() {
  try {
    const session = await loadPersistedSession();
    if (session) {
      useAuthStore.getState().setSession(session);
    } else {
      useAuthStore.getState().setUnauthenticated();
    }
  } finally {
    useAuthStore.getState().setHydrated(true);
  }
}
