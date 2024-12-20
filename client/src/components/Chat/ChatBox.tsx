import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { useChatStore } from '../../store/chatStore';
import { ChatMessage } from './ChatMessage';
import { emitChatMessage } from '../../services/socketService';

export function ChatBox() {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const username = useUserStore((state) => state.username);
  const messages = useChatStore((state) => state.messages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && username) {
      const newMessage = {
        id: Date.now().toString(),
        username,
        text: message.trim(),
        timestamp: Date.now(),
        type: 'user' as const
      };
      emitChatMessage(newMessage);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold">Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="p-2 bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}