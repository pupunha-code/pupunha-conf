import { useActiveEvent } from '@/hooks/useActiveEvent';
import { Stack } from 'expo-router';

/**
 * Dashboard layout with Stack wrapper.
 * Event tabs are in (event) group.
 */
export default function DashboardLayout() {
  const { activeEvent } = useActiveEvent();
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="(event)"
        options={{
          headerBackVisible: true,
          headerTitle: '' + (activeEvent ? activeEvent.name : 'Evento'),
        }}
      />
    </Stack>
  );
}
