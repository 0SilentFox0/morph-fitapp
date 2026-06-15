import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../../../theme';
const { colors, radius, typography, spacing } = theme;
import { useOnboardingStore } from '../../../store/onboardingStore';
import { useShallow } from 'zustand/react/shallow';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

/** Weekday multi-select chips for the onboarding schedule step. */
export function WeekdayPicker() {
  const { workDays, toggleWorkDay } = useOnboardingStore(
    useShallow((s) => ({ workDays: s.workDays, toggleWorkDay: s.toggleWorkDay }))
  );

  return (
    <View style={styles.daysRow}>
      {DAYS.map((day) => {
        const sel = workDays.includes(day);
        return (
          <TouchableOpacity
            key={day}
            onPress={() => toggleWorkDay(day)}
            style={[styles.dayChip, sel && styles.dayChipSelected]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: sel }}
            accessibilityLabel={day}
          >
            <Text style={[styles.dayText, sel && styles.dayTextSelected]}>{DAY_SHORT[day]}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  dayChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.neutral2,
  },
  dayChipSelected: { backgroundColor: colors.accent },
  dayText: { fontSize: typography.sizes.sm, color: colors.text },
  dayTextSelected: { color: colors.white },
});
