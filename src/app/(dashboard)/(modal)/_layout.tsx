import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function ModalLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="create-post/index" 
        options={{
          presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          headerShown: false,
        }}
      />
    </Stack>
  );
}
