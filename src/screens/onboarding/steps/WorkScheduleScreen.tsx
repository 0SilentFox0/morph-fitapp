import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../../navigation/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { OnboardingLayout } from '../components/OnboardingLayout';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'WorkSchedule'>;

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT: Record<string, string> = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' };

function timeToDate(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function dateToTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function WorkScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const { workDays, workTimeStart, workTimeEnd, sameSlotsEveryWeek, setField, toggleWorkDay } = useOnboardingStore();
  const [showStartPicker, setShowStartPicker] = React.useState(false);
  const [showEndPicker, setShowEndPicker] = React.useState(false);

  return (
    <OnboardingLayout
      step={7}
      title="What time do you plan to work?"
      subtitle="Select your working days and hours"
      onNext={() => navigation.navigate('ProfilePhoto')}
      onBack={() => navigation.goBack()}
      onSkip={() => navigation.navigate('ProfilePhoto')}
    >
      <Text style={styles.sectionLabel}>Days</Text>
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

      <Text style={styles.sectionLabel}>Start time</Text>
      <TouchableOpacity style={styles.timeRow} onPress={() => setShowStartPicker(true)} accessibilityRole="button" accessibilityLabel={`Start time ${workTimeStart}`}>
        <Ionicons name="time-outline" size={20} color={colors.text} />
        <Text style={styles.timeText}>{workTimeStart}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={timeToDate(workTimeStart)}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, date) => { setShowStartPicker(Platform.OS === 'ios'); if (date) setField('workTimeStart', dateToTime(date)); }}
          themeVariant="dark"
        />
      )}

      <Text style={styles.sectionLabel}>End time</Text>
      <TouchableOpacity style={styles.timeRow} onPress={() => setShowEndPicker(true)} accessibilityRole="button" accessibilityLabel={`End time ${workTimeEnd}`}>
        <Ionicons name="time-outline" size={20} color={colors.text} />
        <Text style={styles.timeText}>{workTimeEnd}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
      </TouchableOpacity>
      {showEndPicker && (
        <DateTimePicker
          value={timeToDate(workTimeEnd)}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, date) => { setShowEndPicker(Platform.OS === 'ios'); if (date) setField('workTimeEnd', dateToTime(date)); }}
          themeVariant="dark"
        />
      )}

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Same slots every week</Text>
        <Switch value={sameSlotsEveryWeek} onValueChange={(v) => setField('sameSlotsEveryWeek', v)} trackColor={{ false: colors.neutral2, true: colors.accent }} thumbColor="#FFFFFF" />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  dayChip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 20, backgroundColor: colors.neutral2 },
  dayChipSelected: { backgroundColor: colors.accent },
  dayText: { fontSize: typography.sizes.sm, color: colors.text },
  dayTextSelected: { color: '#FFFFFF' },
  timeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.neutral2, padding: spacing.md, borderRadius: 12, marginBottom: spacing.sm, gap: spacing.sm },
  timeText: { flex: 1, fontSize: typography.sizes.base, color: colors.text },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg },
  toggleLabel: { fontSize: typography.sizes.sm, color: colors.textSecondary },
});
