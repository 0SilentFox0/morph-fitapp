// src/screens/client/home/UpcomingCarousel.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScheduleCard, PagerDots } from '../../../components/ui';
import type { Session } from '../../../mocks';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';

interface UpcomingCarouselProps {
  sessions: Session[];
  trainerName?: string;
  onPressSession: (session: Session) => void;
  onBook: () => void;
}

const GAP = spacing.sm;

/** Horizontal paged carousel of the client's upcoming sessions (client ScheduleCard). */
export function UpcomingCarousel({ sessions, trainerName, onPressSession, onBook }: UpcomingCarouselProps) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  // Card peeks the next one; screen content has spacing.lg horizontal padding.
  const cardWidth = Math.round((width - spacing.lg * 2) * 0.88);
  const interval = cardWidth + GAP;

  if (sessions.length === 0) {
    return (
      <TouchableOpacity style={styles.cta} activeOpacity={0.8} onPress={onBook} testID="book-cta">
        <Ionicons name="add-circle-outline" size={22} color={colors.accent} />
        <Text style={styles.ctaText}>Book your next session</Text>
      </TouchableOpacity>
    );
  }

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / interval));
  };

  return (
    <View testID="upcoming-carousel">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={interval}
        snapToAlignment="start"
        onMomentumScrollEnd={onScrollEnd}
      >
        {sessions.map((s) => (
          <View key={s.id} style={{ width: cardWidth, marginRight: GAP }}>
            <ScheduleCard session={s} variant="client" trainerName={trainerName} onPress={onPressSession} />
          </View>
        ))}
      </ScrollView>
      <PagerDots count={sessions.length} activeIndex={Math.min(index, sessions.length - 1)} />
    </View>
  );
}

const styles = StyleSheet.create({
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral4,
    borderStyle: 'dashed',
  },
  ctaText: { fontSize: typography.sizes.base, color: colors.text },
});
