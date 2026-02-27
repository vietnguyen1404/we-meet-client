/**
 * Meeting role constants
 * Centralized role values to prevent magic strings
 */
export const MEETING_ROLE = {
  HOST: 'HOST',
  PARTICIPANT: 'PARTICIPANT',
} as const;

export type MeetingRole = (typeof MEETING_ROLE)[keyof typeof MEETING_ROLE];
