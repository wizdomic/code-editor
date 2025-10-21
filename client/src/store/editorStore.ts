import { create } from 'zustand';
import defaultCode from '../defaultCode';

interface EditorStore {
  code: string;
  language: string;
  roomId: string | null;
  users: string[];
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setRoomId: (roomId: string) => void;
  setUsers: (users: string[]) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  code: defaultCode.javascript, // Initialize with JavaScript default code
  language: 'javascript',
  roomId: null,
  users: [],
  setCode: (code) => set({ code }),
  setLanguage: (language) =>
    set({
      language,
      code: defaultCode[language] || '// Default code not available for this language',
    }),
  setRoomId: (roomId) => set({ roomId }),
  setUsers: (users) => set({ users }),
}));
