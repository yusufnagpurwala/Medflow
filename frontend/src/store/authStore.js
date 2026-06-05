import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

// The JWT lives in an httpOnly cookie (not accessible to JS).
// We persist only the non-sensitive `user` object so the UI can render
// role/name across refreshes. Source of truth for access is the backend.
export const useAuthStore = create(
    persist(

    (set) => ({
    user: null,
    isHydrated: false,
    setAuth: (user) => {
        set({ user });
    },
    logout: async () => {
        try {
            await api.post('/auth/logout'); // clears the httpOnly cookie server-side
        } catch (err) {
            // ignore network errors on logout — clear client state regardless
        }
        set({ user: null });
    },
    setHydrated: () => set({ isHydrated: true })
    }),
    {
        name: 'auth-storage',
        partialize: (state) => ({ user: state.user }),
        onRehydrateStorage: () => (state) => {
            state.setHydrated();
        }
    }
    )
);
