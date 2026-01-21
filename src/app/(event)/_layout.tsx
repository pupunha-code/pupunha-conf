import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/lib/theme';

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
};

function TabIcon({ name, color }: TabIconProps) {
  return <Ionicons name={name} size={24} color={color} />;
}

/**
 * Event-scoped tab layout.
 * All screens within this layout are scoped to the active event.
 */
export default function EventTabLayout() {
  const { colorScheme, isDark, hapticEnabled } = useTheme();
  const themeColors = colors[colorScheme];

  const handleTabPress = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Use glass effect on iOS 26+ (Liquid Glass)
  const useGlassTabBar = Platform.OS === 'ios' && isLiquidGlassAvailable();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: themeColors.tabBarActive,
        tabBarInactiveTintColor: themeColors.tabBarInactive,
        tabBarStyle: useGlassTabBar
          ? styles.glassTabBar
          : [
              styles.tabBar,
              {
                backgroundColor: themeColors.tabBarBackground,
                borderTopColor: themeColors.tabBarBorder,
              },
            ],
        tabBarBackground: useGlassTabBar
          ? () => (
              <BlurView
                intensity={100}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
            )
          : undefined,
      }}
      screenListeners={{
        tabPress: handleTabPress,
      }}
    >
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Programação',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'calendar' : 'calendar-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarked"
        options={{
          title: 'Salvos',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'bookmark' : 'bookmark-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="speakers"
        options={{
          title: 'Palestrantes',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'people' : 'people-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          title: 'Info',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'information-circle' : 'information-circle-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="session/[id]"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="speaker/[id]"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  glassTabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    elevation: 0,
  },
});
