import { create } from 'zustand';

import { clearPersistedSession } from '@/features/auth/auth.service';
import type { AuthSession } from '@/features/auth/auth.types';

type AuthState = {
  user: AuthSession['user'] | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => Promise<void>;
  setUnauthenticated: () => void;
  setHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hasHydrated: false,
  setSession: (session) =>
    set({
      user: session.user,
      token: session.token,
      isAuthenticated: true,
    }),
  clearSession: async () => {
    await clearPersistedSession();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
  setUnauthenticated: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    }),
  setHydrated: (value) => set({ hasHydrated: value }),
}));
