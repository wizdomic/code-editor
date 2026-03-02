export interface Language {
  id:        string;
  name:      string;
  extension: string;
}

// defaultCode is the single source of truth — we derive the list from it
// so adding a language means editing only defaultCode.ts
export const SUPPORTED_LANGUAGES: Language[] = [
  { id: 'javascript', name: 'JavaScript', extension: 'js'   },
  { id: 'typescript', name: 'TypeScript', extension: 'ts'   },
  { id: 'python',     name: 'Python',     extension: 'py'   },
  { id: 'java',       name: 'Java',       extension: 'java' },
  { id: 'cpp',        name: 'C++',        extension: 'cpp'  },
  { id: 'csharp',     name: 'C#',         extension: 'cs'   },
  { id: 'php',        name: 'PHP',        extension: 'php'  },
  { id: 'ruby',       name: 'Ruby',       extension: 'rb'   },
  { id: 'go',         name: 'Go',         extension: 'go'   },
  { id: 'rust',       name: 'Rust',       extension: 'rs'   },
];