import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/layout';
import { ScheduleCard, SessionOptionsMenu, SearchInput } from '../../components/ui';
import type { SessionOptionAction } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { mockSessions } from '../../mocks';
import type { Session } from '../../mocks';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Schedule'>;

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_AHEAD = 90;

function buildDaysFromToday(): { label: string; date: string; dateKey: string }[] {
  const days: { label: string; date: string; dateKey: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      label: DAY_LABELS[d.getDay()],
      date: String(d.getDate()),
      dateKey: d.toISOString().slice(0, 10),
    });
  }
  return days;
}

const DAY_CELL_WIDTH = 48;
const DAY_CELL_HEIGHT = 56;

export function ScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const days = React.useMemo(() => buildDaysFromToday(), []);
  const [sessions, setSessions] = React.useState<Session[]>(mockSessions);
  const [selectedDayIndex, setSelectedDayIndex] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [optionsSession, setOptionsSession] = React.useState<Session | null>(null);

  const handleSessionOption = (action: SessionOptionAction) => {
    if (!optionsSession) return;
    if (action === 'edit' || action === 'reschedule') {
      navigation.navigate('SessionForm', { session: optionsSession });
    } else if (action === 'cancel') {
      Alert.alert(
        'Cancel session',
        `Cancel "${optionsSession.title}"?`,
        [
          { text: 'No', style: 'cancel', onPress: () => setOptionsSession(null) },
          {
            text: 'Yes, cancel',
            style: 'destructive',
            onPress: () => {
              setSessions((prev) => prev.filter((s) => s.id !== optionsSession.id));
              setOptionsSession(null);
            },
          },
        ]
      );
      return;
    }
    setOptionsSession(null);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Schedule"
        showBack
        style={styles.header}
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity onPress={() => navigation.navigate('SessionForm', {})}>
            <Ionicons name="add" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <View style={styles.monthSelector}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {new Date(days[selectedDayIndex]?.dateKey ?? '').toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysScroll}
      >
        {days.map((day, i) => {
          const selected = i === selectedDayIndex;
          return (
            <TouchableOpacity
              key={day.dateKey}
              onPress={() => setSelectedDayIndex(i)}
              style={[
                styles.dayChip,
                { width: DAY_CELL_WIDTH, height: DAY_CELL_HEIGHT },
                selected && styles.dayChipSelected,
              ]}
            >
              <Text style={[styles.dayLabel, selected && styles.dayLabelSelected]}>
                {day.label}
              </Text>
              <Text style={[styles.dayDate, selected && styles.dayDateSelected]}>{day.date}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.searchWrapper}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search"
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sessions.map((session) => (
          <ScheduleCard
            key={session.id}
            session={session}
            onPress={() => navigation.navigate('SessionForm', { session })}
            onOptionsPress={() => setOptionsSession(session)}
          />
        ))}
      </ScrollView>

      <SessionOptionsMenu
        visible={optionsSession !== null}
        onClose={() => setOptionsSession(null)}
        onSelect={handleSessionOption}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    backgroundColor: colors.screenBg,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  monthText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  daysScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.sm,
    flexGrow: 0,
  },
  dayChip: {
    borderRadius: 14,
    backgroundColor: colors.Secondary2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 0,
  },
  dayChipSelected: {
    backgroundColor: colors.primary3,
  },
  dayLabel: {
    fontSize: 12,
    lineHeight: 20,
    fontWeight: typography.weights.normal,
    color: colors.text,
  },
  dayLabelSelected: {
    color: colors.text,
  },
  dayDate: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '900',
    color: colors.text,
  },
  dayDateSelected: {
    color: colors.text,
  },
  searchWrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
  },
});
