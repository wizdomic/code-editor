import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useEditorStore } from '../store/editorStore';
import { socket } from '../socket';
import { emitCodeChange } from '../services/socketService';

export function CodeEditor() {
  const { code, language, roomId, setCode } = useEditorStore();
  const isTyping = useRef(false);

  useEffect(() => {
    if (!roomId) return;

    const handleCodeUpdate = (newCode: string) => {
      if (!isTyping.current) {
        setCode(newCode);
      }
    };

    socket.on('code-update', handleCodeUpdate);
    return () => {
      socket.off('code-update', handleCodeUpdate);
    };
  }, [roomId, setCode]);

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    
    isTyping.current = true;
    setCode(value);
    if (roomId) {
      emitCodeChange(roomId, value);
    }
    setTimeout(() => {
      isTyping.current = false;
    }, 500);
  };

  return (
    <Editor
    className=''
      height="100%"
      defaultLanguage={language}
      language={language}
      theme="vs-dark"
      value={code}
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on',
        automaticLayout: true,
      }}
    />
  );
}