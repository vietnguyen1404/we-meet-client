export { StartMeetingPage } from './components/startMeetingPage';
export { MeetingLobbyPage } from './components/meetingLobbyPage';
export { ParticipantList } from './components/ParticipantList';
export { LocalVideoPreview } from './components/LocalVideoPreview';

export { meetingsApi } from './services/meetingService';
export { getMeetingSocket, destroyMeetingSocket } from './services/socket';
export { useMeetingSocket, useParticipants, useLocalMedia } from './hooks';

export { SOCKET_STATUS } from './types/meeting.types';

export type {
  Meeting,
  MeetingMember,
  CreateMeetingRequest,
  JoinMeetingResponse,
  GetMeetingResponse,
  MeetingLobbyData,
  ApiError,
  SocketConnectionStatus,
  UseMeetingSocketReturn,
  ParticipantInfo,
  ParticipantJoinedPayload,
  ParticipantLeftPayload,
  ParticipantsListPayload,
  WatchMeetingPayload,
  JoinRoomPayload,
  UseParticipantsReturn,
  UseLocalMediaReturn,
} from './types/meeting.types';
