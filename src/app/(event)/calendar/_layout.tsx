import { Stack } from 'expo-router';

/**
 * Calendar stack layout for day-based navigation.
 */
export default function CalendarLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
