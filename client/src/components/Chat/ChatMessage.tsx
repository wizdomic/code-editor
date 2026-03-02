import { Message } from '../../types/chat';
import { useUserStore } from '../../store/userStore';

interface Props { message: Message; prevMessage?: Message; }

const COLORS = ['#F87171','#60A5FA','#34D399','#FBBF24','#A78BFA','#F472B6','#38BDF8','#FB923C'];
const avatarColor = (name: string) => COLORS[[...name].reduce((h, c) => h + c.charCodeAt(0), 0) % COLORS.length];
const fmt = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function ChatMessage({ message, prevMessage }: Props) {
  const me       = useUserStore(s => s.username);
  const isMe     = message.username === me;
  const isSystem = message.type === 'system';
  const grouped  = prevMessage?.username === message.username && prevMessage?.type !== 'system';

  if (isSystem) return (
    <div className="flex justify-center my-2">
      <span className="text-[10px] text-gray-600 bg-gray-800/60 px-3 py-0.5 rounded-full">
        {message.text}
      </span>
    </div>
  );

  return (
    <div className={`flex gap-2 px-3 ${isMe ? 'flex-row-reverse' : ''} ${grouped ? 'mt-0.5' : 'mt-3'}`}>

      {/* avatar */}
      <div className="w-6 flex-shrink-0">
        {!grouped && !isMe && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ backgroundColor: avatarColor(message.username) }}>
            {message.username[0].toUpperCase()}
          </div>
        )}
      </div>

      <div className={`flex flex-col max-w-[78%] ${isMe ? 'items-end' : 'items-start'}`}>
        {!grouped && (
          <div className={`flex items-baseline gap-1.5 mb-0.5 ${isMe ? 'flex-row-reverse' : ''}`}>
            {!isMe && <span className="text-[11px] font-medium text-gray-300">{message.username}</span>}
            <span className="text-[10px] text-gray-600">{fmt(message.timestamp)}</span>
          </div>
        )}
        <div className={`px-3 py-1.5 rounded-2xl text-sm leading-snug break-words ${
          isMe
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-gray-700/80 text-gray-100 rounded-tl-sm'
        }`}>
          {message.text}
        </div>
      </div>
    </div>
  );
}