# WM-8: Integrate WebRTC Signaling for SDP and ICE Exchange

---

## 1. Feature Summary

This feature wires the WebRTC signaling layer between participants by implementing a useSignaling hook. The hook listens to socket events (offer, answer, ice-candidate, participant-joined) and drives RTCPeerConnection negotiation -- creating offers, setting remote descriptions, emitting answers, and routing ICE candidates -- so that audio and video media can flow between participants in the meeting room.

---

## 2. Problem Statement

The peer connection objects created by usePeerConnections (WM-7) are fully initialised but have no signaling layer to negotiate sessions. Without SDP offer/answer exchange and bidirectional ICE candidate routing, every RTCPeerConnection stays in the new state indefinitely and no media flows between participants. WM-8 closes this gap by plugging socket signaling events directly into the peer connection lifecycle.

---

## 3. Feature Type

**Feature Type:** Frontend

All work is confined to a new client-side React hook (useSignaling) that orchestrates browser WebRTC APIs and the socket.io-client instance managed by useMeetingSocket. No backend code is modified.

---

## 4. Technical Design

### Frontend

**New files:**
- src/features/meeting/hooks/useSignaling.ts

**Files to modify:**
- src/features/meeting/types/meeting.types.ts -- add OfferPayload, AnswerPayload, IceCandidatePayload, UseSignalingReturn types.
- src/features/meeting/hooks/index.ts -- export useSignaling.
- src/features/meeting/index.ts -- export useSignaling and UseSignalingReturn.
- src/features/meeting/hooks/usePeerConnections.ts -- add getPeerConnection getter.

**Hook signature:**

  useSignaling(socket, meetingId, createPeerConnection, closePeerConnection, getPeerConnection)

**Internal refs (no re-renders):**

- iceCandidateQueuesRef -- useRef(new Map()) -- buffers RTCIceCandidateInit per peer before remote description is set.
- remoteDescriptionSetRef -- useRef(new Set()) -- tracks which peers have had setRemoteDescription called.
- isUnmountedRef -- useRef(false) -- unmount guard, same pattern as useMeetingSocket.

**Event handlers registered in a single useEffect keyed on [socket, meetingId, createPeerConnection, closePeerConnection, getPeerConnection]:**

1. handleParticipantJoined (participant-joined):
   - Validate payload.participant.userId; warn and return if malformed.
   - Call createPeerConnection(userId); return if null (mesh limit).
   - Attach onicecandidate to pc: emit ice-candidate event via socket.
   - createOffer -> setLocalDescription -> emit offer { peerId, sdp }.
   - All async in try/catch; closePeerConnection on error.

2. handleOffer (offer):
   - Validate payload.peerId and payload.sdp.
   - createPeerConnection(peerId); attach onicecandidate.
   - setRemoteDescription; mark remoteDescriptionSetRef; drain ICE queue.
   - createAnswer -> setLocalDescription -> emit answer { peerId, sdp }.

3. handleAnswer (answer):
   - Validate payload.peerId and payload.sdp.
   - getPeerConnection(peerId); return if undefined.
   - setRemoteDescription; mark remoteDescriptionSetRef; drain ICE queue.

4. handleIceCandidate (ice-candidate):
   - Validate payload.peerId and payload.candidate.
   - If remoteDescriptionSetRef has peerId: addIceCandidate immediately.
   - Otherwise buffer in iceCandidateQueuesRef for this peer.

**drainIceCandidateQueue(peerId, pc) helper:**
- Retrieve queue; call addIceCandidate for each entry; clear queue.

**Exposing getPeerConnection:**

Extend UsePeerConnectionsReturn with getPeerConnection: (peerId: string) => RTCPeerConnection | undefined. Implement via peerConnectionsRef.current.get(peerId) in usePeerConnections.ts.

### State Management

- isNegotiating (useState boolean) and negotiationErrors (useState Record string) held in state for UI reactivity.
- All buffers held in useRef -- mutated without re-renders.
- Event handlers defined inline inside useEffect to avoid stale closures; no useCallback needed.
- No Zustand store -- state scoped to meeting session lifetime.

### Realtime / External Services

Events consumed:

| Event | Direction | Payload | When |
| --- | --- | --- | --- |
| participant-joined | server to client | { meetingId, participant: { userId, ... } } | Remote participant joins |
| offer | server to client | { peerId, sdp } | Remote peer sends offer |
| answer | server to client | { peerId, sdp } | Remote peer answers |
| ice-candidate | server to client | { peerId, candidate } | Remote ICE candidate |

Events emitted:

| Event | Direction | Payload | When |
| --- | --- | --- | --- |
| offer | client to server | { peerId, sdp } | After local offer created |
| answer | client to server | { peerId, sdp } | After accepting remote offer |
| ice-candidate | client to server | { peerId, candidate } | Local ICE candidate generated |

Confirm event names with backend gateway owner before implementing.

---
## 7. Edge Cases

