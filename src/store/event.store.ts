import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Bookmark, ConferenceEvent, EventDay, Session, Speaker } from '@/types';

import { mockEvents } from './event.mock';

interface EventStore {
  // Data
  events: ConferenceEvent[];
  activeEventId: string | null;
  activeDayId: Record<string, string>; // eventId -> dayId mapping
  bookmarks: Bookmark[];

  // Loading states
  isLoading: boolean;
  isInitialized: boolean;

  // Event actions
  setActiveEvent: (eventId: string) => void;
  initializeActiveEvent: () => void;

  // Day actions
  setActiveDay: (eventId: string, dayId: string) => void;

  // Bookmark actions
  toggleBookmark: (sessionId: string, notificationId?: string) => void;
  isBookmarked: (sessionId: string) => boolean;

  // Derived selectors
  getActiveEvent: () => ConferenceEvent | undefined;
  getActiveDay: () => EventDay | undefined;
  getSessionsForActiveDay: () => Session[];
  getBookmarkedSessions: () => Session[];
  getSessionsBySpeakerId: (speakerId: string) => Session[];
  getSpeakerById: (speakerId: string) => Speaker | undefined;
  getSessionById: (sessionId: string) => Session | undefined;
  getAllSpeakers: () => Speaker[];
}

export const useEventStore = create(
  persist<EventStore>(
    (set, get) => ({
      // Initial state
      events: mockEvents,
      activeEventId: null,
      activeDayId: {},
      bookmarks: [],
      isLoading: false,
      isInitialized: false,

      // Event actions
      setActiveEvent: (eventId: string) => {
        const { events, activeDayId } = get();
        const event = events.find((e) => e.id === eventId);

        // If no active day for this event, set first day
        if (event && !activeDayId[eventId] && event.days.length > 0) {
          set({
            activeEventId: eventId,
            activeDayId: {
              ...activeDayId,
              [eventId]: event.days[0].id,
            },
          });
        } else {
          set({ activeEventId: eventId });
        }
      },

      initializeActiveEvent: () => {
        const { events, activeEventId, isInitialized, activeDayId } = get();

        // If already initialized and has an active event, ensure day is set
        if (isInitialized && activeEventId) {
          const event = events.find((e) => e.id === activeEventId);
          if (event && !activeDayId[activeEventId] && event.days.length > 0) {
            set({
              activeDayId: {
                ...activeDayId,
                [activeEventId]: event.days[0].id,
              },
            });
          }
          return;
        }

        // If there's a persisted activeEventId but not initialized, validate it
        if (activeEventId && !isInitialized) {
          const event = events.find((e) => e.id === activeEventId);
          if (event) {
            const newActiveDayId = { ...activeDayId };
            // Set first day as active if not already set
            if (!newActiveDayId[activeEventId] && event.days.length > 0) {
              newActiveDayId[activeEventId] = event.days[0].id;
            }
            set({
              activeDayId: newActiveDayId,
              isInitialized: true,
            });
            return;
          }
        }

        // Find current or upcoming event based on date
        const now = new Date();
        const currentOrUpcoming = events.find((event) => {
          const endDate = new Date(event.endDate);
          return endDate >= now;
        });

        const eventToSelect = currentOrUpcoming || events[0];

        if (eventToSelect) {
          const newActiveDayId = { ...activeDayId };

          // Set first day as active if not already set
          if (!newActiveDayId[eventToSelect.id] && eventToSelect.days.length > 0) {
            newActiveDayId[eventToSelect.id] = eventToSelect.days[0].id;
          }

          set({
            activeEventId: eventToSelect.id,
            activeDayId: newActiveDayId,
            isInitialized: true,
          });
        } else {
          // No events available, but mark as initialized
          set({ isInitialized: true });
        }
      },

      // Day actions
      setActiveDay: (eventId: string, dayId: string) => {
        const { activeDayId } = get();
        set({
          activeDayId: {
            ...activeDayId,
            [eventId]: dayId,
          },
        });
      },

      // Bookmark actions
      toggleBookmark: (sessionId: string, notificationId?: string) => {
        const { bookmarks } = get();
        const existing = bookmarks.find((b) => b.sessionId === sessionId);

        if (existing) {
          set({
            bookmarks: bookmarks.filter((b) => b.sessionId !== sessionId),
          });
        } else {
          set({
            bookmarks: [
              ...bookmarks,
              {
                sessionId,
                notificationId,
                createdAt: new Date().toISOString(),
              },
            ],
          });
        }
      },

      isBookmarked: (sessionId: string) => {
        return get().bookmarks.some((b) => b.sessionId === sessionId);
      },

      // Derived selectors
      getActiveEvent: () => {
        const { events, activeEventId } = get();
        return events.find((e) => e.id === activeEventId);
      },

      getActiveDay: () => {
        const { activeEventId, activeDayId } = get();
        const event = get().getActiveEvent();

        if (!event || !activeEventId) return undefined;

        const dayId = activeDayId[activeEventId];
        return event.days.find((d) => d.id === dayId);
      },

      getSessionsForActiveDay: () => {
        const day = get().getActiveDay();
        return day?.sessions || [];
      },

      getBookmarkedSessions: () => {
        const { bookmarks } = get();
        const event = get().getActiveEvent();

        if (!event) return [];

        const bookmarkedIds = new Set(bookmarks.map((b) => b.sessionId));
        const sessions: Session[] = [];

        event.days.forEach((day) => {
          day.sessions.forEach((session) => {
            if (bookmarkedIds.has(session.id)) {
              sessions.push(session);
            }
          });
        });

        // Sort by start time
        return sessions.sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        );
      },

      getSessionsBySpeakerId: (speakerId: string) => {
        const event = get().getActiveEvent();
        if (!event) return [];

        const sessions: Session[] = [];
        event.days.forEach((day) => {
          day.sessions.forEach((session) => {
            if (session.speakers.includes(speakerId)) {
              sessions.push(session);
            }
          });
        });

        // Sort by start time
        return sessions.sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        );
      },

      getSpeakerById: (speakerId: string) => {
        const event = get().getActiveEvent();
        return event?.speakers.find((s) => s.id === speakerId);
      },

      getSessionById: (sessionId: string) => {
        const event = get().getActiveEvent();
        if (!event) return undefined;

        for (const day of event.days) {
          const session = day.sessions.find((s) => s.id === sessionId);
          if (session) return session;
        }
        return undefined;
      },

      getAllSpeakers: () => {
        const event = get().getActiveEvent();
        return event?.speakers || [];
      },
    }),
    {
      name: 'pupunha-conf-event-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeEventId: state.activeEventId,
        activeDayId: state.activeDayId,
        bookmarks: state.bookmarks,
        isInitialized: state.isInitialized,
      }) as EventStore,
    },
  ),
);
