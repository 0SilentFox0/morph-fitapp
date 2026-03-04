import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  PanResponder,
  Dimensions,
} from 'react-native';
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
const WORK_DAY_START = 8;
const WORK_DAY_END = 16;
const AVG_TRAINING_HOURS = 1.5;
const MAX_TRAININGS_PER_DAY = Math.floor((WORK_DAY_END - WORK_DAY_START) / AVG_TRAINING_HOURS);

type ScheduleViewMode = 'day' | 'week' | 'month';

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

function getSessionsForDateKey(
  sessions: Session[],
  dateKey: string,
  days: { dateKey: string }[]
): Session[] {
  const todayKey = days[0]?.dateKey;
  const tomorrowKey = days[1]?.dateKey;
  return sessions.filter((s) => {
    if (s.date === 'Today' && dateKey === todayKey) return true;
    if (s.date === 'Tomorrow' && dateKey === tomorrowKey) return true;
    return false;
  });
}

function getBusyPercent(sessionCount: number): number {
  return Math.min(100, (sessionCount / MAX_TRAININGS_PER_DAY) * 100);
}

const DAY_CELL_WIDTH = 48;
const DAY_CELL_HEIGHT = 56;
const SWIPE_THRESHOLD = 60;

export function ScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const days = React.useMemo(() => buildDaysFromToday(), []);
  const [sessions, setSessions] = React.useState<Session[]>(mockSessions);
  const [selectedDayIndex, setSelectedDayIndex] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [optionsSession, setOptionsSession] = React.useState<Session | null>(null);
  const [viewMode, setViewMode] = React.useState<ScheduleViewMode>('day');

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 20,
        onPanResponderRelease: (_, g) => {
          if (g.dy > SWIPE_THRESHOLD) {
            setViewMode((m) => (m === 'day' ? 'week' : m === 'week' ? 'month' : m));
          } else if (g.dy < -SWIPE_THRESHOLD) {
            setViewMode((m) => (m === 'month' ? 'week' : m === 'week' ? 'day' : m));
          }
        },
      }),
    []
  );

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

  const selectedDateKey = days[selectedDayIndex]?.dateKey ?? '';
  const filteredSessions = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => s.title.toLowerCase().includes(q));
  }, [sessions, search]);

  const daySessions = React.useMemo(
    () => getSessionsForDateKey(filteredSessions, selectedDateKey, days),
    [filteredSessions, selectedDateKey, days]
  );

  const weekDays = React.useMemo(
    () => days.slice(selectedDayIndex, selectedDayIndex + 7),
    [days, selectedDayIndex]
  );

  const monthStart = React.useMemo(() => {
    const d = new Date(days[selectedDayIndex]?.dateKey ?? '');
    d.setDate(1);
    return d;
  }, [days, selectedDayIndex]);

  const monthDays = React.useMemo(() => {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const total = last.getDate();
    const pad: { dateKey: string; date: number; empty: boolean }[] = [];
    for (let i = 0; i < startPad; i++) pad.push({ dateKey: '', date: 0, empty: true });
    for (let d = 1; d <= total; d++) {
      const dateKey = new Date(year, month, d).toISOString().slice(0, 10);
      pad.push({ dateKey, date: d, empty: false });
    }
    return pad;
  }, [monthStart]);

  const { width } = Dimensions.get('window');
  const availWidth = width - spacing.lg * 2;
  const monthCellSize = Math.floor((availWidth - spacing.xs * 6) / 7);

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

      <View {...panResponder.panHandlers}>
        {viewMode === 'day' && (
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
        )}

        {viewMode === 'week' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weekRow}
          >
            {weekDays.map((day, i) => {
              const daySess = getSessionsForDateKey(sessions, day.dateKey, days);
              const selected = selectedDayIndex + i === selectedDayIndex;
              return (
                <TouchableOpacity
                  key={day.dateKey}
                  onPress={() => setSelectedDayIndex(selectedDayIndex + i)}
                  style={[styles.weekDayCell, { width: (width - spacing.lg * 2 - spacing.sm * 6) / 7 }]}
                >
                  <Text style={styles.weekDayLabel}>{day.label}</Text>
                  <Text style={[styles.weekDayDate, selected && styles.dayDateSelected]}>{day.date}</Text>
                  <Text style={styles.weekDayCount}>{daySess.length}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {viewMode === 'month' && (
          <View style={styles.monthGrid}>
            {DAY_LABELS.map((l) => (
              <View key={l} style={[styles.monthGridHeader, { width: monthCellSize }]}>
                <Text style={styles.monthGridHeaderText}>{l.slice(0, 2)}</Text>
              </View>
            ))}
            {monthDays.map((cell, i) => {
              if (cell.empty)
                return (
                  <View key={`e-${i}`} style={[styles.monthCell, { width: monthCellSize, height: monthCellSize }]} />
                );
              const daySess = getSessionsForDateKey(sessions, cell.dateKey, days);
              const pct = getBusyPercent(daySess.length);
              return (
                <TouchableOpacity
                  key={cell.dateKey}
                  style={[styles.monthCell, { width: monthCellSize, height: monthCellSize }]}
                  onPress={() => {
                    const idx = days.findIndex((d) => d.dateKey === cell.dateKey);
                    if (idx >= 0) setSelectedDayIndex(idx);
                  }}
                >
                  <Text style={styles.monthCellDate}>{cell.date}</Text>
                  <View
                    style={[
                      styles.monthCellFill,
                      {
                        height: `${pct}%`,
                        backgroundColor: pct > 0 ? colors.Accent1 : 'transparent',
                      },
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={styles.swipeHint}>
          {viewMode === 'day' && 'Swipe down for week view'}
          {viewMode === 'week' && 'Swipe down for month | up for day'}
          {viewMode === 'month' && 'Swipe up for week view'}
        </Text>
      </View>

      <View style={styles.searchWrapper}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="Search" />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === 'day' &&
          daySessions.map((session) => (
            <ScheduleCard
              key={session.id}
              session={session}
              onPress={() => navigation.navigate('SessionForm', { session })}
              onOptionsPress={() => setOptionsSession(session)}
            />
          ))}
        {viewMode === 'week' && (
          <View style={styles.weekColumns}>
            {weekDays.map((day) => (
              <View key={day.dateKey} style={styles.weekColumn}>
                <Text style={styles.weekColumnTitle}>
                  {day.label} {day.date}
                </Text>
                {getSessionsForDateKey(sessions, day.dateKey, days).map((s) => (
                  <ScheduleCard
                    key={s.id}
                    session={s}
                    onPress={() => navigation.navigate('SessionForm', { session: s })}
                    onOptionsPress={() => setOptionsSession(s)}
                  />
                ))}
              </View>
            ))}
          </View>
        )}
        {viewMode === 'month' && (
          <View style={styles.monthDetail}>
            <Text style={styles.monthDetailTitle}>
              {days[selectedDayIndex]?.label} {days[selectedDayIndex]?.date}
            </Text>
            {daySessions.map((session) => (
              <ScheduleCard
                key={session.id}
                session={session}
                onPress={() => navigation.navigate('SessionForm', { session })}
                onOptionsPress={() => setOptionsSession(session)}
              />
            ))}
          </View>
        )}
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
    marginBottom: spacing.xs,
  },
  monthText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  daysScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: 0,
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
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: 0,
  },
  weekDayCell: {
    backgroundColor: colors.Secondary2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  weekDayLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  weekDayDate: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  weekDayCount: {
    fontSize: 14,
    color: colors.Accent1,
    marginTop: spacing.xs,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginBottom: 0,
    gap: spacing.xs,
  },
  monthGridHeader: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthGridHeaderText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  monthCell: {
    borderRadius: 8,
    backgroundColor: colors.Secondary2,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  monthCellDate: {
    position: 'absolute',
    top: 2,
    left: 4,
    fontSize: 11,
    color: colors.text,
    zIndex: 1,
  },
  monthCellFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 8,
  },
  swipeHint: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  searchWrapper: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
  },
  weekColumns: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  weekColumn: {
    flex: 1,
    minWidth: 100,
  },
  weekColumnTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  monthDetail: {
    marginTop: spacing.sm,
  },
  monthDetailTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
});
