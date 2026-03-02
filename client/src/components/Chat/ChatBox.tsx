import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import { useUserStore }   from '../../store/userStore';
import { useChatStore }   from '../../store/chatStore';
import { useEditorStore } from '../../store/editorStore';
import { useTypingStore } from '../../store/typingStore';
import { emit }           from '../../services/socketService';
import { ChatMessage }    from './ChatMessage';

export function ChatBox() {
  const [msg, setMsg]    = useState('');
  const bottomRef        = useRef<HTMLDivElement>(null);
  const inputRef         = useRef<HTMLInputElement>(null);
  const typingTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping         = useRef(false);

  const username    = useUserStore(s => s.username);
  const messages    = useChatStore(s => s.messages);
  const roomId      = useEditorStore(s => s.roomId);
  const typingUsers = useTypingStore(s => s.typingUsers);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const stopTyping = useCallback(() => {
    if (isTyping.current && roomId) { emit.typingStop(roomId); isTyping.current = false; }
  }, [roomId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(e.target.value);
    if (!roomId) return;
    if (!isTyping.current) { emit.typingStart(roomId); isTyping.current = true; }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(stopTyping, 2000);
  };

  const send = () => {
    if (!msg.trim() || !username) return;
    emit.chatMessage({ id: Date.now().toString(), username, text: msg.trim(), timestamp: Date.now(), type: 'user' });
    setMsg('');
    stopTyping();
    inputRef.current?.focus();
  };

  const others = typingUsers.filter(u => u !== username);
  const typingLabel =
    others.length === 1 ? `${others[0]} is typing…` :
    others.length  >  1 ? 'Several people are typing…' : '';

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* header */}
      <div className="px-4 py-2.5 border-b border-gray-700/60 flex-shrink-0">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Chat</span>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto py-2 min-h-0">
        {messages.length === 0 && (
          <p className="text-center text-xs text-gray-700 mt-10 px-4">
            No messages yet.<br/>Say hi 👋
          </p>
        )}
        {messages.map((m, i) => (
          <ChatMessage key={m.id} message={m} prevMessage={messages[i - 1]} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* typing indicator */}
      <div className="h-5 px-4 flex-shrink-0 flex items-center">
        {typingLabel && (
          <span className="text-[10px] text-gray-500 italic">{typingLabel}</span>
        )}
      </div>

      {/* input */}
      <div className="p-3 border-t border-gray-700/60 flex-shrink-0">
        <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2
                        border border-gray-700 focus-within:border-blue-500/60 transition-colors">
          <input ref={inputRef} type="text" value={msg} onChange={handleChange}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Message…" maxLength={500}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none" />
          <button onClick={send} disabled={!msg.trim()}
            className={`flex-shrink-0 transition-colors ${
              msg.trim() ? 'text-blue-400 hover:text-blue-300' : 'text-gray-700 cursor-not-allowed'}`}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}