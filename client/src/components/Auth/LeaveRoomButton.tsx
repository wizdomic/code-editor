import React, { useState } from "react";
import { socket } from "../../socket";
import { useUserStore } from "../../store/userStore";
import { useEditorStore } from "../../store/editorStore";
import { useChatStore } from "../../store/chatStore";

export function LeaveRoomButton() {
  const [showConfirm, setShowConfirm] = useState(false);

  const logout = useUserStore((state) => state.logout);
  const setRoomId = useEditorStore((state) => state.setRoomId);
  const setUsers = useEditorStore((state) => state.setUsers);
  const clearMessages = useChatStore((state) => state.clearMessages);

  const handleLeaveRoom = () => {
    // Disconnect socket to trigger backend cleanup
    socket.disconnect();

    // Reset frontend state
    logout();
    setRoomId("");
    setUsers([]);
    clearMessages();

    // Optional: reconnect socket if user wants to join another room
    socket.connect();

    setShowConfirm(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowConfirm(true)}
        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-white"
      >
        Leave Room
      </button>

      {showConfirm && (
        <div className="absolute top-full mt-2 right-0 bg-gray-800 border border-gray-700 p-4 rounded shadow-lg z-50 w-64">
          <p className="text-white mb-3">Are you sure you want to leave the room?</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleLeaveRoom}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
            >
              Leave
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
