import { create } from "zustand";

interface UserStore {
  username: string | null;
  isAuthenticated: boolean;
  error: string | null;
  setUsername: (username: string) => void;
  logout: () => void;
  setError: (msg: string | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  username: null,
  isAuthenticated: false,
  error: null,
  setUsername: (username) =>
    set({ username, isAuthenticated: true, error: null }),
  logout: () => set({ username: null, isAuthenticated: false }),
  setError: (msg) => set({ error: msg }),
}));
