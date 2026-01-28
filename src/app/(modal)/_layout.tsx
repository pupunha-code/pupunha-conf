import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function ModalLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="create-post/index"
        options={{
          presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="image-viewer/[index]"
        options={{
          presentation: 'fullScreenModal',
          animation: 'fade',
          gestureEnabled: true,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="session/[id]"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="speaker/[id]"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          headerShown: false,
        }}
      />
    </Stack>
  );
}
