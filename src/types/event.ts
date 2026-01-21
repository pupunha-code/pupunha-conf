/**
 * Event-related type definitions for Pupunha Code app.
 */

import { Session, Speaker } from './session';

export interface EventDay {
  id: string;
  date: string; // YYYY-MM-DD format
  label: string; // "Dia 1", "Dia 2"
  sessions: Session[];
}

export interface ConferenceEvent {
  id: string;
  name: string;
  theme?: string;
  description?: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: EventDay[];
  speakers: Speaker[];
  imageUrl?: string;
}

export interface EventState {
  events: ConferenceEvent[];
  activeEventId: string | null;
  activeDayId: Record<string, string>; // eventId -> dayId mapping
}
