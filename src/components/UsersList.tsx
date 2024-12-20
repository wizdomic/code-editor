import { Users } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';

export function UsersList() {
  const { users } = useEditorStore();

  return (
    <div className="flex items-center space-x-2 px-4">
      <Users className="w-5 h-5 text-gray-400" />
      <div className="flex items-center space-x-2">
        {users.map((username, index) => (
          <span
            key={username}
            className="text-sm bg-gray-700 px-2 py-1 rounded-full"
          >
            {username}
          </span>
        ))}
      </div>
    </div>
  );
}