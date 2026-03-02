import { useState, useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useUserStore } from '../store/userStore';
import { useChatStore } from '../store/chatStore';
import { useToastStore } from '../store/toastStore';
import { useTypingStore } from '../store/typingStore';
import { setupRoomListeners, emit } from '../services/socketService';
import { executeCode } from '../services/codeExecutionService';
import defaultCode from '../defaultCode';

export function useRoom() {
  const {
    code, language, roomId, isLocked, creatorUsername,
    setCode, setLanguageRemote, setLocked, setReadOnly,
    setCreatorUsername, setUsersWithColors,
  } = useEditorStore();

  const { username, isAuthenticated } = useUserStore();
  const { addMessage, addSystemMessage } = useChatStore();
  const { addToast } = useToastStore();
  const setTypingUsers = useTypingStore(s => s.setTypingUsers);

  const [output,      setOutput]      = useState('');
  const [execError,   setExecError]   = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [stdin,       setStdin]       = useState('');
  const [outputRunBy, setOutputRunBy] = useState<string | null>(null);

  const isOwner = creatorUsername === username;

  useEffect(() => {
    if (!isAuthenticated) return;
    return setupRoomListeners(
      {
        onUsersUpdate:    setUsersWithColors,
        onCodeUpdate:     setCode,
        // BUG FIX 2: setLanguageRemote only — never reset code on remote language change.
        // Code content stays in sync via the separate code-change that the owner emits.
        onLanguageUpdate: (lang) => setLanguageRemote(lang),
        onChatMessage:    addMessage,
        onCursorUpdate:   () => {},
        onCursorRemove:   () => {},
        onTypingUpdate:   setTypingUsers,
        onOutputUpdate:   (out, err, runBy) => {
          setOutput(out); setExecError(err); setOutputRunBy(runBy);
        },
        onLockChange: (locked, owner) => {
          setLocked(locked);
          setReadOnly(locked && !owner);
        },
        onOwnerChange: (newOwner) => {
          setCreatorUsername(newOwner);
          addSystemMessage(`${newOwner} is now the owner`);
        },
        toast: addToast,
      },
      () => useEditorStore.getState().creatorUsername === useUserStore.getState().username,
    );
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExecute = async () => {
    setIsExecuting(true);
    setOutput(''); setExecError(null); setOutputRunBy(null);
    try {
      const result = await executeCode(code, language, stdin);
      setOutput(result.output);
      setExecError(result.error);
      if (isLocked && isOwner && roomId)
        emit.broadcastOutput(roomId, result.output, result.error, language);
    } catch {
      setExecError('Execution failed.');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    // BUG FIX 2: setLanguage resets code to default snippet locally.
    // We MUST also emit code-change so the server and all other clients
    // get the new default code — otherwise they keep the old code
    // with new syntax highlighting, causing a split-brain.
    const newCode = defaultCode[lang] ?? '// Start coding...';
    useEditorStore.getState().setLanguage(lang);        // updates local language + code
    if (roomId) {
      emit.languageChange(roomId, lang);                // tells others: switch language
      emit.codeChange(roomId, newCode);                 // tells others: here is the new code
    }
  };

  const handleTransferOwnership = (targetUsername: string) => {
    if (!roomId || !isOwner) return;
    emit.transferOwnership(roomId, targetUsername);
  };

  return {
    output, execError, isExecuting, stdin, outputRunBy,
    setStdin,
    handleExecute,
    handleLanguageChange,
    handleTransferOwnership,
    isOwner,
  };
}