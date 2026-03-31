import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_ADMIN_USERS } from '../data/mockData';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username, password) => {
        set({ isLoading: true, error: null });
        await new Promise((r) => setTimeout(r, 1000)); // simulate network
        const found = MOCK_ADMIN_USERS.find(
          (u) => u.username === username && u.password === password && u.is_active
        );
        if (found) {
          const { password: _, ...safeUser } = found;
          set({ user: safeUser, isAuthenticated: true, isLoading: false });
          return { success: true };
        }
        set({ isLoading: false, error: 'Invalid username or password.' });
        return { success: false, error: 'Invalid username or password.' };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'admin-auth-storage', partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
);