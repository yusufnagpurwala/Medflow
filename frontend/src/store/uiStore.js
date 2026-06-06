import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// UI preferences that should survive refreshes (currently the color mode).
// Persisted to localStorage; we expose an `isHydrated` flag so the app can
// avoid a theme flash by waiting for rehydration before first paint —
// mirroring the auth store's hydration gate.
export const useUiStore = create(
  persist(
    (set, get) => ({
      mode: 'light',
      isHydrated: false,
      setMode: (mode) => set({ mode }),
      toggleMode: () =>
        set({ mode: get().mode === 'dark' ? 'light' : 'dark' }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        state.setHydrated();
      },
    }
  )
);
