import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/components/layout';
import { Text } from '@/components/ui';
import { useActiveEvent } from '@/hooks/useActiveEvent';
import { useTheme } from '@/hooks/useTheme';
import { borderRadius, colors, spacing } from '@/lib/theme';
import { useAppStore } from '@/store';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  index: number;
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  rightElement,
  index,
}: SettingsRowProps) {
  const { colorScheme, hapticEnabled } = useTheme();
  const themeColors = colors[colorScheme];

  const handlePress = () => {
    if (onPress) {
      if (hapticEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    }
  };

  const content = (
    <View
      style={[
        styles.settingsRow,
        { backgroundColor: themeColors.cardBackground },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: themeColors.surfaceSecondary }]}>
        <Ionicons name={icon} size={20} color={themeColors.icon} />
      </View>
      <View style={styles.settingsContent}>
        <Text variant="body" color="text">
          {label}
        </Text>
        {value && (
          <Text variant="caption" color="textSecondary">
            {value}
          </Text>
        )}
      </View>
      {rightElement}
      {onPress && !rightElement && (
        <Ionicons name="chevron-forward" size={20} color={themeColors.iconSecondary} />
      )}
    </View>
  );

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      {onPress ? <Pressable onPress={handlePress}>{content}</Pressable> : content}
    </Animated.View>
  );
}

/**
 * Info and settings screen.
 * Shows event information and app settings.
 */
export default function InfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme, isDark, hapticEnabled, toggleHaptic } = useTheme();
  const themeColors = colors[colorScheme];

  const { activeEvent } = useActiveEvent();
  const { themeMode, setThemeMode, useLocalTimezone, toggleLocalTimezone } = useAppStore();

  const handleChangeEvent = () => {
    router.push('/');
  };

  const handleOpenLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  if (!activeEvent) {
    return (
      <Screen safeArea="both" centered>
        <Text variant="body" color="textSecondary">
          Nenhum evento selecionado
        </Text>
      </Screen>
    );
  }

  const startDate = new Date(activeEvent.startDate);
  const endDate = new Date(activeEvent.endDate);
  const dateRange =
    startDate.toDateString() === endDate.toDateString()
      ? format(startDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
      : `${format(startDate, "d", { locale: ptBR })} - ${format(endDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`;

  let rowIndex = 0;

  return (
    <Screen safeArea="top" padded={false}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <Text variant="h2">Informações</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Info Section */}
        <View style={styles.section}>
          <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
            EVENTO
          </Text>
          <View
            style={[styles.sectionContent, { backgroundColor: themeColors.cardBackground }]}
          >
            <SettingsRow
              icon="calendar-outline"
              label={activeEvent.name}
              value={dateRange}
              index={rowIndex++}
            />
            {activeEvent.location && (
              <SettingsRow
                icon="location-outline"
                label="Local"
                value={activeEvent.location}
                index={rowIndex++}
              />
            )}
            <SettingsRow
              icon="swap-horizontal-outline"
              label="Trocar evento"
              onPress={handleChangeEvent}
              index={rowIndex++}
            />
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
            CONFIGURAÇÕES
          </Text>
          <View
            style={[styles.sectionContent, { backgroundColor: themeColors.cardBackground }]}
          >
            <SettingsRow
              icon="phone-portrait-outline"
              label="Usar tema do sistema"
              rightElement={
                <Switch
                  value={themeMode === 'system'}
                  onValueChange={(enabled) => {
                    setThemeMode(enabled ? 'system' : (isDark ? 'dark' : 'light'));
                  }}
                  trackColor={{
                    false: themeColors.border,
                    true: themeColors.tint,
                  }}
                />
              }
              index={rowIndex++}
            />
            <SettingsRow
              icon="moon-outline"
              label="Modo escuro"
              rightElement={
                <Switch
                  value={themeMode === 'dark'}
                  disabled={themeMode === 'system'}
                  onValueChange={(enabled) => {
                    setThemeMode(enabled ? 'dark' : 'light');
                  }}
                  trackColor={{
                    false: themeColors.border,
                    true: themeColors.tint,
                  }}
                />
              }
              index={rowIndex++}
            />
            <SettingsRow
              icon="hand-left-outline"
              label="Feedback tátil"
              rightElement={
                <Switch
                  value={hapticEnabled}
                  onValueChange={toggleHaptic}
                  trackColor={{
                    false: themeColors.border,
                    true: themeColors.tint,
                  }}
                />
              }
              index={rowIndex++}
            />
            <SettingsRow
              icon="globe-outline"
              label="Usar fuso horário local"
              rightElement={
                <Switch
                  value={useLocalTimezone}
                  onValueChange={toggleLocalTimezone}
                  trackColor={{
                    false: themeColors.border,
                    true: themeColors.tint,
                  }}
                />
              }
              index={rowIndex++}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
            SOBRE
          </Text>
          <View
            style={[styles.sectionContent, { backgroundColor: themeColors.cardBackground }]}
          >
            <SettingsRow
              icon="logo-github"
              label="Código fonte"
              value="github.com/pupunha-code/pupunha-conf"
              onPress={() => handleOpenLink('https://github.com/pupunha-code/pupunha-conf')}
              index={rowIndex++}
            />
            <SettingsRow
              icon="logo-discord"
              label="Discord"
              value="Junte-se à comunidade"
              onPress={() => handleOpenLink('https://discord.com/invite/eek5VsPYGt')}
              index={rowIndex++}
            />
            <SettingsRow
              icon="heart-outline"
              label="Feito com"
              value="Expo + React Native"
              index={rowIndex++}
            />
            <SettingsRow
              icon="information-circle-outline"
              label="Versão"
              value="1.0.0"
              index={rowIndex++}
            />
          </View>
        </View>

        {/* Credits */}
        <View style={styles.credits}>
          <Text variant="caption" color="textTertiary" center>
            Desenvolvido com amor para a comunidade React Native brasileira
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sectionContent: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsContent: {
    flex: 1,
    gap: spacing.xxs,
  },
  credits: {
    paddingVertical: spacing.xl,
  },
});
