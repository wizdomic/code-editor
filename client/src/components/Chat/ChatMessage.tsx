import { Message } from '../../types/chat';
import { useUserStore } from '../../store/userStore';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const username = useUserStore((state) => state.username);
  const isCurrentUser = message.username === username;
  const isSystem = message.type === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col ${
        isCurrentUser ? 'items-end' : 'items-start'
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isCurrentUser ? 'bg-blue-600' : 'bg-gray-700'
        }`}
      >
        <p className="text-sm font-semibold">{message.username}</p>
        <p className="text-sm">{message.text}</p>
        <p className="text-xs text-gray-300 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}