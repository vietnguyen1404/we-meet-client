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
  DISCONNECTED: 'disconnected',
} as const;

export type SocketConnectionStatus = (typeof SOCKET_STATUS)[keyof typeof SOCKET_STATUS];

export interface UseMeetingSocketReturn {
  isConnected: boolean;
  connectionStatus: SocketConnectionStatus;
  error: string | null;
  socket: Socket | null;
}

export interface ParticipantInfo {
  userId: string;
  name: string;
  socketId: string;
  /** Arrives as a string over WebSocket JSON; may be a Date when constructed locally. */
  joinedAt: string | Date;
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
  participants: MeetingMember[];
  participantCount: number;
}
