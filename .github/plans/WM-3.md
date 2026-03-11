# WM-3: Implement Realtime Participant List in Meeting Room

---

## 1. Feature Summary

This feature adds a live participant list to the meeting room page. When users join or leave while the page is open, the list updates immediately via WebSocket events (user-joined, user-left) without a page reload. The initial list is seeded from the REST meeting data already fetched on page load.

---

## 2. Problem Statement

The meeting lobby currently shows a static participant list drawn from the initial REST response (meeting.members). Participants who join or leave after page load are invisible until the user refreshes. This blocks the core real-time meeting experience. This issue replaces the static inline rendering with a live, event-driven participant list powered by the socket connection established in WM-2.

---

## 3. Feature Type

**Feature Type:** Frontend

All work is client-side: listening to WebSocket events emitted by the backend gateway, managing participant state in a new hook, and extracting the participant rendering into a reusable ParticipantList component. No API endpoints or backend code are modified.

---

## 4. Technical Design

### Frontend

**Files to create:**
- src/features/meeting/hooks/useParticipants.ts -- custom hook that registers user-joined, user-left, and room-state listeners on the socket and maintains participant state.
- src/features/meeting/components/ParticipantList.tsx -- standalone component rendering the participant list with loading, empty, and populated states.

**Files to modify:**
- src/features/meeting/hooks/useMeetingSocket.ts -- add socket: Socket|null to the return value.
- src/features/meeting/types/meeting.types.ts -- add ParticipantJoinedPayload, ParticipantLeftPayload, RoomStatePayload, UseParticipantsReturn types; extend UseMeetingSocketReturn.
- src/features/meeting/components/meetingLobbyPage.tsx -- replace inline participant rendering with ParticipantList; wire in useParticipants.
- src/features/meeting/hooks/index.ts -- export useParticipants.
- src/features/meeting/index.ts -- export useParticipants and ParticipantList.
- src/lib/i18n/locales/en.json -- add meeting.lobby.participantsLoading key.

**Component: ParticipantList**

Props interface:
  participants: MeetingMember[]
  currentUserId: string | undefined
  isSocketConnected: boolean

States to render:
- Loading / not connected: show a subtle spinner or connecting text row.
- Empty: connected but no participants -- show t(meeting.lobby.participantsEmpty).
- Populated: render each participant row with avatar initial, display name, (You) badge, and host badge, reusing the existing row layout from meetingLobbyPage.tsx.

The component must be a pure display component -- no socket or hook logic inside it.

**Component hierarchy in MeetingLobbyPage:**
MeetingLobbyPage
  div lg:col-span-1
    ParticipantList
      (loading state row)
      (empty state text)
      participant rows
        avatar initial div
        display name + (You) badge
        host badge (conditional)

**UI interactions:**
- Participant rows appear/disappear immediately when socket events fire.
- If the socket disconnects after initial connection, the last known participant list remains visible (not cleared).

### State Management

**useParticipants(socket, initialMembers, currentUserId):**

- Accepts the socket instance returned by the extended useMeetingSocket hook.
- Seeds participants state with initialMembers (the meeting.members array from the REST response) when the effect runs.
- Listens for user-joined: if a participant with that userId is not already in the list, append a MeetingMember-shaped entry built from the payload.
- Listens for user-left: filter out the participant matching userId.
- Listens for room-state (optional): if the backend sends a full participant list, replace the current state with the received list.
- Cleans up all event listeners in the useEffect return.
- Returns { participants: MeetingMember[], participantCount: number }.

State is local to the hook using useState. No Zustand store is introduced because: (a) no Zustand stores exist in the repo yet, (b) participant state is scoped to the meeting page lifetime, and (c) the existing pattern (useMeetingSocket, authContext) uses local state and React Context.

**UseMeetingSocketReturn extension:**

Add socket: Socket|null to the existing interface. Expose it via a useState in useMeetingSocket that is set to the socket instance on connect and reset to null on cleanup, ensuring consumers re-render when the socket becomes available.

### Realtime / External Services

Events consumed from server (no new events emitted by this feature):

| Event | Direction | Payload | When |
| --- | --- | --- | --- |
| user-joined | server to client | { userId, displayName } | Another participant joins the room |
| user-left | server to client | { userId } | A participant leaves the room |
| room-state | server to client | { members: [{ userId, displayName }] } | After join-room is emitted (optional, confirm with backend) |

Confirm the exact payload shapes with the backend gateway owner before implementing. Types in meeting.types.ts must match actual server payloads.

---

## 7. Edge Cases

