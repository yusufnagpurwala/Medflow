import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(

    (set) => ({
    user: null,
    token: null,
    isHydrated: false,
    setAuth: (user, token) => {
        localStorage.setItem('token', token); // Set token in local storage
        set({ user, token });
    },
    logout: () => {
        localStorage.removeItem('token'); // Remove token from local storage
        set({ user: null, token: null });
    },
    setHydrated: () => set({ isHydrated: true })
    }),
    {
        name: 'auth-strorage',
        onRehydrateStorage: () => (state) => {
            state.setHydrated();
        }
    }
    )
);