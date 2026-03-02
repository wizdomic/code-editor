import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { useUserStore }   from '../../store/userStore';
import { useEditorStore } from '../../store/editorStore';
import { socket }         from '../../socket';
import { emit }           from '../../services/socketService';
import { saveSession }    from '../../sessions';

const INPUT = 'w-full h-10 px-3 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors';

function validateUsername(name: string): string | null {
  if (!name)                                return 'Username is required.';
  if (!/^[a-zA-Z0-9]+$/.test(name))        return 'Letters and numbers only.';
  if (name.length < 3 || name.length > 20) return 'Must be 3–20 characters.';
  if (!/[a-zA-Z]/.test(name))              return 'Must contain at least one letter.';
  if (!/[0-9]/.test(name))                 return 'Must contain at least one number.';
  return null;
}

export function LoginForm() {
  const [joining,  setJoining]  = useState(false);
  const [username, setUsername] = useState('');
  const [roomId,   setRoomId]   = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const pending = useRef({ username: '', roomId: '', password: '', isOwner: false });

  const setStoreUsername = useUserStore(s => s.setUsername);
  const {
    setRoomId: setStoreRoomId, setCode, setLanguageRemote,
    setUsersWithColors, setLocked, setCreatorUsername,
  } = useEditorStore();

  /* auto-fill room from ?room= share link */
  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get('room');
    if (r) { setRoomId(r); setJoining(true); }
  }, []);

  useEffect(() => {
    const onUsernameSet = (clean: string) => {
      pending.current.username = clean;
      setError(null);
      if (joining) {
        const rid = roomId.trim();
        pending.current = { username: clean, roomId: rid, password, isOwner: false };
        setStoreRoomId(rid);
        socket.emit('join-room', { roomId: rid, password });
      } else {
        const newId = Math.random().toString(36).substring(2, 8);
        pending.current = { username: clean, roomId: newId, password, isOwner: true };
        setStoreRoomId(newId);
        socket.emit('create-room', { roomId: newId, password });
      }
    };

    const onInitialState = (state: any) => {
      if (!pending.current.username) return;
      if (pending.current.isOwner && !state.code) {
        // Push owner's existing editor code to server so joiners get real code
        emit.codeChange(pending.current.roomId, useEditorStore.getState().code);
        setLanguageRemote(state.language);
      } else {
        setCode(state.code);
        setLanguageRemote(state.language);
      }
      setUsersWithColors(state.usersWithColors ?? []);
      setLocked(state.isLocked ?? false);
      setCreatorUsername(state.creatorUsername ?? null);
      saveSession(pending.current);
      window.history.replaceState({}, '', window.location.pathname);
      setStoreUsername(pending.current.username);
      pending.current.username = '';
    };

    const onError = (msg: string) => { setError(msg); setLoading(false); };

    socket.on('username-set',  onUsernameSet);
    socket.on('initial-state', onInitialState);
    socket.on('error-message', onError);
    return () => {
      socket.off('username-set',  onUsernameSet);
      socket.off('initial-state', onInitialState);
      socket.off('error-message', onError);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joining, roomId, password]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const err = validateUsername(username.trim());
    if (err) return setError(err);
    if (password.length < 4) return setError('Password must be at least 4 characters.');
    if (joining && !roomId.trim()) return setError('Room ID is required.');
    setLoading(true);
    socket.emit('set-username', username.trim());
  };

  const switchMode = (j: boolean) => { setJoining(j); setError(null); setPassword(''); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
        <p className="text-gray-400 text-sm">{joining ? 'Joining room…' : 'Creating room…'}</p>
        <button onClick={() => setLoading(false)}
          className="text-xs text-gray-600 hover:text-gray-400 underline">Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">⌨️ CodeCollab</h1>
          <p className="text-gray-500 text-sm mt-2">Real-time collaborative code editor</p>
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700/60 p-6 shadow-2xl">

          {/* mode tabs */}
          <div className="flex bg-gray-900 rounded-xl p-1 mb-6">
            <button type="button" onClick={() => switchMode(false)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                !joining ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              <Plus className="w-3.5 h-3.5" /> New Room
            </button>
            <button type="button" onClick={() => switchMode(true)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                joining ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              <ArrowRight className="w-3.5 h-3.5" /> Join Room
            </button>
          </div>

          {error && (
            <div className="bg-red-950/60 border border-red-800/60 text-red-300 px-3 py-2.5 rounded-xl mb-5 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="e.g. alice42" maxLength={20} required className={INPUT} />
              <p className="text-[10px] text-gray-600 mt-1">Letters + numbers, at least one of each</p>
            </div>

            {joining && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Room ID</label>
                <input type="text" value={roomId} onChange={e => setRoomId(e.target.value)}
                  placeholder="Enter room ID" required className={INPUT} />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                {joining ? 'Room Password' : 'Set Password'}
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 4 characters" required
                  className={INPUT + ' pr-10'} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!joining && <p className="text-[10px] text-gray-600 mt-1">Share this with people you invite</p>}
            </div>

            <button type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700
                         text-white rounded-xl text-sm font-semibold transition-colors">
              {joining ? 'Join Session' : 'Create Session'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-gray-700 mt-4">
          Rooms are password protected · Code runs via JDoodle
        </p>
      </div>
    </div>
  );
}