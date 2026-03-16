# WM-7: Implement WebRTC Peer Connection Manager

---

## 1. Feature Summary

This feature introduces a usePeerConnections hook that creates and maintains a Map of peerId to RTCPeerConnection for each remote participant in the meeting room. It exposes createPeerConnection(peerId) -- which instantiates an RTCPeerConnection, adds local media tracks, and tracks per-peer connection state -- and closePeerConnection(peerId) -- which closes and removes the connection. All connections are closed automatically on unmount. This hook is the foundational WebRTC transport layer that subsequent signalling issues (SDP offer/answer, ICE) will build upon.

---

## 2. Problem Statement

Audio and video in a WebRTC mesh meeting require an RTCPeerConnection instance per remote participant. Currently the meeting frontend has no such layer: signalling events have no connection object to act on, local media tracks cannot be attached to remote peers, and there is no mechanism to enforce the 4-participant mesh limit. Without this hook, every subsequent WebRTC feature (offer/answer, ICE, remote streams) is blocked. WM-7 closes this gap by providing a single, composable hook that manages the full peer connection lifecycle.

---

## 3. Feature Type

**Feature Type:** Frontend

All work is confined to client-side WebRTC API usage inside a custom React hook; no backend gateway code is affected in this issue.

---

## 4. Technical Design

### Frontend

**New files:**
- src/features/meeting/hooks/usePeerConnections.ts -- the peer connection manager hook.

**Files to modify:**
- src/config/env.ts -- add stunUrl: import.meta.env.VITE_STUN_URL.
- src/features/meeting/types/meeting.types.ts -- add PeerConnectionStatus union type and UsePeerConnectionsReturn interface.
- src/features/meeting/hooks/index.ts -- export usePeerConnections.
- src/features/meeting/index.ts -- export usePeerConnections and UsePeerConnectionsReturn.

**Hook signature -- usePeerConnections(stream: MediaStream | null): UsePeerConnectionsReturn:**

Internal data structures:

- peerConnectionsRef -- useRef(new Map()) holding RTCPeerConnection instances keyed by peerId. Stored in a ref so that createPeerConnection and closePeerConnection can mutate it without triggering re-renders.
- peerStatuses -- useState(Record string to PeerConnectionStatus) -- reactive per-peer status that drives consumer re-renders.
- isUnmountedRef -- useRef(false) -- unmount guard following the same pattern as useMeetingSocket.

Constants defined at module level:

- MAX_PEER_CONNECTIONS = 3
- DEFAULT_STUN = stun:stun.l.google.com:19302

**createPeerConnection(peerId: string): RTCPeerConnection | null**

1. If peerConnectionsRef.current.size >= MAX_PEER_CONNECTIONS, console.warn and return null.
2. If a connection for peerId already exists, close it before replacing (idempotent).
3. Read STUN URL from env.stunUrl ?? DEFAULT_STUN.
4. Instantiate new RTCPeerConnection({ iceServers: [{ urls: stunUrl }] }).
5. If stream is non-null, call stream.getTracks().forEach(track => pc.addTrack(track, stream)).
6. Attach connectionstatechange listener: update peerStatuses for peerId with pc.connectionState; guard with isUnmountedRef and map.has(peerId).
7. Add connection to peerConnectionsRef.current.
8. Set peerStatuses for peerId to connecting immediately.
9. Return the RTCPeerConnection instance.

**closePeerConnection(peerId: string): void**

1. Retrieve connection; return early if not found.
2. Remove senders via pc.getSenders().forEach(s => pc.removeTrack(s)).
3. Call pc.close() inside try/catch; log error and continue on failure.
4. Delete from peerConnectionsRef.current.
5. Update peerStatuses: remove the peerId entry via functional setState.

**Cleanup useEffect (no deps):**

Set isUnmountedRef.current = true. Iterate peerConnectionsRef.current, close each PC, clear the map. Reset peerStatuses to {}.

**UsePeerConnectionsReturn interface:**

- createPeerConnection: (peerId: string) => RTCPeerConnection | null
- closePeerConnection: (peerId: string) => void
- peerStatuses: Record<string, PeerConnectionStatus>
- peerCount: number  (derived: Object.keys(peerStatuses).length)

### State Management

- The Map lives in useRef -- mutated directly, does not trigger re-renders.
- peerStatuses lives in useState -- reactive surface for consumers.
- createPeerConnection and closePeerConnection wrapped in useCallback (dep: stream).
- No Zustand store introduced; follows the same local state pattern as useMeetingSocket and useParticipants.

### Realtime / External Services

- Browser WebRTC API: RTCPeerConnection -- standard browser API, no library needed.
- STUN server: read from env.stunUrl (VITE_STUN_URL); defaults to stun:stun.l.google.com:19302 if not set.
- No new socket events consumed or emitted (SDP and ICE signalling are out of scope).

