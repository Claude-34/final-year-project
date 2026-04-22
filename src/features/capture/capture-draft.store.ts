import { create } from 'zustand';

/**
 * Holds the latest capture between Capture and Detection screens.
 * Router search params are unreliable for long `file://` URIs, so we pass data here instead.
 */
export type CaptureDraft = {
  imageUri: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
};

type State = {
  draft: CaptureDraft | null;
  setDraft: (draft: CaptureDraft) => void;
  clearDraft: () => void;
};

export const useCaptureDraftStore = create<State>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}));
