import { Stack } from 'expo-router';

/**
 * Dashboard layout with Stack wrapper.
 * Event tabs are in (event) group, modals are in (modal) group.
 */
export default function DashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(event)" />
      <Stack.Screen
        name="(modal)"
        options={{
          presentation: 'modal',
          animation: 'fade',
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
