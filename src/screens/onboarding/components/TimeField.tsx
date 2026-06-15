import React from 'react';
import { Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../../theme';
const { colors, radius, typography, spacing } = theme;

function timeToDate(time: string): Date {
  const [h = 0, m = 0] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function dateToTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

interface TimeFieldProps {
  label: string;
  value: string;
  onChange: (time: string) => void;
}

/** Labeled tap-to-edit time row backed by a 24h DateTimePicker. */
export function TimeField({ label, value, onChange }: TimeFieldProps) {
  const [showPicker, setShowPicker] = React.useState(false);

  return (
    <>
      <Text style={styles.sectionLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.timeRow}
        onPress={() => setShowPicker(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label} ${value}`}
      >
        <Ionicons name="time-outline" size={20} color={colors.text} />
        <Text style={styles.timeText}>{value}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={timeToDate(value)}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, date) => {
            setShowPicker(Platform.OS === 'ios');
            if (date) onChange(dateToTime(date));
          }}
          themeVariant="dark"
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral2,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  timeText: { flex: 1, fontSize: typography.sizes.base, color: colors.text },
});
