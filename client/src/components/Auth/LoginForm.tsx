import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { useEditorStore } from '../../store/editorStore';
import { socket } from '../../socket';

export function LoginForm() {
  const [inputUsername, setInputUsername] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const setUsername = useUserStore((state) => state.setUsername);
  const setRoomId = useEditorStore((state) => state.setRoomId);

  // Check URL for room ID parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    if (roomFromUrl) {
      setInputRoomId(roomFromUrl);
      setIsJoining(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUsername.trim()) {
      setUsername(inputUsername.trim());
      socket.emit('set-username', inputUsername.trim());

      if (isJoining && inputRoomId.trim()) {
        setRoomId(inputRoomId.trim());
        socket.emit('join-room', inputRoomId.trim());
      } else {
        const newRoomId = Math.random().toString(36).substring(7);
        setRoomId(newRoomId);
        socket.emit('join-room', newRoomId);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-white mb-6">
          {isJoining ? 'Join Code Session' : 'Create New Session'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your username"
              required
            />
          </div>

          {isJoining && (
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-300">
                Room ID
              </label>
              <input
                type="text"
                id="roomId"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter room ID"
                required
              />
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isJoining ? 'Join Session' : 'Create Session'}
            </button>
            <button
              type="button"
              onClick={() => setIsJoining(!isJoining)}
              className="w-full flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-transparent hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {isJoining ? 'Create New Session Instead' : 'Join Existing Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}