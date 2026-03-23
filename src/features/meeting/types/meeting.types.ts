import type { Socket } from 'socket.io-client';

export type { MeetingPhase } from '@/shared/constants/meeting';

export interface Meeting {
  id: string;
  title: string;
  hostId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingRequest {
  title?: string;
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
  /** Connect the socket. Resolves when the `connect` event fires. */
  connect: () => Promise<void>;
  /** Emit join-room to enter the video call room */
  joinRoom: () => void;
  /** Emit leave-room, disconnect, and reset state */
  leaveRoom: () => void;
  /** True while an automatic reconnect backoff is in progress */
  isReconnecting: boolean;
  /** The current reconnect attempt number (1-based, resets to 0 on success) */
  reconnectAttempt: number;
  /** Emit watch-meeting to observe presence in the lobby without joining the call */
  watchMeeting: () => void;
}

export interface ParticipantInfo {
  socketId: string;
  userId: string;
  name: string;
  isHost: boolean;
  joinedAt: number;
  /** Reflects the remote participant's camera state, driven by signaling. Defaults to true (server assumes camera ON on join). */
  isVideoEnabled: boolean;
  /** Reflects the remote participant's microphone state, driven by signaling. Defaults to true (server assumes mic ON on join). */
  isAudioEnabled: boolean;
}

export interface ParticipantMediaStatePayload {
  meetingId: string;
  userId: string;
  video: boolean;
  audio: boolean;
}

/** Client → Server: join the active video call */
export interface JoinRoomPayload {
  meetingId: string;
}

/** Client → Server: leave the active video call */
export interface LeaveRoomPayload {
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
  toggleAudio: () => void;
  toggleVideo: () => Promise<void>;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  videoSendersRef: { current: Set<RTCRtpSender> };
  audioSendersRef: { current: Set<RTCRtpSender> };
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

export interface VideoTile {
  peerId: string;
  stream: MediaStream | null;
  label: string;
  isMuted?: boolean;
  isCameraOff?: boolean;
  isLocal?: boolean;
}

export interface UseRemoteStreamsReturn {
  remoteStreams: Map<string, MediaStream>;
  /** Add or update a remote stream directly, bypassing the peerStatuses effect */
  addStream: (peerId: string, stream: MediaStream) => void;
}
