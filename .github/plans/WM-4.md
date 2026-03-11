# WM-4: Add Socket Reconnect Logic and Meeting State Resilience

---

## 1. Feature Summary

This feature adds automatic reconnect logic to the `useMeetingSocket` hook so that transient network drops during a meeting are recovered without a page reload. Up to 5 reconnect attempts are made using exponential backoff, and on a successful reconnect the server subscription (`watch-meeting`) is automatically re-established by resetting the exposed `socket` state, which re-triggers `useParticipants`. New state fields (`isReconnecting`, `reconnectAttempt`) are exposed so the UI can surface a non-blocking reconnecting indicator.

---

## 2. Problem Statement

`useMeetingSocket` (WM-2) establishes a single connection with no recovery path. When a participant experiences a transient network drop, the socket fires a `disconnect` event and the participant silently loses all real-time presence updates. There is no attempt to reconnect and no visible feedback -- until the page is manually refreshed, the participant list is stale and no further events arrive. This blocks the core real-time meeting experience for any participant on an unstable network.

---

## 3. Feature Type

**Feature Type:** Frontend

All changes are confined to the client-side hook layer (`useMeetingSocket`) and its types; no backend gateway code is modified.

---

## 4. Technical Design

### Frontend

**Files to modify:**
- `src/features/meeting/types/meeting.types.ts` -- add `RECONNECTING` to `SOCKET_STATUS`; add `isReconnecting: boolean` and `reconnectAttempt: number` to `UseMeetingSocketReturn`.
- `src/features/meeting/hooks/useMeetingSocket.ts` -- implement reconnect loop, unmount guard, and `socket` state reset on reconnect.
- `src/features/meeting/components/meetingLobbyPage.tsx` -- consume `isReconnecting` to show a non-blocking reconnecting notice.
- `src/lib/i18n/locales/en.json` -- add `socketReconnecting` key.

**Reconnect algorithm inside `useMeetingSocket`:**

Three new refs are added to the existing `useEffect`:

- `isUnmountedRef` (`useRef<boolean>`, default `false`) -- set to `true` in cleanup before `destroyMeetingSocket()` is called. Every async timeout callback checks this flag on entry.
- `reconnectTimerRef` (`useRef<ReturnType<typeof setTimeout> | null>`, default `null`) -- holds the pending backoff timer; cleared on unmount or on successful connect.
- `reconnectAttemptRef` (`useRef<number>`, default `0`) -- tracks attempt count without causing re-renders between ticks.

**Reconnect flow:**

1. On `disconnect` event (signature: `(reason: string)`): if `reason === "io client disconnect"` return early. Otherwise: set `connectionStatus` to `reconnecting`, `isReconnecting` to `true`, `socket` state to `null`, then call `scheduleReconnect(reconnectAttemptRef.current)`.
2. `scheduleReconnect(attempt)` inner function: if `attempt >= MAX_RECONNECT_ATTEMPTS` (5), set `connectionStatus` to `error`, `isReconnecting` to `false`, stop. Guard double-scheduling: if `reconnectTimerRef.current !== null` return. Set `reconnectAttempt` state to `attempt + 1`. Store `setTimeout` result in `reconnectTimerRef`. Delay: `Math.min(Math.pow(2, attempt) * 1000, 30000)` ms (1s, 2s, 4s, 8s, 16s). Inside the timeout: check `isUnmountedRef.current`; if true exit; otherwise clear `reconnectTimerRef`, increment `reconnectAttemptRef.current`, call `sock.connect()`.
3. On `connect` event (also fires after a successful reconnect): clear `reconnectTimerRef`, reset `reconnectAttemptRef.current` to `0`, set `reconnectAttempt` state to `0`, set `isReconnecting` to `false`, set `connectionStatus` to `connected`, set `socket` state to `sock`. Resetting `socket` state re-triggers the `useParticipants` effect (deps `[socket, meetingId]`), which re-emits `watch-meeting` automatically -- no extra logic needed in `useMeetingSocket`.
4. On unmount cleanup: set `isUnmountedRef.current = true`, call `clearTimeout(reconnectTimerRef.current ?? undefined)`, then the existing `destroyMeetingSocket()` and state resets.

### State Management

- `isReconnecting: boolean` state (`useState(false)`) -- drives the loading indicator in `meetingLobbyPage`.
- `reconnectAttempt: number` state (`useState(0)`) -- allows UI to display attempt count if needed in future.
- `socket` state is already present in `useMeetingSocket` from WM-3. Setting it to `null` during reconnect and restoring it after success reuses the existing pattern to re-trigger `useParticipants`. No new state management layer is needed.

### Realtime / External Services

