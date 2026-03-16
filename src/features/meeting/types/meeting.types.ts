import type { Socket } from 'socket.io-client';
import type { MeetingRole } from '@/shared';

export interface MeetingMember {
  id: string;
  userId: string;
  userName: string;
  role: MeetingRole;
  joinedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  hostId: string;
  members: MeetingMember[];
  createdAt: string;
  updatedAt: string;
  /** Not returned by the backend — frontend-only field, treat as undefined unless set locally */
  status?: 'active' | 'ended';
}

export interface CreateMeetingRequest {
  title?: string;
}

export interface JoinMeetingRequest {
  meetingId: string;
}

export type JoinMeetingResponse = Meeting;

export type GetMeetingResponse = Meeting;

export interface MeetingLobbyData {
  meeting: Meeting;
  currentUserRole: MeetingRole;
  isHost: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

export const SOCKET_STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
  RECONNECTING: 'reconnecting',
} as const;

export type SocketConnectionStatus = (typeof SOCKET_STATUS)[keyof typeof SOCKET_STATUS];

export interface UseMeetingSocketReturn {
  isConnected: boolean;
  connectionStatus: SocketConnectionStatus;
  error: string | null;
  socket: Socket | null;
  /** Emit join-room to promote from lobby watcher to video call participant */
  joinRoom: () => void;
  /** True while an automatic reconnect backoff is in progress */
  isReconnecting: boolean;
  /** The current reconnect attempt number (1-based, resets to 0 on success) */
  reconnectAttempt: number;
}

export interface ParticipantInfo {
  socketId: string;
  userId: string;
  name: string;
  /** Unix timestamp (Date.now()) as documented in socket-signaling.md */
  joinedAt: number;
}

/** Client → Server: subscribe to lobby presence without joining the video call */
export interface WatchMeetingPayload {
  meetingId: string;
}

/** Client → Server: join the active video call */
export interface JoinRoomPayload {
  meetingId: string;
}

export interface ParticipantJoinedPayload {
  meetingId: string;
  participant: ParticipantInfo;
}

export interface ParticipantLeftPayload {
  meetingId: string;
  participant: ParticipantInfo;
}

export interface ParticipantsListPayload {
  meetingId: string;
  participants: ParticipantInfo[];
}

export interface UseParticipantsReturn {
  participants: ParticipantInfo[];
  participantCount: number;
}

export interface UseLocalMediaReturn {
  stream: MediaStream | null;
  isLoading: boolean;
  error: string | null;
}

export type PeerConnectionStatus =
  | 'new'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed'
  | 'closed';

export interface UsePeerConnectionsReturn {
  createPeerConnection: (peerId: string) => RTCPeerConnection | null;
  closePeerConnection: (peerId: string) => void;
  getPeerConnection: (peerId: string) => RTCPeerConnection | undefined;
  peerStatuses: Record<string, PeerConnectionStatus>;
  peerCount: number;
}

/** Received when a remote peer relays an SDP offer */
export interface OfferPayload {
  fromSocketId: string;
  payload: { type: 'offer'; sdp: string };
}

/** Received when a remote peer relays an SDP answer */
export interface AnswerPayload {
  fromSocketId: string;
  payload: { type: 'answer'; sdp: string };
}

/** Received when a remote peer relays an ICE candidate */
export interface IceCandidatePayload {
  fromSocketId: string;
  payload: { candidate: string; sdpMid: string | null; sdpMLineIndex: number | null };
}

export interface UseSignalingReturn {
  /** True while at least one peer negotiation offer/answer round-trip is in flight */
  isNegotiating: boolean;
  /** Per-peer error messages; null means no error for that peer */
  negotiationErrors: Record<string, string | null>;
}
