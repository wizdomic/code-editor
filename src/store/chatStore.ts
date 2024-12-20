import { create } from 'zustand';
import { Message } from '../types/chat';

interface ChatStore {
  messages: Message[];
  addMessage: (message: Message) => void;
  addSystemMessage: (text: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  addSystemMessage: (text) => set((state) => ({
    messages: [...state.messages, {
      id: Date.now().toString(),
      username: 'System',
      text,
      timestamp: Date.now(),
      type: 'system'
    }]
  })),
  clearMessages: () => set({ messages: [] }),
}));