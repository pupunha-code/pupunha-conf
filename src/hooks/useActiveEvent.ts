import { useEventsQuery } from '@/hooks/useEventsQuery';
import { useEventStore } from '@/store';

/**
 * Hook that combines TanStack Query events data with Zustand store selectors.
 * This provides a clean interface for components to access active event data.
 */
export function useActiveEvent() {
  const { data: events = [], isLoading, error, refetch } = useEventsQuery();
  const {
    activeEventId,
    activeDayId,
    setActiveEvent,
    setActiveDay,
    getActiveEvent,
    getActiveDay,
    getSessionsForActiveDay,
    getBookmarkedSessions,
    getSessionsBySpeakerId,
    getSpeakerById,
    getSessionById,
    getAllSpeakers,
    toggleBookmark,
    isBookmarked,
  } = useEventStore();

  // Memoized selectors with events data
  const activeEvent = getActiveEvent(events);
  const activeDay = getActiveDay(events);
  const sessionsForActiveDay = getSessionsForActiveDay(events);
  const bookmarkedSessions = getBookmarkedSessions(events);
  const allSpeakers = getAllSpeakers(events);

  // Helper functions that include events data
  const getSessionsBySpeaker = (speakerId: string) => getSessionsBySpeakerId(events, speakerId);
  const getSpeaker = (speakerId: string) => getSpeakerById(events, speakerId);
  const getSession = (sessionId: string) => getSessionById(events, sessionId);
  const setActiveEventWithEvents = (eventId: string) => setActiveEvent(eventId, events);

  return {
    // Data
    events,
    activeEvent,
    activeDay,
    sessionsForActiveDay,
    bookmarkedSessions,
    allSpeakers,
    activeEventId,
    activeDayId,

    // Loading states
    isLoading,
    error,

    // Actions
    setActiveEvent: setActiveEventWithEvents,
    setActiveDay,
    toggleBookmark,
    refetch,

    // Selectors with events
    getSessionsBySpeaker,
    getSpeaker,
    getSession,
    isBookmarked,
  };
}