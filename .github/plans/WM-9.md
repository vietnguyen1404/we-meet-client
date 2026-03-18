# WM-9: Implement Meeting Room Media UI with Video Grid and Controls

---

## 1. Feature Summary

Splits the meeting experience into two stages: a **Lobby Page** (pre-join camera preview and media controls) and a **Meeting Page** (full video grid, remote streams, in-call controls). Adds `useRemoteStreams`, `VideoGrid`, `MediaControls`, and `MeetingPage`. Signaling and peer connections only start after the user clicks **Join Meeting**.

---

## 2. Problem Statement

`MeetingLobbyPage` currently initialises `useMeetingSocket`, `usePeerConnections`, and `useSignaling` on page load before the user decides to join. There is no video grid, no in-call controls, and no remote stream collection hook. This issue introduces the Lobby -> Join -> Meeting flow.

---

## 3. Feature Type

**Feature Type:** Frontend

All work is client-side.

---

## 4. Technical Design

### New files

- `src/features/meeting/hooks/useRemoteStreams.ts`
- `src/features/meeting/components/MediaControls.tsx`
- `src/features/meeting/components/VideoGrid.tsx`
- `src/features/meeting/components/MeetingPage.tsx`

### Files to modify

- `src/features/meeting/components/meetingLobbyPage.tsx` - strip socket/signaling/peer hooks; add MediaControls + Join button
- `src/config/routes.tsx` - add `/meetings/:id/lobby` => MeetingLobbyPage; change `/meetings/:id` => MeetingPage
- `src/features/meeting/components/startMeetingPage.tsx` - both navigate calls: /meetings/${id} => /meetings/${id}/lobby
- `src/features/meeting/types/meeting.types.ts` - add UseRemoteStreamsReturn
- `src/features/meeting/hooks/index.ts` - export useRemoteStreams
- `src/features/meeting/index.ts` - export useRemoteStreams, MediaControls, VideoGrid, MeetingPage
- `src/lib/i18n/locales/en.json` - add meeting.controls.* and meeting.room.* keys

### useRemoteStreams hook

Signature: `useRemoteStreams(getPeerConnection, peerStatuses): UseRemoteStreamsReturn`

Returns `{ remoteStreams: Map<string, MediaStream> }`.

Internal:
- `remoteStreams` via `useState(new Map())`
- `attachedPeersRef` via `useRef(new Set())` to prevent double-attach

Lifecycle: useEffect keyed on [getPeerConnection, peerStatuses]. For each new peerId, call getPeerConnection, attach ontrack, add stream to map. When peerId disappears from peerStatuses, remove from map and attachedPeersRef. Cleanup clears both on unmount.

### MediaControls component

Props: `{ stream: MediaStream | null; onLeave?: () => void; showLeave?: boolean; className?: string }`

State: `isMuted`, `isCameraOff` (useState). Sync initial state from track.enabled in useEffect keyed on stream. Toggle track.enabled on click. Render disabled IconButtons when stream is null.

### VideoGrid component

Props: `tiles: VideoTile[]` where VideoTile = `{ peerId, stream, label, isMuted?, isCameraOff?, isLocal? }`.

Grid cols: 1 tile => grid-cols-1, 2 => grid-cols-2, 3-4 => grid-cols-2. Each tile sets srcObject via useRef/useEffect. Local tile gets muted + scale-x-[-1]. Camera-off => avatar fallback. Muted => MicOffIcon overlay.

### MeetingPage component

Mounts at /meetings/:id. Calls useLocalMedia, useMeetingSocket, useParticipants, usePeerConnections, useSignaling, useRemoteStreams. Builds tiles with useMemo. Renders Header, error/reconnect banners, VideoGrid, MediaControls (bottom bar). Leave => navigate to /meetings/start.

### Refactored MeetingLobbyPage

Removes useMeetingSocket, useParticipants, usePeerConnections, useSignaling. Keeps useLocalMedia + REST fetch + LocalVideoPreview + ParticipantList (REST-seeded). Adds MediaControls below LocalVideoPreview. Adds Join Meeting Button => navigate(/meetings/:id). Button disabled while isLoading.

### State management

useRemoteStreams owns the remoteStreams Map via useState. MediaControls owns isMuted/isCameraOff locally. VideoGrid is pure/display only. All other state (socket, participants, peers, signaling) moves unchanged to MeetingPage.

### Performance

VideoTile sets srcObject via useRef/useEffect (no element re-creation). tiles array built with useMemo. getPeerConnection already useCallback per WM-7.

---

## 5. UI Architecture

**Stitch screen:** Meeting Room (project 11663847807823840375, screen 7f5072c92ce941f090ae1457e2b6f058, desktop 2560x2048). Full-page layout: dark video tile area, fixed bottom media controls bar (mic, camera, leave), optional participant sidebar.

**MeetingPage tree:**
```
MeetingPage
|-- Header (with Leave button)
|-- Notices (reconnect/socket error banners)
+-- main (flex column)
    |-- VideoGrid (flex-1)
    |   |-- VideoTile local: <video muted scale-x-[-1] />
    |   +-- VideoTile remote: <video /> | AvatarFallback + MicOffIcon
    +-- MediaControls (bottom bar)
        |-- IconButton mic toggle
        |-- IconButton camera toggle
        +-- Button Leave
```

**MeetingLobbyPage tree:**
```
MeetingLobbyPage
|-- Header
+-- main
    +-- grid cols-1 lg:cols-3
        |-- col-span-2
        |   |-- Meeting Details card
        |   |-- LocalVideoPreview
        |   |-- MediaControls
        |   +-- Button Join Meeting
        +-- col-span-1: ParticipantList (REST only)
```

**UI States (VideoGrid tiles):**

