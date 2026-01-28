import { useQuery, useQueryClient } from '@tanstack/react-query';

import { eventsApi } from '@/services/api';
import { ConferenceEvent } from '@/types';

export const QUERY_KEYS = {
  events: ['events'] as const,
  event: (id: string) => ['events', id] as const,
} as const;

export function useEventsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.events,
    queryFn: eventsApi.getAllEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEventQuery(eventId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.event(eventId),
    queryFn: () => eventsApi.getEventById(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEventsQueryHelpers() {
  const queryClient = useQueryClient();

  const prefetchEvent = (eventId: string) => {
    return queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.event(eventId),
      queryFn: () => eventsApi.getEventById(eventId),
      staleTime: 5 * 60 * 1000,
    });
  };

  const invalidateEvents = () => {
    return queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.events,
    });
  };

  const setEventData = (eventId: string, data: ConferenceEvent) => {
    queryClient.setQueryData(QUERY_KEYS.event(eventId), data);
  };

  return {
    prefetchEvent,
    invalidateEvents,
    setEventData,
  };
}
