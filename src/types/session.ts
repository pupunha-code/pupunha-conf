/**
 * Session-related type definitions for the Pupunha Code app.
 */

export type SessionType =
  | 'talk'
  | 'workshop'
  | 'panel'
  | 'keynote'
  | 'break'
  | 'networking'
  | 'opening'
  | 'closing';

export type SessionTrack = 'main' | 'community' | 'advanced' | 'beginner';

export interface SpeakerLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
}

export interface Speaker {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  photoUrl?: string;
  company?: string;
  links?: SpeakerLinks;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  type: SessionType;
  track?: SessionTrack;
  room?: string;
  speakers: string[]; // Speaker IDs
  tags?: string[];
}

export interface SessionGroup {
  title: string; // Time slot title (e.g., "14:00 - 14:30")
  data: Session[];
}