- `watch-meeting` re-emission is handled automatically: `useParticipants` emits it when its effect re-runs after `socket` state is restored (from `null` to the socket instance).
- No new socket events are consumed or emitted by this feature.

---

## 7. Edge Cases

- **Unmount during pending backoff timeout:** `isUnmountedRef.current` is `true` in cleanup. The timeout callback checks this flag at entry and exits without calling `sock.connect()`.
- **`disconnect` reason is `"io client disconnect"`:** Intentional disconnect triggered by cleanup calling `sock.disconnect()`. Skip the reconnect loop entirely.
- **`connect_error` during the reconnect window:** Do not call `scheduleReconnect` from `handleConnectError` -- socket.io emits `disconnect` after a failed connect attempt, which drives the retry loop. Avoids double-scheduling.
- **Successful reconnect before max attempts:** `handleConnect` fires, clears `reconnectTimerRef`, resets `reconnectAttemptRef.current` to `0`, and restores `socket` state.
- **Max attempts exhausted, page still open:** `connectionStatus` is `error`, `isReconnecting` is `false`. The existing socket error notice in `meetingLobbyPage` covers this state. User must manually refresh.
- **Network comes back after max attempts are exhausted:** Not handled in this issue -- no automatic recovery after `MAX_RECONNECT_ATTEMPTS` failures. A future issue can add a manual retry button.
- **`meetingId` changes while reconnecting:** `useEffect` cleanup runs, sets `isUnmountedRef.current = true`, clears the pending timer. A fresh effect starts for the new `meetingId`, resetting all state.
- **Token expires during reconnect window:** The reconnect and reuses the original token embedded in the socket auth at handshake time. If auth fails, `connect_error` fires and the attempt counts toward max. Token refresh is out of scope.
- **Multiple rapid disconnect events:** `scheduleReconnect` guards against double-scheduling: if `reconnectTimerRef.current !== null`, return immediately.

---

## 8. Implementation Plan

1. **Extend types** -- add `RECONNECTING: "reconnecting"` to `SOCKET_STATUS` in `meeting.types.ts`. Add `isReconnecting: boolean` and `reconnectAttempt: number` to `UseMeetingSocketReturn`.
2. **Add reconnect state** -- add `isReconnecting` (`useState(false)`) and `reconnectAttempt` (`useState(0)`) inside `useMeetingSocket`.
3. **Add reconnect refs** -- add `isUnmountedRef` (`useRef<boolean>(false)`), `reconnectTimerRef` (`useRef<ReturnType<typeof setTimeout> | null>(null)`), and `reconnectAttemptRef` (`useRef<number>(0)`) inside `useMeetingSocket`. Define `MAX_RECONNECT_ATTEMPTS = 5` at module level.
4. **Implement `scheduleReconnect`** -- define as an inner function inside the `useEffect` callback. Guard on unmount (`isUnmountedRef.current`), double-scheduling (`reconnectTimerRef.current !== null`), and max attempts. Use `setTimeout` with exponential backoff delay `Math.min(Math.pow(2, attempt) * 1000, 30000)`.
5. **Update `handleDisconnect`** -- add `reason: string` parameter. Return early when `reason === "io client disconnect"`. For unexpected disconnects: set `connectionStatus` to `reconnecting`, `isReconnecting` to `true`, `socket` to `null`, call `scheduleReconnect(reconnectAttemptRef.current)`.
6. **Update `handleConnect`** -- add reset logic at the start: call `clearTimeout` on `reconnectTimerRef.current`, set `reconnectTimerRef.current = null`, reset `reconnectAttemptRef.current` to `0`, set `reconnectAttempt` state to `0`, set `isReconnecting` to `false`.
7. **Update `useEffect` cleanup** -- set `isUnmountedRef.current = true` as the first line; then `clearTimeout(reconnectTimerRef.current ?? undefined)` and `reconnectTimerRef.current = null`; then the existing `destroyMeetingSocket()` and state resets.
8. **Update return value** -- add `isReconnecting` and `reconnectAttempt` to the hook return object.
9. **Update `meetingLobbyPage`** -- destructure `isReconnecting` from `useMeetingSocket(id)`. When `isReconnecting` is `true`, render a non-blocking inline notice using the existing `Text` component and the `socketReconnecting` i18n key, positioned similarly to the existing error notice.
10. **Add i18n key** -- add `"socketReconnecting": "Connection lost. Reconnecting..."` under `meeting.lobby` in `src/lib/i18n/locales/en.json`.
11. **Lint and type-check** -- run `pnpm lint && pnpm type-check`; fix all errors before marking complete.

---

## 9. Implementation Order

