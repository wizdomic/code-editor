import React, { useState, useEffect } from "react";
import { useUserStore } from "../../store/userStore";
import { useEditorStore } from "../../store/editorStore";
import { socket } from "../../socket";
import "./loginForm.css";

export function LoginForm() {
  const [inputUsername, setInputUsername] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const { setUsername, error, setError } = useUserStore();
  const { setRoomId } = useEditorStore();

  // 🌌 On mount: check URL params + listen for errors
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get("room");
    if (roomFromUrl) {
      setInputRoomId(roomFromUrl);
      setIsJoining(true);
    }
    // ✅ Listen for socket errors (like duplicate username)
    const handleError = (msg: string) => {
      console.warn("[Socket Error]", msg);
      setError(msg);
    };
    socket.on("error-message", handleError);

    return () => {
      socket.off("error-message", handleError);
    };
  }, [setError]);

  // 🚀 Handle Join/Create
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = inputUsername.trim();
    const cleanRoomId = inputRoomId.trim();

    if (!cleanName) {
      setError("Please enter a username.");
      return;
    }

    // clear previous errors
    setError(null);

    // 1️⃣ Set username
    setUsername(cleanName);
    socket.emit("set-username", cleanName);

    // 2️⃣ Handle Join or Create
    let roomIdToJoin = cleanRoomId;
    if (!isJoining || !cleanRoomId) {
      roomIdToJoin = Math.random().toString(36).substring(7);
    }

    setRoomId(roomIdToJoin);
    socket.emit("join-room", roomIdToJoin);
  };

  return (
    <div className="starry-background">
      <div id="star-container" className="star-container"></div>

      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="form-container bg-gray-800 p-8 rounded-lg shadow-lg relative">
          <h2 className="text-2xl font-bold text-white mb-6 pl-12 lg:pl-28 bg-gray-700 pt-2 pb-2 rounded-lg">
            {isJoining ? "Join Code Session" : "Create New Session"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
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
                onChange={(e) => {
                  setInputUsername(e.target.value);
                  if (error) setError(null); // clear error on typing
                }}
                className="mt-1 block h-8 w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Room ID (only in join mode) */}
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
                  onChange={(e) => {
                    setInputRoomId(e.target.value);
                    if (error) setError(null);
                  }}
                  className="mt-1 block h-8 w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter room ID"
                  required
                />
              </div>
            )}

            {/* ⚠️ Error Display */}
            {error && (
              <div className="bg-red-600 text-white text-sm px-3 py-2 rounded-md text-center">
                ⚠️ {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col space-y-2">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isJoining ? "Join Session" : "Create Session"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsJoining(!isJoining);
                  setError(null);
                }}
                className="w-full flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-md font-medium text-gray-200 bg-transparent hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
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