---

## 7. Edge Cases

- **createPeerConnection called when map.size >= 3** -- console.warn and return null without modifying the map.
- **createPeerConnection for an existing peerId** -- close the old connection first; prevents dangling connections.
- **stream is null at time of createPeerConnection** -- skip addTrack; console.warn; do not crash.
- **stream changes after peer connections are already created** -- existing RTCPeerConnection instances retain old tracks; re-negotiation is out of scope; document limitation.
- **connectionstatechange fires after closePeerConnection** -- guard with peerConnectionsRef.current.has(peerId) before updating state.
- **closePeerConnection for unknown peerId** -- no-op; return early without crashing.
- **pc.close() throws** -- wrap in try/catch; log and continue to delete from map.
- **Unmount during pending connectionstatechange** -- isUnmountedRef guard prevents setState after unmount.
- **VITE_STUN_URL not set** -- fall back to DEFAULT_STUN; console.warn on first createPeerConnection call.
- **RTCPeerConnection undefined (old browser)** -- guard typeof RTCPeerConnection; log error and return null.

---

## 8. Implementation Plan

1. **Add stunUrl to env config** -- append stunUrl: import.meta.env.VITE_STUN_URL to src/config/env.ts.
2. **Add types** -- add PeerConnectionStatus union type and UsePeerConnectionsReturn interface to meeting.types.ts.
3. **Implement usePeerConnections hook** -- create src/features/meeting/hooks/usePeerConnections.ts with all logic described in section 4.
4. **Export from hooks barrel** -- add usePeerConnections to src/features/meeting/hooks/index.ts.
5. **Export from feature barrel** -- add usePeerConnections and UsePeerConnectionsReturn to src/features/meeting/index.ts.
6. **Run pnpm lint && pnpm type-check** -- fix all errors.

---

## 9. Implementation Order

1. Add stunUrl: import.meta.env.VITE_STUN_URL to src/config/env.ts
2. Add PeerConnectionStatus union type to src/features/meeting/types/meeting.types.ts
3. Add UsePeerConnectionsReturn interface to src/features/meeting/types/meeting.types.ts
4. Create src/features/meeting/hooks/usePeerConnections.ts with full hook implementation
5. Export usePeerConnections from src/features/meeting/hooks/index.ts
6. Export usePeerConnections and UsePeerConnectionsReturn from src/features/meeting/index.ts
7. Run pnpm lint && pnpm type-check; fix all errors

---

## 10. Task Breakdown

**Frontend**

- [ ] Add stunUrl: import.meta.env.VITE_STUN_URL to src/config/env.ts
- [ ] Add PeerConnectionStatus union type to meeting.types.ts
- [ ] Add UsePeerConnectionsReturn interface to meeting.types.ts
- [ ] Define MAX_PEER_CONNECTIONS = 3 and DEFAULT_STUN constants in usePeerConnections.ts
- [ ] Declare peerConnectionsRef (useRef Map) in usePeerConnections
- [ ] Declare peerStatuses (useState Record) in usePeerConnections
- [ ] Declare isUnmountedRef (useRef boolean) in usePeerConnections
- [ ] Implement createPeerConnection with mesh-limit guard, duplicate guard, RTCPeerConnection instantiation, addTrack, connectionstatechange listener
- [ ] Implement closePeerConnection with sender removal, pc.close(), map delete, peerStatuses cleanup
- [ ] Write cleanup useEffect (no deps) closing all PCs and resetting state
- [ ] Wrap createPeerConnection and closePeerConnection with useCallback (dep: stream)
- [ ] Export usePeerConnections from src/features/meeting/hooks/index.ts
- [ ] Export usePeerConnections from src/features/meeting/index.ts
- [ ] Export UsePeerConnectionsReturn type from src/features/meeting/index.ts

**Shared / Cross-cutting**

- [ ] Add VITE_STUN_URL=stun:stun.l.google.com:19302 to .env (or .env.example)
- [ ] Run pnpm lint && pnpm type-check with no errors

**Testing**

- [ ] Hook test: createPeerConnection returns RTCPeerConnection with getSenders() populated when stream is provided
- [ ] Hook test: createPeerConnection returns null and does not mutate map when size >= MAX_PEER_CONNECTIONS
- [ ] Hook test: createPeerConnection for existing peerId closes old connection before inserting new one
- [ ] Hook test: createPeerConnection skips addTrack and does not crash when stream is null
- [ ] Hook test: connectionstatechange updates peerStatuses for the correct peerId
- [ ] Hook test: closePeerConnection removes connection from map and updates peerStatuses
- [ ] Hook test: closePeerConnection for unknown peerId is a no-op
- [ ] Hook test: unmount closes all open connections and clears peerStatuses
- [ ] Hook test: connectionstatechange after closePeerConnection does not crash