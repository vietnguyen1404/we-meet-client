import { httpClient } from '@/lib/api';
import type { CreateMeetingRequest, ApiError, Meeting } from '../types/meeting.types';

/**
 * API Service for Meeting operations
 * Handles all HTTP requests to backend meeting endpoints
 */
export const meetingsApi = {
  /**
   * Create a new meeting
   * POST /meetings
   */
  createMeeting: async (data: CreateMeetingRequest): Promise<Meeting> => {
    try {
      const response = await httpClient.post<Meeting>('/meetings', data);
      return response.data;
    } catch (error: unknown) {
      throw handleApiError(error);
    }
  },

  /**
   * Get meeting details
   * GET /meetings/:id
   */
  getMeeting: async (meetingId: string): Promise<Meeting> => {
    try {
      const response = await httpClient.get<Meeting>(`/meetings/${meetingId}`);
      return response.data;
    } catch (error: unknown) {
      throw handleApiError(error);
    }
  },
};

/**
 * Centralized error handler for API requests
 * Transforms axios errors into application-friendly error objects
 */
function handleApiError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'response' in error) {
    const err = error as {
      response?: { data?: { message?: string; code?: string }; status: number };
    };
    if (err.response) {
      // Backend returned an error response
      return {
        message: err.response.data?.message || 'An error occurred',
        code: err.response.data?.code || 'UNKNOWN_ERROR',
        statusCode: err.response.status,
      };
    }
  }

  if (error && typeof error === 'object' && 'request' in error) {
    // Request made but no response received
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
      statusCode: 0,
    };
  }

  // Something else happened
  const message =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: unknown }).message)
      : 'An unexpected error occurred';

  return {
    message,
    code: 'CLIENT_ERROR',
    statusCode: 0,
  };
}
