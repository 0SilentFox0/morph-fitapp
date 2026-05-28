import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';

// Local helpers; will be replaced by ../../utils/date once Task 1 lands.
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(d: Date): string {
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatTime(d: Date): string {
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = d.getHours() >= 12 ? 'pm' : 'am';
  const h = d.getHours() % 12 || 12;
  return `${h}:${m}${ampm}`;
}

export interface DateTimePickerSectionProps {
  date: Date;
  time: Date;
  onDateChange: (d: Date) => void;
  onTimeChange: (t: Date) => void;
}

export function DateTimePickerSection({
  date,
  time,
  onDateChange,
  onTimeChange,
}: DateTimePickerSectionProps) {
  const [showDate, setShowDate] = React.useState(false);
  const [showTime, setShowTime] = React.useState(false);

  const handleDateChange = (_: unknown, selected?: Date) => {
    if (Platform.OS === 'android') setShowDate(false);
    if (selected) onDateChange(selected);
  };

  const handleTimeChange = (_: unknown, selected?: Date) => {
    if (Platform.OS === 'android') setShowTime(false);
    if (selected) onTimeChange(selected);
  };

  return (
    <>
      <Text style={styles.sectionLabel}>Date & Time</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.field}
          onPress={() => setShowDate(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={16} color={colors.neutral8} />
          <Text style={styles.fieldText}>{formatDate(date)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.field}
          onPress={() => setShowTime(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="time-outline" size={16} color={colors.neutral8} />
          <Text style={styles.fieldText}>{formatTime(time)}</Text>
        </TouchableOpacity>
      </View>

      {showDate && (
        <View style={styles.native}>
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            themeVariant="dark"
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.done} onPress={() => setShowDate(false)}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showTime && (
        <View style={styles.native}>
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
            themeVariant="dark"
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.done} onPress={() => setShowTime(false)}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral2,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  fieldText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  native: {
    backgroundColor: colors.neutral2,
    borderRadius: 12,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  done: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  doneText: {
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
});
