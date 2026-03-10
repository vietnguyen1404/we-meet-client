# WM-2: Implement WebSocket Client Connection for Meeting Room

---

## 1. Feature Summary

This feature establishes the lifecycle-managed Socket.IO client connection for the meeting room page. When a user enters /meetings/:id, the frontend automatically connects to the signaling server with JWT authentication, emits a join-room event, and cleanly disconnects when the user leaves the page.

---

## 2. Problem Statement

The meeting experience requires real-time signaling to support participant presence and future WebRTC negotiation. Currently the frontend has no WebSocket connection layer. This issue builds the connection foundation so that subsequent issues (presence events, WebRTC offer/answer) can be layered on top.

---

## 3. Feature Type

**Feature Type:** Frontend

The issue exclusively concerns client-side socket lifecycle management: installing socket.io-client, creating a custom hook, and wiring it into the existing MeetingLobbyPage. No backend work is in scope (the NestJS gateway is a separate dependency).

---

## 4. Technical Design

### Frontend

**Pages / routes to modify:**
- src/features/meeting/components/meetingLobbyPage.tsx -- integrate useMeetingSocket hook; show inline error notice if connection fails.

**New files:**
- src/features/meeting/hooks/useMeetingSocket.ts -- custom hook managing the full socket lifecycle.
- src/features/meeting/hooks/index.ts -- barrel export.

**Files to update:**
- src/config/env.ts -- add socketUrl: import.meta.env.VITE_SOCKET_URL.
- src/features/meeting/index.ts -- export useMeetingSocket.
- src/features/meeting/types/meeting.types.ts -- add SocketConnectionStatus type and UseMeetingSocketReturn interface.
- .env -- add VITE_SOCKET_URL variable.

**Hook design -- useMeetingSocket(meetingId: string | undefined):**

Returns: { isConnected: boolean, connectionStatus: SocketConnectionStatus, error: string | null }

Lifecycle:
1. On mount (when meetingId and accessToken are both defined): create a Socket.IO instance with autoConnect: false and { auth: { token: accessToken } }. Connect immediately.
2. On connect event: emit join-room with { meetingId }. Set connectionStatus to connected.
3. On connect_error event: set error state; set connectionStatus to error.
4. On disconnect event: set connectionStatus to disconnected.
5. On cleanup (unmount): call socket.disconnect() and reset local state.

The socket instance is held in a useRef -- it must NOT be in useState to avoid re-renders on internal socket updates.

**Component integration -- MeetingLobbyPage:**
- Call useMeetingSocket(id) where id comes from useParams.
- If connectionStatus === error, render a non-blocking inline notice using existing AlertTriangleIcon + Text pattern.
- Do not block the lobby UI on socket state.

### State Management

- useMeetingSocket manages its own isConnected, connectionStatus, and error state internally via useState.
- No Zustand store or React Query cache needed -- connection state is local to the meeting page lifetime.
- The socket useRef keeps the instance stable across renders without being part of React state.

### Realtime / External Services

- Library: socket.io-client (production dependency, not yet installed).
- Server URL: read from env.socketUrl (VITE_SOCKET_URL).
- Auth: passed as { auth: { token: accessToken } } in Socket.IO client options.
- Events emitted client -> server: join-room with payload { meetingId: string }.
- Events received: none in scope for this issue.

---

## 5. Edge Cases

- **accessToken null at mount** -- do not connect; log warning. Unlikely behind ProtectedRoute but guarded anyway.
- **meetingId undefined** -- do not connect. MeetingLobbyPage already redirects in this case.
- **connect_error** -- set connectionStatus to error; show inline notice to the user; do not crash or force a redirect.
- **Unmount before connect completes** -- socket.disconnect() is safe to call even if the socket has not fully connected yet.
- **VITE_SOCKET_URL not set** -- guard env.socketUrl for falsiness; log a warning and return early without throwing.
- **Token refresh mid-session** -- socket auth is embedded at handshake time; token rotation mid-session is out of scope for this issue.
- **Duplicate connections** -- useRef holding the socket + a single useEffect with [meetingId, accessToken] deps prevents duplicate sockets.

---

## 6. Implementation Plan

1. **Install socket.io-client** -- run: pnpm add socket.io-client
2. **Extend env config** -- add socketUrl: import.meta.env.VITE_SOCKET_URL to src/config/env.ts; add VITE_SOCKET_URL entry to .env.
3. **Add socket types** -- add SocketConnectionStatus union (idle | connecting | connected | error | disconnected) and UseMeetingSocketReturn interface to meeting.types.ts.
4. **Implement useMeetingSocket** -- src/features/meeting/hooks/useMeetingSocket.ts. Guard falsy inputs. Hold socket in useRef. In useEffect: create socket, register event listeners, call socket.connect(). On connect: emit join-room. Cleanup: removeAllListeners() + disconnect().
5. **Barrel export** -- create src/features/meeting/hooks/index.ts exporting useMeetingSocket.
6. **Update feature barrel** -- add export for useMeetingSocket to src/features/meeting/index.ts.
7. **Integrate into MeetingLobbyPage** -- call useMeetingSocket(id); render conditional inline error notice when connectionStatus is error.
8. **Add i18n key** -- add "socketError": "Could not connect to the meeting room. Please refresh." under meeting.lobby in src/lib/i18n/locales/en.json.
9. **Lint and type-check** -- run pnpm lint && pnpm type-check; fix all errors before marking complete.

---

## 7. Implementation Order

1. Install socket.io-client: pnpm add socket.io-client
2. Extend src/config/env.ts with socketUrl; add VITE_SOCKET_URL to .env
3. Add SocketConnectionStatus union type and UseMeetingSocketReturn interface to meeting.types.ts
4. Implement src/features/meeting/hooks/useMeetingSocket.ts
5. Create src/features/meeting/hooks/index.ts barrel
6. Update src/features/meeting/index.ts to export useMeetingSocket
7. Integrate useMeetingSocket(id) into MeetingLobbyPage; add inline error notice
8. Add meeting.lobby.socketError key to src/lib/i18n/locales/en.json
9. Run pnpm lint and pnpm type-check; resolve all errors

---

## 8. Task Breakdown

**Frontend**

- [ ] Run pnpm add socket.io-client
- [ ] Add socketUrl: import.meta.env.VITE_SOCKET_URL to src/config/env.ts
- [ ] Add VITE_SOCKET_URL=<signaling-server-url> to .env
- [ ] Add SocketConnectionStatus union type to src/features/meeting/types/meeting.types.ts
- [ ] Add UseMeetingSocketReturn interface to src/features/meeting/types/meeting.types.ts
- [ ] Create src/features/meeting/hooks/useMeetingSocket.ts with full socket lifecycle
- [ ] Create src/features/meeting/hooks/index.ts barrel export
- [ ] Export useMeetingSocket from src/features/meeting/index.ts
- [ ] Call useMeetingSocket(id) in MeetingLobbyPage
- [ ] Render inline socket error notice when connectionStatus === error
- [ ] Add meeting.lobby.socketError key to src/lib/i18n/locales/en.json

**Shared / Cross-cutting**

- [ ] Document VITE_SOCKET_URL in .env.example if the file exists

**Testing**

- [ ] Hook test: connects when meetingId and accessToken are both defined
- [ ] Hook test: emits join-room with correct meetingId on the connect event
- [ ] Hook test: calls socket.disconnect() on unmount (cleanup)
- [ ] Hook test: sets connectionStatus to error on connect_error event
- [ ] Hook test: does not connect when meetingId is undefined
