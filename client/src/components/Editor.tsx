import { useEffect, useRef, useCallback } from 'react';
import MonacoEditor, { OnMount } from '@monaco-editor/react';
import { useEditorStore } from '../store/editorStore';
import { socket } from '../socket';
import { emit } from '../services/socketService';
import type { RemoteCursor } from '../services/socketService';

const LANG_PATTERNS: Array<{ pattern: RegExp; lang: string }> = [
  { pattern: /^\s*(#include|using namespace std|int main\s*\()/m,   lang: 'cpp'        },
  { pattern: /^\s*(public class|System\.out\.print|import java\.)/m, lang: 'java'       },
  { pattern: /^\s*(def |import |print\(|from \w+ import)/m,         lang: 'python'     },
  { pattern: /^\s*(fn main|let mut |use std::)/m,                    lang: 'rust'       },
  { pattern: /^\s*(package main|func main|fmt\.Print)/m,             lang: 'go'         },
  { pattern: /^\s*(<\?php|echo )/m,                                  lang: 'php'        },
  { pattern: /^\s*(using System|Console\.Write|namespace )/m,        lang: 'csharp'     },
  { pattern: /^\s*(puts |def \w+\n|require ['"])/m,                  lang: 'ruby'       },
  { pattern: /^\s*(interface |type \w+ =|: string|: number)/m,       lang: 'typescript' },
  { pattern: /^\s*(const |let |var |=>|function |require\()/m,       lang: 'javascript' },
];

const FORMATTABLE = new Set(['javascript', 'typescript', 'json', 'html', 'css']);

function detectLanguage(code: string): string | null {
  for (const { pattern, lang } of LANG_PATTERNS)
    if (pattern.test(code)) return lang;
  return null;
}

export const editorActions = {
  formatCode: (): { supported: boolean; language: string } => ({ supported: false, language: '' }),
};

export function CodeEditor() {
  const {
    code, language, roomId, fontSize, theme, minimap, isReadOnly,
    setCode, setLanguageRemote,
  } = useEditorStore();

  const editorRef     = useRef<any>(null);
  const monacoRef     = useRef<any>(null);
  const isLocalChange = useRef(false);
  const lastEmit      = useRef(0);

  // username → IEditorDecorationsCollection
  const collections   = useRef<Map<string, any>>(new Map());
  // username → auto-hide timer
  const hideTimers    = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // ── Cursor management ───────────────────────────────────────────────────────

  const clearCursor = useCallback((username: string) => {
    hideTimers.current.get(username) && clearTimeout(hideTimers.current.get(username)!);
    hideTimers.current.delete(username);
    collections.current.get(username)?.clear();
    collections.current.delete(username);
  }, []);

  const clearAll = useCallback(() => {
    hideTimers.current.forEach(t => clearTimeout(t));
    hideTimers.current.clear();
    collections.current.forEach(c => c.clear());
    collections.current.clear();
  }, []);

  const showCursor = useCallback((cursor: RemoteCursor) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const { username, line, column, color } = cursor;

    // Inject style once per user
    const styleId = `cursor-style-${username}`;
    if (!document.getElementById(styleId)) {
      const el = document.createElement('style');
      el.id = styleId;
      el.textContent = `
        .cur-${username} { border-left: 2px solid ${color}; margin-left:-1px; }
        .cur-lbl-${username}::after {
          content: "${username}";
          background: ${color}; color: #000;
          font-size: 10px; font-weight: 700;
          padding: 0 4px; border-radius: 2px;
          position: absolute; top: -16px; left: -1px;
          white-space: nowrap; pointer-events: none; z-index: 100;
        }`;
      document.head.appendChild(el);
    }

    // Create collection on first appearance
    if (!collections.current.has(username)) {
      collections.current.set(username, editor.createDecorationsCollection([]));
    }

    collections.current.get(username).set([{
      range: new monaco.Range(line, column, line, column),
      options: {
        className:              `cur-${username}`,
        beforeContentClassName: `cur-lbl-${username}`,
        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
      },
    }]);

    // Auto-hide after 3 seconds of inactivity
    if (hideTimers.current.has(username)) clearTimeout(hideTimers.current.get(username)!);
    hideTimers.current.set(username, setTimeout(() => clearCursor(username), 3000));
  }, [clearCursor]);

  // ── Socket listeners ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!roomId) return;

    const onCode   = (c: string)                           => { if (!isLocalChange.current) setCode(c); };
    const onCursor = (c: RemoteCursor)                     => showCursor(c);
    const onRemove = ({ username }: { username: string })  => clearCursor(username);

    socket.on('code-update',   onCode);
    socket.on('cursor-update', onCursor);
    socket.on('cursor-remove', onRemove);

    return () => {
      socket.off('code-update',   onCode);
      socket.off('cursor-update', onCursor);
      socket.off('cursor-remove', onRemove);
      clearAll();
    };
  }, [roomId, setCode, showCursor, clearCursor, clearAll]);

  // ── Editor mount ────────────────────────────────────────────────────────────

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editorActions.formatCode = () => {
      const lang = useEditorStore.getState().language;
      if (!FORMATTABLE.has(lang)) return { supported: false, language: lang };
      editor.getAction('editor.action.formatDocument')?.run();
      return { supported: true, language: lang };
    };

    // Emit cursor on change (throttled ~12fps) — only fires when actively editing
    editor.onDidChangeCursorPosition(e => {
      const rid = useEditorStore.getState().roomId;
      if (!rid) return;
      const now = Date.now();
      if (now - lastEmit.current < 80) return;
      lastEmit.current = now;
      emit.cursorMove(rid, e.position.lineNumber, e.position.column);
    });

    editor.onDidPaste(() => {
      const { language: current, roomId: rid } = useEditorStore.getState();
      const detected = detectLanguage(editor.getValue());
      if (!detected || detected === current) return;
      setLanguageRemote(detected);
      if (rid) emit.languageChange(rid, detected);
    });
  };

  const handleChange = (value: string | undefined) => {
    if (value === undefined || isReadOnly) return;
    isLocalChange.current = true;
    setCode(value);
    if (roomId) emit.codeChange(roomId, value);
    setTimeout(() => { isLocalChange.current = false; }, 50);
  };

  return (
    <MonacoEditor
      height="100%"
      language={language}
      theme={theme}
      value={code}
      onChange={handleChange}
      onMount={handleMount}
      options={{
        fontSize,
        readOnly:                isReadOnly,
        minimap:                 { enabled: minimap },
        wordWrap:                'on',
        automaticLayout:         true,
        cursorBlinking:          'smooth',
        smoothScrolling:         true,
        bracketPairColorization: { enabled: true },
        autoClosingBrackets:     'always',
        autoClosingQuotes:       'always',
        formatOnPaste:           true,
        tabSize:                 2,
        scrollBeyondLastLine:    false,
        renderLineHighlight:     'line',
        padding:                 { top: 8, bottom: 8 },
      }}
    />
  );
}