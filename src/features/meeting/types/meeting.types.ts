import type { MeetingRole } from '@/shared';

// Meeting member/participant
export interface MeetingMember {
  id: string;
  userId: string;
  userName: string;
  role: MeetingRole;
  joinedAt: string;
}

// Meeting entity
export interface Meeting {
  id: string;
  title: string;
  hostId: string;
  members: MeetingMember[];
  createdAt: string;
  status: 'active' | 'ended';
}

// API Request/Response types
export interface CreateMeetingRequest {
  title?: string;
}

export interface JoinMeetingRequest {
  meetingId: string;
}

export interface JoinMeetingResponse {
  meeting: Meeting;
}

export interface GetMeetingResponse {
  meeting: Meeting;
}

// Derived types for UI
export interface MeetingLobbyData {
  meeting: Meeting;
  currentUserRole: MeetingRole;
  isHost: boolean;
}

// Error types
export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

// Socket types
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
}