- **createPeerConnection returns null (mesh limit):** Log and return from handleParticipantJoined without emitting offer.
- **ICE candidate before setRemoteDescription:** Buffer in iceCandidateQueuesRef per peer; drain after setRemoteDescription completes.
- **handleAnswer needs existing PC:** getPeerConnection(peerId) getter provides access; if undefined log and return.
- **Duplicate participant-joined for same peer:** createPeerConnection closes old connection; clear per-peer buffers in remoteDescriptionSetRef and iceCandidateQueuesRef before re-negotiating.
- **createOffer or setLocalDescription throws:** Wrap in try/catch; call closePeerConnection(peerId); set negotiationErrors[peerId].
- **Socket goes null mid-negotiation (reconnect):** useEffect cleanup removes all listeners and clears buffers; renegotiation restarts when socket is restored.
- **setRemoteDescription called with wrong SDP type:** Caught by try/catch; peer cleaned up; error in negotiationErrors.
- **Component unmounts during async round-trip:** isUnmountedRef guard prevents state updates and socket emits after unmount.
- **ICE candidate for unknown peerId:** getPeerConnection returns undefined; log and discard without queuing.
- **addIceCandidate failures during drain:** Ignore individual errors; continue draining remaining candidates.

---

## 8. Implementation Plan

1. **Extend UsePeerConnectionsReturn** -- add getPeerConnection getter; implement in usePeerConnections.ts.
2. **Add signaling types** -- add OfferPayload, AnswerPayload, IceCandidatePayload, UseSignalingReturn to meeting.types.ts.
3. **Implement useSignaling hook** -- create useSignaling.ts with refs, state, four handlers, drainIceCandidateQueue, and cleanup.
4. **Export from hooks barrel** -- add useSignaling to hooks/index.ts.
5. **Export from feature barrel** -- add useSignaling and UseSignalingReturn to meeting/index.ts.
6. **Integrate into meetingLobbyPage** -- call useSignaling with socket, meetingId, and the three peer connection functions.
7. **Run pnpm lint and pnpm type-check** -- fix all errors.

---

## 9. Implementation Order

1. Add getPeerConnection to UsePeerConnectionsReturn in meeting.types.ts; implement in usePeerConnections.ts
2. Add OfferPayload, AnswerPayload, IceCandidatePayload, UseSignalingReturn to meeting.types.ts
3. Create src/features/meeting/hooks/useSignaling.ts
4. Export useSignaling from src/features/meeting/hooks/index.ts
5. Export useSignaling and UseSignalingReturn from src/features/meeting/index.ts
6. Call useSignaling in meetingLobbyPage.tsx
7. Run pnpm lint and pnpm type-check; fix all errors
8. Write hook tests

---

## 10. Task Breakdown

**Frontend**

- [ ] Add getPeerConnection: (peerId: string) => RTCPeerConnection | undefined to UsePeerConnectionsReturn in meeting.types.ts
- [ ] Implement getPeerConnection in usePeerConnections.ts via peerConnectionsRef.current.get(peerId)
- [ ] Add OfferPayload interface to meeting.types.ts
- [ ] Add AnswerPayload interface to meeting.types.ts
- [ ] Add IceCandidatePayload interface to meeting.types.ts
- [ ] Add UseSignalingReturn interface (isNegotiating, negotiationErrors) to meeting.types.ts
- [ ] Create src/features/meeting/hooks/useSignaling.ts
- [ ] Implement iceCandidateQueuesRef, remoteDescriptionSetRef, isUnmountedRef inside hook
- [ ] Implement drainIceCandidateQueue(peerId, pc) helper
- [ ] Implement handleParticipantJoined: validate, createPeerConnection, onicecandidate, createOffer, emit offer
- [ ] Implement handleOffer: validate, createPeerConnection, onicecandidate, setRemoteDescription, drain queue, createAnswer, emit answer
- [ ] Implement handleAnswer: validate, getPeerConnection, setRemoteDescription, drain queue
- [ ] Implement handleIceCandidate: validate, route to addIceCandidate or buffer
- [ ] Register all four listeners in single useEffect; deregister and clear buffers in cleanup
- [ ] Export useSignaling from src/features/meeting/hooks/index.ts
- [ ] Export useSignaling and UseSignalingReturn from src/features/meeting/index.ts
- [ ] Wire useSignaling into meetingLobbyPage.tsx

**Shared / Cross-cutting**

- [ ] Run pnpm lint and pnpm type-check with no errors

**Testing**

- [ ] Hook test: participant-joined creates a peer connection and emits offer via socket
- [ ] Hook test: participant-joined with malformed payload is a no-op
- [ ] Hook test: offer event creates PC, sets remote description, emits answer
- [ ] Hook test: answer event calls setRemoteDescription on correct peer connection
- [ ] Hook test: ice-candidate after setRemoteDescription is applied immediately
- [ ] Hook test: ice-candidate before setRemoteDescription is buffered and drained after
- [ ] Hook test: mesh limit reached -- handleParticipantJoined returns without emitting offer
- [ ] Hook test: all listeners removed on cleanup
- [ ] Hook test: no socket emit after isUnmountedRef is true
- [ ] Hook test: drainIceCandidateQueue clears the queue after draining
