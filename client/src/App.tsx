import React from 'react';
import { Download, Share2 } from 'lucide-react';
import { CodeEditor } from './components/Editor';
import { CodeOutput } from './components/Editor/CodeOutput';
import { ExecuteButton } from './components/Editor/ExecuteButton';
import { LanguageSelector } from './components/LanguageSelector';
import { RoomInfo } from './components/RoomInfo';
import { ChatBox } from './components/Chat/ChatBox';
import { LoginForm } from './components/Auth/LoginForm';
import { useEditorStore } from './store/editorStore';
import { useUserStore } from './store/userStore';
import { useChatStore } from './store/chatStore';
import { executeCode } from './services/codeExecutionService';
import { setupSocketListeners } from './services/socketService';
import { SUPPORTED_LANGUAGES } from './types/editor';

function App() {
  const { code, language, roomId, setUsers, setCode, setLanguage } = useEditorStore();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const { addMessage, addSystemMessage } = useChatStore();
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isExecuting, setIsExecuting] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) return;

    const cleanup = setupSocketListeners(
      setUsers,
      setCode,
      setLanguage,
      addMessage,
      addSystemMessage
    );

    return cleanup;
  }, [isAuthenticated, setUsers, setCode, setLanguage, addMessage, addSystemMessage]);

  const handleExecuteCode = async () => {
    setIsExecuting(true);
    setOutput('');
    setError(null);

    try {
      const result = await executeCode(code, language);
      setOutput(result.output);
      setError(result.error);
    } catch (err) {
      setError('Failed to execute code');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    alert('Room URL copied to clipboard!');
  };

  const handleDownload = () => {
    const extension = SUPPORTED_LANGUAGES.find(lang => lang.id === language)?.extension || language;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex items-center justify-between px-4 py-3 bg-gray-800">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Collaborative Code Editor</h1>
          <LanguageSelector />
          <ExecuteButton onClick={handleExecuteCode} isLoading={isExecuting} />
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 rounded-md hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </header>
      <RoomInfo />
      <main className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <CodeEditor />
          </div>
          <div className="h-64 p-4">
            <CodeOutput output={output} error={error} isLoading={isExecuting} />
          </div>
        </div>
        <div className="w-80 border-l border-gray-700">
          <ChatBox />
        </div>
      </main>
    </div>
  );
}

export default App;