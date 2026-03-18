export const MeetingPhase = {
  PRE_JOIN: 'PRE_JOIN',
  JOINING: 'JOINING',
  IN_CALL: 'IN_CALL',
} as const;

export type MeetingPhase = (typeof MeetingPhase)[keyof typeof MeetingPhase];

export const MeetingPhaseFlags = {
  isPreJoin: (phase: MeetingPhase | string) => phase === MeetingPhase.PRE_JOIN,
  isJoining: (phase: MeetingPhase | string) => phase === MeetingPhase.JOINING,
  isInCall: (phase: MeetingPhase | string) => phase === MeetingPhase.IN_CALL,
};

export default MeetingPhaseFlags;
