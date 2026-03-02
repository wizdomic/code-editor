import { create } from 'zustand';
import type { Message } from '../types/chat';

interface ChatStore {
  messages:         Message[];
  addMessage:       (message: Message) => void;
  addSystemMessage: (text: string) => void;
  clearMessages:    () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],

  addMessage: (message) =>
    set(s => ({ messages: [...s.messages, message] })),

  addSystemMessage: (text) =>
    set(s => ({
      messages: [...s.messages, {
        id:        `sys-${Date.now()}`,
        username:  'system',
        text,
        timestamp: Date.now(),
        type:      'system',
      }],
    })),

  clearMessages: () => set({ messages: [] }),
}));