import { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, Lock, Crown, Copy, Check, ChevronDown } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { useUserStore }   from '../store/userStore';
import { socket }         from '../socket';
import { emit }           from '../services/socketService';

export function RoomInfo() {
  const { roomId, usersWithColors, isLocked, creatorUsername } = useEditorStore();
  const username = useUserStore(s => s.username);
  const isOwner  = creatorUsername === username;
  const others   = usersWithColors.filter(u => u.username !== username);

  const [connected, setConnected] = useState(socket.connected);
  const [copied,    setCopied]    = useState(false);
  const [open,      setOpen]      = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* socket connection badge */
  useEffect(() => {
    const on  = () => setConnected(true);
    const off = () => setConnected(false);
    socket.on('connect',    on);
    socket.on('disconnect', off);
    return () => { socket.off('connect', on); socket.off('disconnect', off); };
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const copyRoom = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const transfer = (to: string) => {
    setOpen(false);
    if (roomId) emit.transferOwnership(roomId, to);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-1.5 bg-gray-800/60 border-b border-gray-700/60
                    text-xs flex-shrink-0 flex-wrap min-w-0">

      {/* connection */}
      <span className={`flex items-center gap-1 font-medium whitespace-nowrap ${
        connected ? 'text-green-400' : 'text-yellow-400'}`}>
        {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        {connected ? 'Live' : 'Reconnecting'}
      </span>

      <span className="text-gray-700">·</span>

      {/* room ID + copy */}
      <span className="flex items-center gap-1 whitespace-nowrap">
        <span className="text-gray-500">Room</span>
        <span className="font-mono text-gray-200 tracking-wide">{roomId}</span>
        <button onClick={copyRoom} title="Copy room ID"
          className="text-gray-600 hover:text-gray-300 transition-colors ml-0.5">
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </span>

      <span className="text-gray-700">·</span>

      {/* users */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {usersWithColors.map(({ username: u, color, isCreator }) => (
          <span key={u}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ backgroundColor: color + '1a', border: `1px solid ${color}55` }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }} />
            <span className="text-gray-200">{u}</span>
            {u === username && <span className="text-gray-600">(you)</span>}
            {isCreator && <Crown className="w-2.5 h-2.5 text-yellow-400 flex-shrink-0" />}
          </span>
        ))}
      </div>

      {/* locked badge */}
      {isLocked && (
        <>
          <span className="text-gray-700">·</span>
          <span className="flex items-center gap-1 text-red-400 whitespace-nowrap">
            <Lock className="w-3 h-3" /> Locked
          </span>
        </>
      )}

      {/* transfer ownership — owner only, only when someone else is in the room */}
      {isOwner && others.length > 0 && (
        <>
          <span className="text-gray-700">·</span>

          {/* this wrapper is position:relative so the dropdown anchors to it.
              overflow is left at default (visible) so the dropdown isn't clipped. */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setOpen(v => !v)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded whitespace-nowrap
                transition-colors ${open
                  ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/40'
                  : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-700 border border-transparent'}`}>
              <Crown className="w-3 h-3" />
              Transfer
              <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="absolute left-0 top-[calc(100%+4px)]
                              bg-gray-900 border border-gray-700 rounded-lg shadow-2xl
                              z-[9999] min-w-[200px] py-1 overflow-visible">
                <p className="text-[10px] text-gray-500 px-3 py-1.5 border-b border-gray-800
                               uppercase tracking-wider">
                  Pass ownership to
                </p>
                {others.map(({ username: u, color }) => (
                  <button key={u} onClick={() => transfer(u)}
                    className="w-full flex items-center gap-2.5 px-3 py-2
                               hover:bg-gray-800 transition-colors text-left group">
                    <span className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }} />
                    <span className="text-gray-200 text-xs flex-1">{u}</span>
                    <span className="text-[10px] text-gray-600 group-hover:text-yellow-500
                                     transition-colors whitespace-nowrap">
                      Make owner →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}