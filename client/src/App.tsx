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
import { LeaveRoomButton } from './components/Auth/LeaveRoomButton';

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
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 bg-gray-800 space-y-2 sm:space-y-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <h1 className="text-lg sm:text-xl font-bold">Collaborative Code Editor</h1>
          <LanguageSelector />
          <ExecuteButton onClick={handleExecuteCode} isLoading={isExecuting} />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 rounded-md hover:bg-blue-700 text-sm sm:text-base"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-3 py-1 sm:px-4 sm:py-2 bg-green-600 rounded-md hover:bg-green-700 text-sm sm:text-base"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <LeaveRoomButton/>
        </div>
      </header>

      {/* Room Info */}
      <RoomInfo />

      {/* Main Content */}
      <main className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        {/* Code Editor Section */}
        <div className="flex-1 sm:flex-2 flex flex-col">
          <div className="flex-1 overflow-auto h-1/3 sm:h-64"> {/* Adjust height for mobile */}
            <CodeEditor />
          </div>
          {/* Output Box */}
          <div className="h-1/3 sm:h-64 md-h-20p-4 overflow-auto bg-gray-800"> {/* Same height as code editor */}
            <CodeOutput output={output} error={error} isLoading={isExecuting} />
          </div>
        </div>

        {/* Chat Box Section */}
        <div className="w-full sm:w-80 border-t sm:border-t-0 sm:border-l border-gray-700 overflow-auto h-1/3 sm:h-auto flex-shrink-0"> {/* Same height as code editor/output */}
          <ChatBox />
        </div>
      </main>
    </div>
  );
}

export default App;