import React, { useState, useEffect } from "react";
import { useUserStore } from "../../store/userStore";
import { useEditorStore } from "../../store/editorStore";
import { socket } from "../../socket";
import "./loginForm.css";

export function LoginForm() {
  const [inputUsername, setInputUsername] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const setUsername = useUserStore((state) => state.setUsername);
  const setRoomId = useEditorStore((state) => state.setRoomId);

  useEffect(() => {
    socket.on("error-message", (msg: string) => {
      console.error("[Server Error]", msg);
      setError(msg);
    });

    socket.on("username-set", (cleanName: string) => {
      setIsConnecting(false); 
      setError(null);
      setUsername(cleanName);

      if (isJoining && inputRoomId.trim()) {
        setRoomId(inputRoomId.trim());
        socket.emit("join-room", inputRoomId.trim());
      } else {
        const newRoomId = Math.random().toString(36).substring(7);
        setRoomId(newRoomId);
        socket.emit("join-room", newRoomId);
      }
    });


    return () => {
      socket.off("error-message");
      socket.off("username-set");
    };
  }, [isJoining, inputRoomId, setUsername, setRoomId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get("room");
    if (roomFromUrl) {
      setInputRoomId(roomFromUrl);
      setIsJoining(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!inputUsername.trim()) {
      setError("Username is required.");
      return;
    }

    setIsConnecting(true); 
    socket.emit("set-username", inputUsername.trim());
  };


  return (
    <div className="starry-background">
      <div id="star-container" className="star-container"></div>
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="form-container bg-gray-800 p-8 rounded-lg shadow-lg relative">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isJoining ? "Join Code Session" : "Create New Session"}
          </h2>

          {isConnecting && (
            <div className="bg-blue-500 text-white p-2 rounded mb-4 text-center">
              Connecting... Please wait
            </div>
          )}

          {error && (
            <div className="bg-red-600 text-white p-2 rounded mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300 pb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                className="mt-1 block h-8 w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your username"
                required
              />
            </div>

            {isJoining && (
              <div>
                <label
                  htmlFor="roomId"
                  className="block text-sm font-medium text-gray-300 pb-2"
                >
                  Room ID
                </label>
                <input
                  type="text"
                  id="roomId"
                  value={inputRoomId}
                  onChange={(e) => setInputRoomId(e.target.value)}
                  className="mt-1 block h-8 w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter room ID"
                  required
                />
              </div>
            )}

            <div className="flex flex-col space-y-2">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {isJoining ? "Join Session" : "Create Session"}
              </button>

              <button
                type="button"
                onClick={() => setIsJoining(!isJoining)}
                className="w-full flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-transparent hover:bg-gray-700"
              >
                {isJoining
                  ? "Create New Session Instead"
                  : "Join Existing Session"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
