import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { useAppStore } from '@/store/app.store';
import { Bookmark, ConferenceEvent, EventDay, Session, Speaker } from '@/types';
import { registerForPushNotificationsAsync } from '@/utils/registerForPushNotificationsAsync';
import { isPast, subMinutes } from 'date-fns';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

interface EventStore {
  activeEventId: string | null;
  activeDayId: Record<string, string>;
  bookmarks: Bookmark[];
  isInitialized: boolean;

  setActiveEvent: (eventId: string, events?: ConferenceEvent[]) => void;
  initializeActiveEvent: (events?: ConferenceEvent[]) => void;

  // Day actions
  setActiveDay: (eventId: string, dayId: string) => void;

  // Bookmark actions
  toggleBookmark: (sessionId: string, events: ConferenceEvent[]) => void;
  isBookmarked: (sessionId: string) => boolean;

  // Derived selectors - now require events to be passed in
  getActiveEvent: (events: ConferenceEvent[]) => ConferenceEvent | undefined;
  getActiveDay: (events: ConferenceEvent[]) => EventDay | undefined;
  getSessionsForActiveDay: (events: ConferenceEvent[]) => Session[];
  getBookmarkedSessions: (events: ConferenceEvent[]) => Session[];
  getSessionsBySpeakerId: (events: ConferenceEvent[], speakerId: string) => Session[];
  getSpeakerById: (events: ConferenceEvent[], speakerId: string) => Speaker | undefined;
  getSessionById: (events: ConferenceEvent[], sessionId: string) => Session | undefined;
  getAllSpeakers: (events: ConferenceEvent[]) => Speaker[];
}

export const useEventStore = create(
  persist<EventStore>(
    (set, get) => ({
      activeEventId: null,
      activeDayId: {},
      bookmarks: [],
      isInitialized: false,

      setActiveEvent: (eventId: string, events: ConferenceEvent[] = []) => {
        const { activeDayId } = get();
        const event = events.find((e) => e.id === eventId);

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

      initializeActiveEvent: (events: ConferenceEvent[] = []) => {
        const { activeEventId, isInitialized, activeDayId } = get();

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

      setActiveDay: (eventId: string, dayId: string) => {
        const { activeDayId } = get();
        set({
          activeDayId: {
            ...activeDayId,
            [eventId]: dayId,
          },
        });
      },

      toggleBookmark: async (sessionId: string, events: ConferenceEvent[]) => {
        const { bookmarks } = get();
        const existing = bookmarks.find((b) => b.sessionId === sessionId);
        const { hapticEnabled } = useAppStore.getState();

        const session = get().getSessionById(events, sessionId);
        if (!session) return;

        const scheduleNotification = async (session: Session) => {
          const fiveMinutesTillSession = subMinutes(new Date(session.startTime), 5);

          if (isPast(fiveMinutesTillSession)) {
            return undefined;
          }

          const status = await registerForPushNotificationsAsync();

          if (status === 'granted') {
            return Notifications.scheduleNotificationAsync({
              content: {
                title: `"${session.title}" começa em 5 minutos! ⏰`,
                data: {
                  url: `/session/${session.id}`,
                },
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: fiveMinutesTillSession,
              },
            });
          }
        };

        if (Platform.OS !== 'web' && hapticEnabled) {
          Haptics.selectionAsync();
        }

        if (existing != null && existing !== undefined) {
          if (existing.notificationId) {
            await Notifications.cancelScheduledNotificationAsync(existing.notificationId);
          }
          console.log('Removing bookmark for session:', sessionId);
          set({
            bookmarks: bookmarks.filter((b) => b.sessionId !== sessionId),
          });
        } else {
          const notificationId = await scheduleNotification(session);
          console.log('Scheduled notification ID:', notificationId);
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
      getActiveEvent: (events: ConferenceEvent[]) => {
        const { activeEventId } = get();
        return events.find((e) => e.id === activeEventId);
      },

      getActiveDay: (events: ConferenceEvent[]) => {
        const { activeEventId, activeDayId } = get();
        const event = get().getActiveEvent(events);

        if (!event || !activeEventId) return undefined;

        const dayId = activeDayId[activeEventId];
        return event.days.find((d) => d.id === dayId);
      },

      getSessionsForActiveDay: (events: ConferenceEvent[]) => {
        const day = get().getActiveDay(events);
        return day?.sessions || [];
      },

      getBookmarkedSessions: (events: ConferenceEvent[]) => {
        const { bookmarks } = get();
        const event = get().getActiveEvent(events);

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

      getSessionsBySpeakerId: (events: ConferenceEvent[], speakerId: string) => {
        const event = get().getActiveEvent(events);
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

      getSpeakerById: (events: ConferenceEvent[], speakerId: string) => {
        const event = get().getActiveEvent(events);
        return event?.speakers.find((s) => s.id === speakerId);
      },

      getSessionById: (events: ConferenceEvent[], sessionId: string) => {
        const event = get().getActiveEvent(events);
        if (!event) return undefined;

        for (const day of event.days) {
          const session = day.sessions.find((s) => s.id === sessionId);
          if (session) return session;
        }
        return undefined;
      },

      getAllSpeakers: (events: ConferenceEvent[]) => {
        const event = get().getActiveEvent(events);
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
      }),
    },
  ),
);
