# WM-5: Sync Participant List with Server Presence State

---

## 1. Feature Summary

This feature hardens useParticipants to ensure the in-room participant list always reflects the server authoritative presence state. It validates that the participants-list event fully replaces local state on join and after reconnect, that participant-joined deduplicates by userId, that participant-left is a no-op for unknown participants, and that all handlers are defensively guarded against malformed payloads.

---

## 2. Problem Statement

The participant list in useParticipants was introduced in WM-3 with the correct structural patterns, but the handlers lack defensive guards against malformed socket payloads. A single bad payload can corrupt the participantMap or throw at runtime. WM-5 closes this gap by adding explicit payload validation to every event handler so the UI never crashes and always stays synchronized with server state.

---

## 3. Feature Type

**Feature Type:** Frontend

All changes are confined to the client-side hook layer (useParticipants) and its types; no backend gateway code is modified.

---

## 4. Technical Design

### Frontend

**Files to modify:**

- src/features/meeting/hooks/useParticipants.ts -- add defensive payload validation to all three event handlers; add warn log for malformed payloads and unknown participant-left no-ops.

No new files are required. The hook external interface (UseParticipantsReturn), type definitions, and event registration pattern are already correct from WM-3.

**Handler hardening rules:**

1. handleParticipantsList -- verify payload.participants is a valid array before iterating. If not an array, console.warn and return without mutating state.
2. handleParticipantJoined -- verify payload.participant exists and payload.participant.userId is a non-empty string. If malformed, console.warn and return.
3. handleParticipantLeft -- verify payload.participant exists and payload.participant.userId is a non-empty string. If absent, console.warn and return. If userId is valid but absent from the map, the existing no-op guard is correct; add console.warn for observability.

**Validation pattern:** runtime type checks only (Array.isArray for falsy branch, typeof userId check, object existence). Never throw -- always console.warn and return early.

### State Management

- participantMap keyed by userId remains the correct structure. Defensive guards prevent an undefined userId from being stringified and written to the map.
- No new state or refs required.
- Reconnect resync is already handled: socket goes null on disconnect (effect cleanup resets map to {}); when socket is restored the effect re-runs, re-emits watch-meeting, and participants-list repopulates the map from the server.

### Realtime / External Services

No new events. Existing three events consumed by this hook:

| Event | Direction | Key payload field |
| --- | --- | --- |
| participants-list | server to client | payload.participants: ParticipantInfo[] |
| participant-joined | server to client | payload.participant: ParticipantInfo |
| participant-left | server to client | payload.participant.userId: string |

---

## 5. Edge Cases

- **participants-list with non-array participants field** -- console.warn, return; previous map stays visible.
- **participant-joined with missing participant object** -- console.warn, return; no corrupt entry added.
- **participant-joined with userId already in map** -- existing no-op prevents duplicate row.
- **participant-left with missing participant object** -- console.warn, return; no crash.
- **participant-left with userId not in map** -- existing no-op is correct; add console.warn for observability.
- **Socket disconnects mid-session** -- setParticipantMap({}) in cleanup clears stale state; ParticipantList shows empty/loading until reconnect.
- **Reconnect delivers participants-list before REST finishes** -- map populated from socket; REST is for meeting metadata only.
- **Rapid participant-joined then participant-left same user** -- functional updates prevent race-condition corruption.

---

## 6. Implementation Plan

1. **Harden handleParticipantsList** -- if participants field is not an array, console.warn and return without mutating state.
2. **Harden handleParticipantJoined** -- if payload.participant is falsy or userId is not a string, console.warn and return.
3. **Harden handleParticipantLeft** -- if payload.participant is falsy or userId not a string, console.warn and return; add warn inside no-op branch when userId is present but unknown.
4. **Run pnpm lint and pnpm type-check** -- fix all errors.
5. **Write hook tests** -- cover every edge case in section 5.

---

## 7. Implementation Order

1. Harden handleParticipantsList with array type guard
2. Harden handleParticipantJoined with participant and userId existence guard
3. Harden handleParticipantLeft with participant and userId existence guard; add warn to no-op branch
4. Run pnpm lint and pnpm type-check; fix all errors
5. Write hook tests covering every edge case

---

## 8. Task Breakdown

**Frontend**

- [ ] Guard handleParticipantsList: if not Array.isArray(payload.participants), console.warn and return
- [ ] Guard handleParticipantJoined: if payload.participant is falsy or typeof payload.participant.userId is not string, console.warn and return
- [ ] Guard handleParticipantLeft: if payload.participant is falsy or typeof payload.participant.userId is not string, console.warn and return
- [ ] Add console.warn in handleParticipantLeft no-op branch when userId is valid but not found in map

**Shared / Cross-cutting**

- [ ] Run pnpm lint and pnpm type-check with no errors

**Testing**

- [ ] Hook test: participants-list with valid payload replaces entire participant map
- [ ] Hook test: participants-list with non-array participants field is a no-op (map unchanged)
- [ ] Hook test: participant-joined adds new participant to map
- [ ] Hook test: second participant-joined for same userId does not add a duplicate
- [ ] Hook test: participant-joined with missing participant field is a no-op
- [ ] Hook test: participant-joined with missing userId is a no-op
- [ ] Hook test: participant-left removes participant from map
- [ ] Hook test: participant-left for unknown userId does not throw or mutate state
- [ ] Hook test: participant-left with missing participant field is a no-op
- [ ] Hook test: all three event listeners are removed on unmount
- [ ] Hook test: participantMap resets to empty on socket teardown (cleanup)
- [ ] Hook test: after socket restored (simulate reconnect), watch-meeting is re-emitted
