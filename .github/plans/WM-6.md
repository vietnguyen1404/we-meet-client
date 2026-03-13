# WM-6: Implement Local Media Capture for Meeting Room

---

## 1. Feature Summary

This feature adds a useLocalMedia hook that requests camera and microphone access via navigator.mediaDevices.getUserMedia, manages the resulting MediaStream lifecycle, and renders a local self-preview video element in the meeting lobby. It provides the foundational media layer that future WebRTC peer connection work will build upon.

---

## 2. Problem Statement

The meeting lobby currently shows a Coming Soon placeholder where the video area will be. Before any WebRTC peer connection can be established, the frontend must acquire a local MediaStream. Without this layer, participants cannot preview their own camera, no audio/video can be sent, and the UI provides no feedback about media device availability. This issue replaces the placeholder with a live local camera preview and a robust permission-error experience.

---

## 3. Feature Type

**Feature Type:** Frontend

All changes are browser-side: a custom hook using the MediaDevices API, a self-preview component, and integration into the existing MeetingLobbyPage. No backend code is modified.

---

## 4. Technical Design

### Frontend

**New files:**
- src/features/meeting/hooks/useLocalMedia.ts -- custom hook that calls getUserMedia, manages stream state, and stops all tracks on unmount.
- src/features/meeting/components/LocalVideoPreview.tsx -- pure display component that receives stream, isLoading, and error as props and renders the video element.

**Files to modify:**
- src/features/meeting/types/meeting.types.ts -- add UseLocalMediaReturn interface.
- src/features/meeting/hooks/index.ts -- export useLocalMedia.
- src/features/meeting/index.ts -- export useLocalMedia and LocalVideoPreview.
- src/features/meeting/components/meetingLobbyPage.tsx -- replace the Coming Soon card with LocalVideoPreview.
- src/lib/i18n/locales/en.json -- add meeting.lobby.mediaPermissionDenied, mediaDeviceNotFound, mediaLoading, mediaError.

**Hook design -- useLocalMedia():**

Returns: UseLocalMediaReturn = { stream: MediaStream | null, isLoading: boolean, error: string | null }

Lifecycle:
1. On mount: set isLoading = true; call navigator.mediaDevices.getUserMedia({ video: true, audio: true }).
2. On success: store MediaStream in useState; set isLoading = false.
3. On error: inspect err.name: NotAllowedError/PermissionDeniedError -> mediaPermissionDenied; NotFoundError/DevicesNotFoundError -> mediaDeviceNotFound; others -> mediaError. Set isLoading = false.
4. Cleanup: call stream.getTracks().forEach(track => track.stop()) to release hardware.

Use an isMountedRef (useRef<boolean>(true), set to false in cleanup) to guard against setState after unmount.
The MediaStream is returned as-is so it can be passed directly to RTCPeerConnection.addTrack().

**Component design -- LocalVideoPreview:**

Props:
  stream: MediaStream | null
  isLoading: boolean
  error: string | null

- Uses useRef<HTMLVideoElement>(null).
- useEffect keyed on stream: when stream is non-null, set videoRef.current.srcObject = stream.
- video element must have autoPlay, playsInline, and muted attributes.
- Apply scale-x-[-1] Tailwind class for selfie mirroring.
- Loading: SpinnerIcon + t(meeting.lobby.mediaLoading) centred in card.
- Error: AlertTriangleIcon + error text (same inline banner pattern as socketError in MeetingLobbyPage).
- Active: video element fills the card.

**Integration into MeetingLobbyPage:**
- Call useLocalMedia() at top of MeetingLobbyPage.
- Replace the existing Coming Soon card inside lg:col-span-2 with LocalVideoPreview passing stream, isLoading, error.

### State Management

- useLocalMedia manages its own stream, isLoading, and error via useState.
- No Zustand store needed -- media state is scoped to the meeting page lifetime.
- MediaStream held in state (not ref) so consumers re-render when it becomes available.

### Performance Considerations

- getUserMedia is called exactly once on mount (empty dependency array); no re-requests on re-renders.
- Track cleanup on unmount ensures no lingering hardware access after leaving the page.

---

## 5. UI Architecture

**Screen:** Meeting Room (Stitch screen: Meeting Room)

The Stitch Meeting Room design shows a full-page layout with a large video tile area (left/centre), a participant sidebar (right), and a bottom media controls bar. WM-6 concerns the local video tile only -- the rest of the layout is out of scope.

**Component Tree (WM-6 scope):**

MeetingLobbyPage
  Header (existing)
  Notices (reconnecting / socket error -- existing)
  main
    grid grid-cols-1 lg:grid-cols-3
      div lg:col-span-2
        Meeting Details card (existing)
        LocalVideoPreview            -- replaces the Coming Soon card
          loading: SpinnerIcon + Text
          error: AlertTriangleIcon + Text
          active: video autoPlay playsInline muted scale-x-[-1]
      div lg:col-span-1
        ParticipantList (existing)

**UI States:**

| State | Trigger | Component behaviour |
| --- | --- | --- |
| Loading | isLoading === true | SpinnerIcon + mediaLoading text centred in card |
| Permission denied | NotAllowedError | AlertTriangleIcon + mediaPermissionDenied text |
| Device not found | NotFoundError | AlertTriangleIcon + mediaDeviceNotFound text |
| Generic error | Other getUserMedia error | AlertTriangleIcon + mediaError text |
| Active | stream !== null | Mirrored video fills the card |

**Interaction Flows:**

