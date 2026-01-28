import { Stack } from 'expo-router';

/**
 * Dashboard layout with Stack wrapper.
 * Event tabs are in (event) group.
 */
export default function DashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(event)" />
    </Stack>
  );
}
