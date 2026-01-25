import { ConferenceEvent } from '@/types';

const API_BASE_URL = 'https://pupunhacode.com/api';

export interface ApiError {
  message: string;
  status?: number;
}

class EventsApi {
  public async fetchWithErrorHandling<T>(url: string): Promise<T> {}

  public async getAllEvents(): Promise<ConferenceEvent[]> {
    // return this.fetchWithErrorHandling<ConferenceEvent[]>(`${API_BASE_URL}/events.json`);
    try {
      const response = await fetch(`${API_BASE_URL}/events.json`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch from ${API_BASE_URL}/events.json: ${error.message}`);
      }
      throw new Error(`Failed to fetch from ${API_BASE_URL}/events.json: Unknown error`);
    }
  }

  public async getEventById(eventId: string): Promise<ConferenceEvent> {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}.json`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to fetch from ${API_BASE_URL}/events/${eventId}.json: ${error.message}`,
        );
      }
      throw new Error(`Failed to fetch from ${API_BASE_URL}/events/${eventId}.json: Unknown error`);
    }
    // return this.fetchWithErrorHandling<ConferenceEvent>(`${API_BASE_URL}/events/${eventId}.json`);
  }
}

export const eventsApi = new EventsApi();
