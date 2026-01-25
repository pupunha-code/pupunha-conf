import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SectionList, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Screen } from '@/components/layout';
import { Card, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { borderRadius, colors, spacing } from '@/lib/theme';
import { useEventStore } from '@/store';
import { ConferenceEvent } from '@/types';

/**
 * Event selector screen.
 * Displayed when no event is active or user wants to switch events.
 */
export default function EventSelectorScreen() {
  const router = useRouter();
  const { colorScheme, hapticEnabled } = useTheme();
  const themeColors = colors[colorScheme];

  const { events, setActiveEvent } = useEventStore();

  const handleSelectEvent = (event: ConferenceEvent) => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setActiveEvent(event.id);
    router.replace('/(event)/calendar');
  };

  const formatEventDates = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      start.toDateString() === new Date().toDateString() &&
      end.toDateString() === new Date().toDateString()
    ) {
      return 'Hoje';
    }

    if (start.toDateString() === end.toDateString()) {
      return format(start, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    }

    return `${format(start, 'd', { locale: ptBR })} - ${format(end, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
  };

  const isEventCurrent = (event: ConferenceEvent) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return now >= start && now <= end;
  };

  const isEventUpcoming = (event: ConferenceEvent) => {
    const now = new Date();
    const start = new Date(event.startDate);
    return start > now;
  };

  const eventSections = [
    {
      title: 'Próximos eventos',
      data: events.filter(isEventUpcoming),
    },
    {
      title: 'Eventos passados',
      data: events.filter((event) => !isEventUpcoming(event)),
    },
  ];

  return (
    <Screen safeArea="both" padded={false}>
      <SectionList
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="displayMedium" color="text">
              Pupunha Conf
            </Text>
            <Text variant="body" color="textSecondary" style={styles.subtitle}>
              Selecione um evento para continuar
            </Text>
          </View>
        }
        renderItem={({ item: event, index }) => {
          const isCurrent = isEventCurrent(event);
          const isUpcoming = isEventUpcoming(event);
          return (
            <Animated.View key={event.id} entering={FadeInDown.delay(index * 100).springify()}>
              <Card elevated style={styles.eventCard} onPress={() => handleSelectEvent(event)}>
                {event.imageUrl && (
                  <Image
                    source={{ uri: event.imageUrl }}
                    style={styles.eventImage}
                    contentFit="cover"
                  />
                )}

                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text variant="h3" color="text" numberOfLines={2}>
                      {event.name}
                    </Text>

                    {(isCurrent || isUpcoming) && (
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: isCurrent ? themeColors.success : themeColors.tint,
                          },
                        ]}
                      >
                        <Text variant="labelSmall" color="textInverse">
                          {isCurrent ? 'Acontecendo' : 'Em breve'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {event.description && (
                    <Text
                      variant="bodySmall"
                      color="textSecondary"
                      numberOfLines={2}
                      style={styles.eventDescription}
                    >
                      {event.description}
                    </Text>
                  )}

                  <View style={styles.eventMeta}>
                    <Text variant="label" color="tint">
                      {formatEventDates(event.startDate, event.endDate)}
                    </Text>
                    {event.location && (
                      <Text variant="caption" color="textTertiary">
                        {event.location}
                      </Text>
                    )}
                  </View>

                  <View style={styles.eventStats}>
                    <Text variant="caption" color="textSecondary">
                      {event.days.length} {event.days.length === 1 ? 'dia' : 'dias'}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      •
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      {event.speakers.length} palestrantes
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      •
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      {event.days.reduce((acc, day) => acc + day.sessions.length, 0)} palestras
                    </Text>
                  </View>
                </View>
              </Card>
            </Animated.View>
          );
        }}
        renderSectionHeader={({ section: { title } }) => (
          <Text color="text" style={{ marginTop: spacing.xxl, marginBottom: spacing.md }}>
            {title}
          </Text>
        )}
        keyExtractor={(item) => item.id}
        sections={eventSections}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  eventCard: {
    padding: 0,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 160,
  },
  eventContent: {
    padding: spacing.lg,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  eventDescription: {
    marginTop: spacing.sm,
  },
  eventMeta: {
    marginTop: spacing.md,
    gap: spacing.xxs,
  },
  eventStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