1. Add `RECONNECTING` to `SOCKET_STATUS` and extend `UseMeetingSocketReturn` in `meeting.types.ts`
2. Add `isReconnecting` and `reconnectAttempt` `useState` inside `useMeetingSocket`
3. Add `isUnmountedRef`, `reconnectTimerRef`, and `reconnectAttemptRef` `useRef` declarations inside `useMeetingSocket`
4. Define `MAX_RECONNECT_ATTEMPTS = 5` constant at module level in `useMeetingSocket.ts`
5. Implement `scheduleReconnect(attempt: number)` inner function inside the `useEffect`
6. Update `handleDisconnect` to accept `reason: string` and start the reconnect loop on unexpected disconnects
7. Update `handleConnect` to reset reconnect state on successful connection
8. Update `useEffect` cleanup to set `isUnmountedRef.current = true` and clear timer before `destroyMeetingSocket()`
9. Add `isReconnecting` and `reconnectAttempt` to the `useMeetingSocket` return value
10. Destructure `isReconnecting` in `meetingLobbyPage.tsx` and render non-blocking reconnecting notice
11. Add `socketReconnecting` key to `src/lib/i18n/locales/en.json`
12. Run `pnpm lint && pnpm type-check`; resolve all errors

---

## 10. Task Breakdown

**Frontend**

- [ ] Add `RECONNECTING: "reconnecting"` to `SOCKET_STATUS` in `meeting.types.ts`
- [ ] Add `isReconnecting: boolean` field to `UseMeetingSocketReturn` in `meeting.types.ts`
- [ ] Add `reconnectAttempt: number` field to `UseMeetingSocketReturn` in `meeting.types.ts`
- [ ] Define `MAX_RECONNECT_ATTEMPTS = 5` constant at module level in `useMeetingSocket.ts`
- [ ] Add `isReconnecting` state (`useState(false)`) inside `useMeetingSocket`
- [ ] Add `reconnectAttempt` state (`useState(0)`) inside `useMeetingSocket`
- [ ] Add `isUnmountedRef` (`useRef<boolean>(false)`) inside `useMeetingSocket`
- [ ] Add `reconnectTimerRef` (`useRef<ReturnType<typeof setTimeout> | null>(null)`) inside `useMeetingSocket`
- [ ] Add `reconnectAttemptRef` (`useRef<number>(0)`) inside `useMeetingSocket`
- [ ] Implement `scheduleReconnect(attempt: number)` inside `useEffect`: exponential backoff, unmount guard, double-schedule guard, max attempts check
- [ ] Update `handleDisconnect` to accept `reason: string`; return early for `"io client disconnect"`
- [ ] On unexpected disconnect: set `connectionStatus` to `reconnecting`, `isReconnecting` to `true`, `socket` to `null`, call `scheduleReconnect`
- [ ] Update `handleConnect`: clear `reconnectTimerRef`, reset `reconnectAttemptRef.current` to `0`, reset `reconnectAttempt` state to `0`, set `isReconnecting` to `false`
- [ ] Update cleanup: set `isUnmountedRef.current = true` as first line; `clearTimeout(reconnectTimerRef.current ?? undefined)` before `destroyMeetingSocket()`
- [ ] Add `isReconnecting` and `reconnectAttempt` to `useMeetingSocket` return statement
- [ ] Destructure `isReconnecting` from `useMeetingSocket(id)` in `meetingLobbyPage.tsx`
- [ ] Render non-blocking `socketReconnecting` notice in `meetingLobbyPage.tsx` when `isReconnecting === true`
- [ ] Add `"socketReconnecting": "Connection lost. Reconnecting..."` to `meeting.lobby` in `src/lib/i18n/locales/en.json`

**Testing**

- [ ] Hook test: does NOT enter reconnect loop when `disconnect` reason is `"io client disconnect"`
- [ ] Hook test: sets `isReconnecting` to `true` and `connectionStatus` to `"reconnecting"` on unexpected disconnect
- [ ] Hook test: calls `sock.connect()` after correct backoff delay (attempt 0 ==> 1s, attempt 1 ==> 2s)
- [ ] Hook test: resets `isReconnecting` to `false`, `reconnectAttempt` to `0`, and `connectionStatus` to `"connected"` on successful reconnect
- [ ] Hook test: sets `connectionStatus` to `"error"` after `MAX_RECONNECT_ATTEMPTS` failed attempts and stops retrying
- [ ] Hook test: does NOT call `sock.connect()` after unmount (timer is cancelled)
- [ ] Hook test: does not schedule a second timer if one is already pending (double-schedule guard)
- [ ] Component test: renders `socketReconnecting` notice when `isReconnecting` prop is `true`
- [ ] Component test: does not render `socketReconnecting` notice when `isReconnecting` is `false`
