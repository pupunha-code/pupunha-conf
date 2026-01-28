import { useCallback, useEffect, useRef } from 'react';

export function useEventsData() {
  const initRef = useRef(false);

  const loadEvents = useCallback(async () => {
    console.log('Loading events...');
    // This hook is deprecated - use useEventsQuery instead
    console.log('Events fetched, initializing...');
  }, []);

  useEffect(() => {
    if (!initRef.current) {
      console.log('Events not initialized, loading...');
      initRef.current = true;
      loadEvents();
    }
  }, [loadEvents]);

  const refetch = useCallback(async () => {
    console.log('Refetching events...');
    await loadEvents();
  }, [loadEvents]);

  return {
    events: [],
    isLoading: false,
    error: null,
    isInitialized: true,
    refetch,
  };
}