1. User enters meeting lobby -> useLocalMedia mounts -> browser permission prompt appears.
2. User grants permission -> stream acquired -> spinner replaced by live camera video (mirrored).
3. User denies permission -> error state shown inline -> lobby remains functional.
4. User clicks Leave or navigates away -> cleanup stops all tracks -> camera indicator turns off.

---

## 6. Edge Cases

- **navigator.mediaDevices is undefined** -- old browsers or HTTP origins. Guard with conditional check; set generic error; do not throw.
- **NotAllowedError** -- user denied permission. Show mediaPermissionDenied message; do not retry automatically.
- **NotFoundError** -- no camera or microphone detected. Show mediaDeviceNotFound message; do not crash.
- **OverconstrainedError** -- requested constraints cannot be satisfied. Treat as generic error; console.warn.
- **Unmount before getUserMedia resolves** -- isMountedRef guard prevents setState call; cleanup stops any arriving tracks immediately.
- **stream arrives then component unmounts** -- cleanup effect runs; tracks stopped even if stream arrived late.
- **Multiple renders before stream arrives** -- useEffect runs once (empty deps); isLoading stays true until promise settles.
- **Safari autoPlay restriction** -- muted attribute is required; already covered by required video attributes.


---

## 7. Implementation Plan

1. **Add UseLocalMediaReturn type** to meeting.types.ts.
2. **Implement useLocalMedia hook** in src/features/meeting/hooks/useLocalMedia.ts. Use useState for stream, isLoading, error. Use isMountedRef guard. Call getUserMedia inside useEffect(fn, []). Map error names to i18n translation keys. Stop all tracks in cleanup.
3. **Export useLocalMedia** from src/features/meeting/hooks/index.ts.
4. **Create LocalVideoPreview component** in src/features/meeting/components/LocalVideoPreview.tsx. Accept stream, isLoading, error as props. Use videoRef. Attach stream to videoRef.current.srcObject in useEffect keyed on stream. Render loading / error / active states using existing icon and Text patterns.
5. **Update MeetingLobbyPage** to call useLocalMedia() and pass return values to LocalVideoPreview, replacing the Coming Soon card.
6. **Update barrel exports** in hooks/index.ts and features/meeting/index.ts.
7. **Add i18n keys** for mediaLoading, mediaPermissionDenied, mediaDeviceNotFound, mediaError under meeting.lobby in en.json.
8. **Run pnpm lint and pnpm type-check** and fix all errors.

---

## 8. Implementation Order

1. Add UseLocalMediaReturn interface to src/features/meeting/types/meeting.types.ts
2. Implement src/features/meeting/hooks/useLocalMedia.ts
3. Export useLocalMedia from src/features/meeting/hooks/index.ts
4. Create src/features/meeting/components/LocalVideoPreview.tsx
5. Replace Coming Soon card in meetingLobbyPage.tsx with LocalVideoPreview; wire useLocalMedia() at top
6. Export useLocalMedia and LocalVideoPreview from src/features/meeting/index.ts
7. Add meeting.lobby.mediaLoading, mediaPermissionDenied, mediaDeviceNotFound, mediaError to en.json
8. Run pnpm lint and pnpm type-check; fix all errors

---

## 9. Task Breakdown

**Frontend**

- [ ] Add UseLocalMediaReturn interface to src/features/meeting/types/meeting.types.ts
- [ ] Create src/features/meeting/hooks/useLocalMedia.ts with getUserMedia lifecycle, isMountedRef guard, and track cleanup
- [ ] Map NotAllowedError and PermissionDeniedError to meeting.lobby.mediaPermissionDenied in hook
- [ ] Map NotFoundError and DevicesNotFoundError to meeting.lobby.mediaDeviceNotFound in hook
- [ ] Guard navigator.mediaDevices absence with generic error state
- [ ] Export useLocalMedia from src/features/meeting/hooks/index.ts
- [ ] Create src/features/meeting/components/LocalVideoPreview.tsx with loading / error / active states
- [ ] Set srcObject = stream in useEffect keyed on stream inside LocalVideoPreview
- [ ] Apply autoPlay playsInline muted and scale-x-[-1] to video element
- [ ] Replace Coming Soon card in meetingLobbyPage.tsx with LocalVideoPreview
- [ ] Call useLocalMedia() at top of MeetingLobbyPage and pass props to LocalVideoPreview
- [ ] Export useLocalMedia and LocalVideoPreview from src/features/meeting/index.ts

**Shared / Cross-cutting**

- [ ] Add meeting.lobby.mediaLoading key to src/lib/i18n/locales/en.json
- [ ] Add meeting.lobby.mediaPermissionDenied key to src/lib/i18n/locales/en.json
- [ ] Add meeting.lobby.mediaDeviceNotFound key to src/lib/i18n/locales/en.json
- [ ] Add meeting.lobby.mediaError key to src/lib/i18n/locales/en.json
- [ ] Run pnpm lint and pnpm type-check with no errors

**Testing**

- [ ] Hook test: sets isLoading true on mount then false after getUserMedia resolves
- [ ] Hook test: returns stream when getUserMedia resolves successfully
- [ ] Hook test: sets error to mediaPermissionDenied key on NotAllowedError
- [ ] Hook test: sets error to mediaDeviceNotFound key on NotFoundError
- [ ] Hook test: sets error to generic mediaError key on unrecognised error name
- [ ] Hook test: stops all tracks on unmount
- [ ] Hook test: does not call setState after unmount (isMountedRef guard)
- [ ] Component test: renders SpinnerIcon while isLoading is true
- [ ] Component test: renders error text when error is set
- [ ] Component test: renders video element when stream is non-null
- [ ] Component test: sets videoRef.current.srcObject to stream
