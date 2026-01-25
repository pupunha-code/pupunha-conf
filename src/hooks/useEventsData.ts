import { useCallback, useEffect, useRef } from 'react';

import { useEventStore } from '@/store';

export function useEventsData() {
  const store = useEventStore();
  const { events, isLoading, error, isInitialized } = store;
  const initRef = useRef(false);

  const loadEvents = useCallback(async () => {
    console.log('Loading events...');
    try {
      await store.fetchEvents();
      console.log('Events fetched, initializing...');
      store.initializeActiveEvent();
    } catch (err) {
      console.error('Error loading events:', err);
    }
  }, [store]);

  useEffect(() => {
    if (!initRef.current && !isInitialized) {
      console.log('Events not initialized, loading...');
      initRef.current = true;
      loadEvents();
    }
  }, [isInitialized, loadEvents]);

  const refetch = useCallback(async () => {
    console.log('Refetching events...');
    await loadEvents();
  }, [loadEvents]);

  return {
    events,
    isLoading,
    error,
    isInitialized,
    refetch,
  };
}