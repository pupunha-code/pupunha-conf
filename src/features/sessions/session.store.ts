import { create } from 'zustand';

import { Session, SessionGroup, Speaker } from '@/types';

import { mockSessions, mockSpeakers } from './session.mock';

interface SessionsState {
  // Data
  sessions: Session[];
  speakers: Speaker[];

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  fetchSessions: () => Promise<void>;
  refreshSessions: () => Promise<void>;
  getSessionById: (id: string) => Session | undefined;
  getSessionsByTimeSlot: () => SessionGroup[];
  getSpeakerById: (id: string) => Speaker | undefined;
}

export const useSessionsStore = create<SessionsState>((set, get) => ({
  // Initial state
  sessions: mockSessions,
  speakers: mockSpeakers,
  isLoading: false,
  isRefreshing: false,
  error: null,

  // Actions
  fetchSessions: async () => {
    const { isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true, error: null });

    try {
      // Simulate API call - replace with real API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // For now, use mock data
      set({
        sessions: mockSessions,
        speakers: mockSpeakers,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao carregar sessões',
        isLoading: false,
      });
    }
  },

  refreshSessions: async () => {
    const { isRefreshing } = get();
    if (isRefreshing) return;

    set({ isRefreshing: true, error: null });

    try {
      // Simulate API call - replace with real API
      await new Promise((resolve) => setTimeout(resolve, 500));

      set({
        sessions: mockSessions,
        speakers: mockSpeakers,
        isRefreshing: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao atualizar sessões',
        isRefreshing: false,
      });
    }
  },

  getSessionById: (id: string) => {
    return get().sessions.find((session) => session.id === id);
  },

  getSessionsByTimeSlot: () => {
    const { sessions } = get();

    // Group sessions by start time
    const groupedMap = new Map<string, Session[]>();

    sessions.forEach((session) => {
      const timeKey = session.startTime;
      const existing = groupedMap.get(timeKey) || [];
      groupedMap.set(timeKey, [...existing, session]);
    });

    // Convert to SessionGroup array and sort by time
    const groups: SessionGroup[] = Array.from(groupedMap.entries())
      .map(([time, data]) => {
        const startDate = new Date(time);
        const endDate = new Date(data[0].endTime);

        const formatTime = (date: Date) =>
          date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          });

        return {
          title: `${formatTime(startDate)} - ${formatTime(endDate)}`,
          data,
        };
      })
      .sort((a, b) => {
        const timeA = a.data[0]?.startTime || '';
        const timeB = b.data[0]?.startTime || '';
        return timeA.localeCompare(timeB);
      });

    return groups;
  },

  getSpeakerById: (id: string) => {
    return get().speakers.find((speaker) => speaker.id === id);
  },
}));
