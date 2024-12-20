import { Users } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';

export function RoomInfo() {
  const { roomId, users } = useEditorStore();

  return (
    <div className="flex items-center space-x-4 px-4 py-2 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center space-x-2">
        <Users className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-300">
          {users.length} {users.length === 1 ? 'member' : 'members'} online
        </span>
      </div>
      <div className="flex-1" />
      <div className="text-sm">
        <span className="text-gray-400">Room ID: </span>
        <span className="text-gray-300 font-mono">{roomId}</span>
      </div>
    </div>
  );
}