- **Duplicate user-joined events:** Guard with a userId-based existence check before appending -- do not add the same participant twice.
- **user-left for unknown userId:** No-op silently -- the userId is simply not found in the list.
- **Socket not connected on page load:** Display the static REST-seeded list; realtime updates begin once the socket connects. Do not block rendering on socket state.
- **Socket disconnects mid-session:** Keep the last known participant list visible -- do not clear it. The existing connectionStatus ERROR banner covers the connection loss notice.
- **room-state received before REST data:** Handle by initialising with an empty array and replacing state when room-state fires.
- **waitingmeetingId changes while mounted:** useParticipants effect must reset on socket change (socket becomes null on cleanup, then a new socket is provided).
- **user-left fires for the current user:** Remove them from the list gracefully; page navigation on deliberate leave is handled separately.
- **user-joined payload missing displayName:** Fall back to a placeholder string such as Unknown User rather than crashing.

---

## 8. Implementation Plan

1. **Add new TypeScript types** to meeting.types.ts: ParticipantJoinedPayload, ParticipantLeftPayload, RoomStatePayload, UseParticipantsReturn. Also add socket: Socket|null to UseMeetingSocketReturn.
2. **Extend useMeetingSocket** to return the socket instance. Add a socketState useState that is set to the socket instance after it is created and reset to null in the cleanup return. Return it as socket in UseMeetingSocketReturn.
3. **Implement useParticipants** in src/features/meeting/hooks/useParticipants.ts. Accept socket (Socket|null), initialMembers (MeetingMember[]), and currentUserId (string|undefined). In a useEffect keyed on socket: seed state from initialMembers, register user-joined (dedup by userId), user-left (filter by userId), and room-state (replace list) listeners. Return { participants, participantCount }.
4. **Update hooks/index.ts** to export useParticipants.
5. **Create ParticipantList.tsx** in src/features/meeting/components/. Extract the existing participant row JSX from meetingLobbyPage.tsx into this component. Add the loading state (when isSocketConnected is false, show a connecting indicator). Keep it a pure display component.
6. **Refactor meetingLobbyPage.tsx**: destructure socket from useMeetingSocket(id). Call useParticipants(socket, lobbyData?.meeting.members ?? [], userId). Replace the inline participant block with ParticipantList. Update the participant count heading to use participantCount from useParticipants.
7. **Update src/features/meeting/index.ts** to export useParticipants and ParticipantList.
8. **Add i18n key** participantsLoading: Connecting... under meeting.lobby in en.json.
9. **Run pnpm lint and pnpm type-check** and fix all errors.

---

## 9. Implementation Order

1. Add ParticipantJoinedPayload, ParticipantLeftPayload, RoomStatePayload, UseParticipantsReturn types; extend UseMeetingSocketReturn with socket field
2. Extend useMeetingSocket to expose the socket instance in its return value
3. Implement src/features/meeting/hooks/useParticipants.ts
4. Update src/features/meeting/hooks/index.ts to export useParticipants
5. Create src/features/meeting/components/ParticipantList.tsx
6. Refactor meetingLobbyPage.tsx to use useParticipants and ParticipantList
7. Update src/features/meeting/index.ts to export useParticipants and ParticipantList
8. Add meeting.lobby.participantsLoading key to src/lib/i18n/locales/en.json
9. Run pnpm lint and pnpm type-check; fix all errors

---

## 10. Task Breakdown

**Frontend**

- [ ] Add ParticipantJoinedPayload type to meeting.types.ts
- [ ] Add ParticipantLeftPayload type to meeting.types.ts
- [ ] Add RoomStatePayload type to meeting.types.ts
- [ ] Add UseParticipantsReturn interface to meeting.types.ts
- [ ] Add socket: Socket|null field to UseMeetingSocketReturn in meeting.types.ts
- [ ] Extend useMeetingSocket to track and return the active socket instance
- [ ] Create src/features/meeting/hooks/useParticipants.ts
- [ ] Export useParticipants from src/features/meeting/hooks/index.ts
- [ ] Create src/features/meeting/components/ParticipantList.tsx
- [ ] Replace inline participant block in meetingLobbyPage.tsx with ParticipantList
- [ ] Wire useParticipants(socket, initialMembers, userId) into meetingLobbyPage.tsx
- [ ] Update participant count heading to use participantCount from useParticipants
- [ ] Export useParticipants and ParticipantList from src/features/meeting/index.ts
- [ ] Add participantsLoading: Connecting... to meeting.lobby in en.json

**Testing**

- [ ] Hook test: seeds participant list from initialMembers on mount
- [ ] Hook test: appends participant on user-joined event
- [ ] Hook test: ignores duplicate user-joined for same userId
- [ ] Hook test: removes participant on user-left event
- [ ] Hook test: no-ops on user-left for unknown userId
- [ ] Hook test: replaces list on room-state event
- [ ] Hook test: removes all event listeners on unmount
- [ ] Component test: renders one row per participant
- [ ] Component test: shows loading state when isSocketConnected is false
- [ ] Component test: shows empty state when connected and participants is empty
- [ ] Component test: marks the current user row with (You) badge
