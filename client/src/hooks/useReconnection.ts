import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { loadSession, clearSession } from '../sessions';
import { useUserStore } from '../store/userStore';
import { useEditorStore } from '../store/editorStore';

export type ReconnectState = 'idle' | 'reconnecting' | 'rejoining';

/**
 * Silently re-joins a room after an unexpected socket disconnect.
 *
 * Key design decisions:
 * - Uses getState() inside callbacks to avoid stale closure issues.
 * - Cleans up dangling once() listeners if reconnect is abandoned —
 *   without cleanup, each reconnect cycle stacks another set of handlers.
 */
export function useReconnection(): ReconnectState {
  const [state, setState] = useState<ReconnectState>('idle');

  useEffect(() => {
    // Named handlers so we can clean them up precisely
    let onUsernameSet: (() => void) | null = null;
    let onInitialState: ((s: any) => void) | null = null;
    let onErrorMessage: (() => void) | null = null;

    function cleanupOnce() {
      if (onUsernameSet)  socket.off('username-set',  onUsernameSet);
      if (onInitialState) socket.off('initial-state', onInitialState);
      if (onErrorMessage) socket.off('error-message', onErrorMessage);
      onUsernameSet = onInitialState = onErrorMessage = null;
    }

    const onDisconnect = (reason: string) => {
      if (reason === 'io client disconnect') return; // intentional leave
      if (loadSession()) setState('reconnecting');
    };

    const onReconnect = () => {
      const session = loadSession();
      if (!session) { setState('idle'); return; }

      // Clean up any leftover handlers from a previous failed reconnect
      cleanupOnce();
      setState('rejoining');

      onUsernameSet = () => {
        const event = session.isOwner ? 'create-room' : 'join-room';
        socket.emit(event, { roomId: session.roomId, password: session.password });
      };

      onInitialState = (s: any) => {
        cleanupOnce();
        const editor = useEditorStore.getState();
        editor.setCode(s.code);
        editor.setLanguageRemote(s.language);
        editor.setUsersWithColors(s.usersWithColors ?? []);
        editor.setLocked(s.isLocked ?? false);
        editor.setCreatorUsername(s.creatorUsername ?? null);
        useUserStore.getState().setUsername(session.username);
        setState('idle');
      };

      onErrorMessage = () => {
        cleanupOnce();
        clearSession();
        useUserStore.getState().logout();
        useEditorStore.getState().setRoomId(null);
        setState('idle');
      };

      socket.once('username-set',  onUsernameSet);
      socket.once('initial-state', onInitialState);
      socket.once('error-message', onErrorMessage);

      socket.emit('set-username', session.username);
    };

    socket.on('disconnect',    onDisconnect);
    socket.io.on('reconnect',  onReconnect);

    return () => {
      socket.off('disconnect',   onDisconnect);
      socket.io.off('reconnect', onReconnect);
      cleanupOnce(); // clean up if component unmounts mid-reconnect
    };
  }, []);

  return state;
}