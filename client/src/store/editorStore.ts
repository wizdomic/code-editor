import { create } from 'zustand';
import defaultCode from '../defaultCode';

export interface UserWithColor {
  username:  string;
  color:     string;
  isCreator: boolean;
}

interface EditorStore {
  // Server-synced state
  code:            string;
  language:        string;
  roomId:          string | null;
  usersWithColors: UserWithColor[];
  isLocked:        boolean;
  isReadOnly:      boolean;
  creatorUsername: string | null;
  // Local UI preferences
  fontSize: number;
  theme:    string;
  minimap:  boolean;
  // Actions
  setCode:            (code: string) => void;
  setLanguage:        (language: string) => void;  // local change — resets to default snippet
  setLanguageRemote:  (language: string) => void;  // remote change — keeps current code
  setRoomId:          (roomId: string | null) => void;
  setUsersWithColors: (users: UserWithColor[]) => void;
  setLocked:          (locked: boolean) => void;
  setReadOnly:        (readOnly: boolean) => void;
  setCreatorUsername: (name: string | null) => void;
  setFontSize:        (size: number) => void;
  setTheme:           (theme: string) => void;
  toggleMinimap:      () => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  code:            defaultCode.javascript,
  language:        'javascript',
  roomId:          null,
  usersWithColors: [],
  isLocked:        false,
  isReadOnly:      false,
  creatorUsername: null,
  fontSize:        14,
  theme:           'vs-dark',
  minimap:         false,

  setCode:            (code)     => set({ code }),
  setLanguage:        (language) => set({ language, code: defaultCode[language] ?? '// Start coding...' }),
  setLanguageRemote:  (language) => set({ language }),
  setRoomId:          (roomId)   => set({ roomId }),
  setUsersWithColors: (usersWithColors) => set({ usersWithColors }),
  setLocked:          (isLocked)       => set({ isLocked }),
  setReadOnly:        (isReadOnly)     => set({ isReadOnly }),
  setCreatorUsername: (creatorUsername) => set({ creatorUsername }),
  setFontSize:        (fontSize) => set({ fontSize: Math.min(24, Math.max(10, fontSize)) }),
  setTheme:           (theme)    => set({ theme }),
  toggleMinimap:      ()         => set(s => ({ minimap: !s.minimap })),
}));