| State | Trigger | Behaviour |
|---|---|---|
| Camera off | isCameraOff | Avatar initial, no video |
| Active | stream set | Live video |
| Mic muted | isMuted | MicOffIcon overlay |
| Peer left | removed from tiles | Tile disappears |

**Interaction flow:**
1. StartMeetingPage -> navigate(/meetings/:id/lobby)
2. Lobby: request camera/mic, show preview, mic/camera toggles
3. Click Join Meeting -> navigate(/meetings/:id)
4. Meeting: socket connects, join-room emitted, WebRTC starts
5. Remote peer joins -> ontrack fires -> tile in VideoGrid
6. Remote peer leaves -> peerStatuses updated -> tile removed
7. Click Leave -> navigate(/meetings/start) -> all hooks cleanup

---

## 6. Edge Cases

- stream null in MediaControls: disabled buttons, no getAudioTracks call
- Remote stream multiple tracks: use event.streams[0] only
- ontrack fires twice for same peer: attachedPeersRef prevents duplicate attach
- Peer leaves before ontrack: cleanup removes orphan map entry
- VideoGrid 0 remote peers: local tile only (grid-cols-1)
- VideoGrid 4 tiles max: 2x2 grid (mesh cap from usePeerConnections)
- Direct navigation to /meetings/:id without lobby: valid, useLocalMedia triggers permission prompt
- Navigate away mid-call: all hooks cleanup (socket disconnect, peer close, tracks stop)
- peerStatuses entry closed/failed: stream removed from map, tile removed from grid

---

## 7. Implementation Plan

1. Add UseRemoteStreamsReturn to meeting.types.ts
2. Implement useRemoteStreams.ts
3. Export from hooks/index.ts
4. Create MediaControls.tsx
5. Create VideoGrid.tsx
6. Create MeetingPage.tsx
7. Refactor meetingLobbyPage.tsx
8. Update routes.tsx
9. Update startMeetingPage.tsx navigation
10. Update barrel exports
11. Add i18n keys
12. pnpm lint && pnpm type-check

---

## 8. Implementation Order

1. `src/features/meeting/types/meeting.types.ts` - add UseRemoteStreamsReturn
2. `src/features/meeting/hooks/useRemoteStreams.ts` - implement
3. `src/features/meeting/hooks/index.ts` - export
4. `src/features/meeting/components/MediaControls.tsx` - create
5. `src/features/meeting/components/VideoGrid.tsx` - create
6. `src/features/meeting/components/MeetingPage.tsx` - create
7. `src/features/meeting/components/meetingLobbyPage.tsx` - refactor
8. `src/config/routes.tsx` - update
9. `src/features/meeting/components/startMeetingPage.tsx` - update navigate
10. `src/features/meeting/hooks/index.ts` + `src/features/meeting/index.ts` - barrel exports
11. `src/lib/i18n/locales/en.json` - add keys
12. pnpm lint && pnpm type-check

---

## 9. Task Breakdown

### Frontend

- [ ] Add `UseRemoteStreamsReturn` interface to meeting.types.ts
- [ ] Implement useRemoteStreams.ts: ontrack attachment, stream accumulation, cleanup on peer removal and unmount
- [ ] Guard ontrack double-attach via attachedPeersRef
- [ ] Remove stream when peerId disappears from peerStatuses
- [ ] Export useRemoteStreams from hooks/index.ts
- [ ] Create MediaControls.tsx: isMuted/isCameraOff state, sync from stream in useEffect, disabled buttons when stream null
- [ ] Create VideoGrid.tsx: responsive grid, srcObject via ref/effect, muted+mirror for local, avatar fallback, mic-off overlay
- [ ] Create MeetingPage.tsx: all real-time hooks, useMemo tiles, banners, VideoGrid + MediaControls
- [ ] Refactor meetingLobbyPage.tsx: strip socket/peer/signaling hooks, add MediaControls + Join button
- [ ] Disable Join Meeting button while isLoading
- [ ] Add /meetings/:id/lobby => MeetingLobbyPage route
- [ ] Update /meetings/:id => MeetingPage
- [ ] Change startMeetingPage.tsx navigate calls to /meetings/${id}/lobby
- [ ] Barrel exports: useRemoteStreams, MediaControls, VideoGrid, MeetingPage, UseRemoteStreamsReturn

### i18n

- [ ] Add meeting.controls.toggleMic
- [ ] Add meeting.controls.toggleCamera
- [ ] Add meeting.controls.leave
- [ ] Add meeting.room.loadingTitle
- [ ] Add meeting.room.errorDefault
- [ ] Add meeting.lobby.buttonJoin
- [ ] Run pnpm lint && pnpm type-check with no errors

### Tests

- [ ] useRemoteStreams: attaches ontrack for new peerId in peerStatuses
- [ ] useRemoteStreams: adds stream on ontrack event
- [ ] useRemoteStreams: no double-attach for same peerId
- [ ] useRemoteStreams: removes stream when peerId leaves
- [ ] useRemoteStreams: clears state on unmount
- [ ] MediaControls: disabled buttons when stream null
- [ ] MediaControls: toggles isMuted + track.enabled on mic click
- [ ] MediaControls: toggles isCameraOff + track.enabled on camera click
- [ ] MediaControls: renders Leave when showLeave + onLeave provided
- [ ] VideoGrid: correct tile count for 1/2/3/4 entries
- [ ] VideoGrid: muted + mirror only on local tile
- [ ] VideoGrid: avatar fallback when isCameraOff
- [ ] VideoGrid: MicOffIcon when isMuted
- [ ] MeetingLobbyPage: does NOT call useMeetingSocket or usePeerConnections
- [ ] MeetingLobbyPage: renders Join Meeting button when data loaded
- [ ] Join Meeting button navigates to /meetings/:id
