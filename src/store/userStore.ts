import { create } from 'zustand';

interface UserStore {
  username: string | null;
  isAuthenticated: boolean;
  setUsername: (username: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  username: null,
  isAuthenticated: false,
  setUsername: (username) => set({ username, isAuthenticated: true }),
  logout: () => set({ username: null, isAuthenticated: false }),
}));