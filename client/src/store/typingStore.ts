import { create } from 'zustand';

interface TypingStore {
  typingUsers:    string[];
  setTypingUsers: (users: string[]) => void;
}

export const useTypingStore = create<TypingStore>((set) => ({
  typingUsers:    [],
  setTypingUsers: (typingUsers) => set({ typingUsers }),
}));