import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

/**
 * Singleton Socket.IO client for the meeting signaling gateway.
 *
 * The gateway is shared across all hooks/components while the user is
 * on a meeting page. A new socket is created when the url or token changes
 * (e.g. after a token refresh). The previous socket is disconnected cleanly.
 */

let instance: Socket | null = null;
let instanceUrl: string | null = null;
let instanceToken: string | null = null;

/**
 * Return the existing socket if url+token are unchanged, otherwise create a
 * fresh one (disconnecting the previous instance first).
 *
 * The returned socket has `autoConnect: false` — callers must call
 * `socket.connect()` explicitly.
 */
export const getMeetingSocket = (url: string, token: string): Socket => {
  if (instance && instanceUrl === url && instanceToken === token) {
    return instance;
  }

  if (instance) {
    instance.removeAllListeners();
    instance.disconnect();
  }

  instance = io(url, {
    autoConnect: false,
    auth: { token },
  });

  instanceUrl = url;
  instanceToken = token;

  return instance;
};

/**
 * Disconnect and destroy the singleton socket.
 * Call this when the user leaves the meeting context entirely.
 */
export const destroyMeetingSocket = (): void => {
  if (instance) {
    instance.removeAllListeners();
    instance.disconnect();
    instance = null;
    instanceUrl = null;
    instanceToken = null;
  }
};
