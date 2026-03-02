import { useEffect } from 'react';
import { Download, Share2, Lock, Unlock, WifiOff, WrapText } from 'lucide-react';
import { CodeEditor, editorActions } from './components/Editor';
import { CodeOutput }   from './components/Editor/CodeOutput';
import { ExecuteButton } from './components/Editor/ExecuteButton';
import { LanguageSelector } from './components/LanguageSelector';
import { ThemeSelector }    from './components/ThemeSelector';
import { RoomInfo }         from './components/RoomInfo';
import { ChatBox }          from './components/Chat/ChatBox';
import { LoginForm }        from './components/Auth/LoginForm';
import { LeaveRoomButton }  from './components/Auth/LeaveRoomButton';
import { ToastContainer }   from './components/Toast';
import { useEditorStore }   from './store/editorStore';
import { useUserStore }     from './store/userStore';
import { useToastStore }    from './store/toastStore';
import { useReconnection }  from './hooks/useReconnection';
import { useResizer }       from './hooks/useResizer';
import { useRoom }          from './hooks/useRoom';
import { emit }             from './services/socketService';
import { SUPPORTED_LANGUAGES } from './types/editor';

export default function App() {
  const { isLocked, isReadOnly, roomId, fontSize, setFontSize } = useEditorStore();
  const { isAuthenticated } = useUserStore();
  const { addToast }        = useToastStore();
  const reconnectState      = useReconnection();
  const outputResizer       = useResizer(180, 80, 380, 'y');
  const chatResizer         = useResizer(260, 180, 480, 'x');

  const {
    output, execError, isExecuting, stdin, outputRunBy,
    setStdin, handleExecute, handleLanguageChange, isOwner,
  } = useRoom();

  // Warn on accidental refresh — all state is in-memory
  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', fn);
    return () => window.removeEventListener('beforeunload', fn);
  }, []);

  const handleFormat = () => {
    const r = editorActions.formatCode();
    if (!r.supported) addToast(`Format not available for ${r.language}`, 'warning');
  };

  const handleShare = () =>
    navigator.clipboard
      .writeText(`${window.location.origin}?room=${roomId}`)
      .then(() => addToast('Invite link copied!', 'success'));

  const handleDownload = () => {
    const { code, language } = useEditorStore.getState();
    const ext = SUPPORTED_LANGUAGES.find(l => l.id === language)?.extension ?? 'txt';
    const a   = Object.assign(document.createElement('a'), {
      href:     URL.createObjectURL(new Blob([code], { type: 'text/plain' })),
      download: `code.${ext}`,
    });
    a.click();
    addToast(`Downloaded code.${ext}`, 'success');
  };

  /* ── reconnecting overlay ─────────────────────────────────────────────── */
  if (reconnectState !== 'idle') return (
    <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-3">
        <WifiOff className="w-8 h-8 text-yellow-400 mx-auto animate-pulse" />
        <p className="text-white font-medium">
          {reconnectState === 'reconnecting' ? 'Connection lost…' : 'Rejoining room…'}
        </p>
        <p className="text-gray-500 text-sm">Hang tight, reconnecting automatically</p>
      </div>
    </div>
  );

  if (!isAuthenticated) return <LoginForm />;

  /* ── main UI ──────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      <ToastContainer />

      {/* ── toolbar ─────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700 flex-shrink-0 flex-wrap">

        {/* brand */}
        <span className="text-sm font-bold text-white mr-1 whitespace-nowrap">⌨️ CodeCollab</span>

        <div className="h-4 w-px bg-gray-700" />

        {/* editor controls */}
        <LanguageSelector onChange={handleLanguageChange} disabled={isReadOnly} />
        <ThemeSelector />
        <ExecuteButton onClick={handleExecute} isLoading={isExecuting} />

        <button onClick={handleFormat} disabled={isReadOnly} title="Format code"
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <WrapText className="w-4 h-4" />
        </button>

        {/* font size */}
        <div className="flex items-center gap-1 bg-gray-700 border border-gray-600 rounded px-2 py-1">
          <span className="text-[10px] text-gray-500">px</span>
          <input type="number" value={fontSize} min={10} max={28}
            onChange={e => setFontSize(Number(e.target.value))}
            className="w-7 bg-transparent text-xs text-gray-200 text-center outline-none
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
              [&::-webkit-inner-spin-button]:appearance-none" />
        </div>

        <div className="h-4 w-px bg-gray-700" />

        {/* room controls */}
        {isOwner && (
          <button onClick={() => roomId && emit.toggleLock(roomId)}
            title={isLocked ? 'Unlock room' : 'Lock room (others become read-only)'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
              isLocked
                ? 'bg-red-700 hover:bg-red-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}>
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            {isLocked ? 'Locked' : 'Lock'}
          </button>
        )}

        {isReadOnly && !isOwner && (
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-red-900/40 border border-red-700/50 text-red-300 text-xs">
            <Lock className="w-3 h-3" /> Read-only
          </span>
        )}

        {/* push right */}
        <div className="flex-1" />

        <button onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium transition-colors">
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>

        <button onClick={handleDownload}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium text-gray-300 transition-colors">
          <Download className="w-3.5 h-3.5" /> Save
        </button>

        <LeaveRoomButton />
      </header>

      {/* ── room meta bar ────────────────────────────────────────────────── */}
      <RoomInfo />

      {/* ── editor + output + chat ───────────────────────────────────────── */}
      <main className="flex-1 flex overflow-hidden min-h-0">

        {/* editor column */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 min-h-0 select-text">
            <CodeEditor />
          </div>

          {/* output resize handle */}
          <div onMouseDown={outputResizer.onMouseDown}
            className="h-1 bg-gray-700 hover:bg-blue-500 cursor-row-resize transition-colors flex-shrink-0" />

          <div style={{ height: outputResizer.size }} className="flex-shrink-0 overflow-hidden">
            <CodeOutput
              output={output} error={execError} isLoading={isExecuting}
              stdin={stdin} onStdinChange={setStdin} runBy={outputRunBy}
            />
          </div>
        </div>

        {/* chat resize handle */}
        <div onMouseDown={chatResizer.onMouseDown}
          className="w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors flex-shrink-0" />

        {/* chat column */}
        <div style={{ width: chatResizer.size }} className="flex-shrink-0 overflow-hidden border-l border-gray-700/50">
          <ChatBox />
        </div>
      </main>
    </div>
  );
}