import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import theme from '../../../../theme';

const { colors, typography, spacing, radius } = theme;

import { useDateTimePicker } from '../../../../hooks/datetime/useDateTimePicker';
import { formatDate, formatTime } from '../../../../utils';

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
  const datePicker = useDateTimePicker(onDateChange);

  const timePicker = useDateTimePicker(onTimeChange);

  return (
    <>
      <Text style={styles.sectionLabel}>Date & Time</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.field}
          onPress={datePicker.open}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={16} color={colors.neutral8} />
          <Text style={styles.fieldText}>{formatDate(date)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.field}
          onPress={timePicker.open}
          activeOpacity={0.8}
        >
          <Ionicons name="time-outline" size={16} color={colors.neutral8} />
          <Text style={styles.fieldText}>{formatTime(time)}</Text>
        </TouchableOpacity>
      </View>

      {datePicker.visible && (
        <View style={styles.native}>
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={datePicker.handleChange}
            themeVariant="dark"
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.done} onPress={datePicker.close}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {timePicker.visible && (
        <View style={styles.native}>
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={timePicker.handleChange}
            themeVariant="dark"
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.done} onPress={timePicker.close}>
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
    borderRadius: radius.md,
  },
  fieldText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  native: {
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
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
