import { Session, SessionGroup, Speaker } from '@/types';

export interface SessionsState {
  // Data
  sessions: Session[];
  sessionsByDay: Map<string, SessionGroup[]>;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  fetchSessions: () => Promise<void>;
  refreshSessions: () => Promise<void>;
  getSessionById: (id: string) => Session | undefined;
  getSessionsByDay: (date: string) => SessionGroup[];
  getSpeakerById: (id: string) => Speaker | undefined;
}
