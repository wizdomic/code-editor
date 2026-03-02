import { LogOut } from 'lucide-react';
import { useUserStore }   from '../../store/userStore';
import { useEditorStore } from '../../store/editorStore';
import { useChatStore }   from '../../store/chatStore';
import { clearSession }   from '../../sessions';
import { socket }         from '../../socket';

export function LeaveRoomButton() {
  const logout        = useUserStore(s => s.logout);
  const setRoomId     = useEditorStore(s => s.setRoomId);
  const clearMessages = useChatStore(s => s.clearMessages);

  const leave = () => {
    clearSession();
    socket.disconnect();
    socket.connect();
    logout();
    setRoomId(null);
    clearMessages();
  };

  return (
    <button onClick={leave} title="Leave room"
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium
                 bg-gray-700 hover:bg-red-700 text-gray-300 hover:text-white transition-colors">
      <LogOut className="w-3.5 h-3.5" /> Leave
    </button>
  );
}