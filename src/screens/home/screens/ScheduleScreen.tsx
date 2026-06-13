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
import type { HomeStackParamList } from '../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../../components/layout';
import { ScheduleCard, SessionOptionsMenu, SearchInput, EmptyState } from '../../../components/ui';
import { MonthSelector } from './Schedule/MonthSelector';
import { DayStrip } from './Schedule/DayStrip';
import { WeekStrip } from './Schedule/WeekStrip';
import { MonthGrid } from './Schedule/MonthGrid';
import { buildDaysFromToday, type ScheduleViewMode } from './Schedule/scheduleUtils';
import type { SessionOptionAction } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme';
import { useSessionsStore } from '../../../store/sessionsStore';
import type { Session, SessionStatus } from '../../../mocks';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Schedule'>;

const SWIPE_THRESHOLD = 60;

const WEEK_STATUS_BAR: Record<SessionStatus, string> = {
  completed: colors.Success,
  pending: colors.Warning,
  canceled: colors.error6,
};

/** Compact session card used inside the week view's per-day columns. */
function WeekMiniCard({
  session,
  onPress,
}: {
  session: Session;
  onPress: (s: Session) => void;
}) {
  return (
    <TouchableOpacity style={styles.miniCard} activeOpacity={0.8} onPress={() => onPress(session)}>
      <View style={[styles.miniBar, { backgroundColor: WEEK_STATUS_BAR[session.status] }]} />
      <View style={styles.miniBody}>
        <Text style={styles.miniTitle} numberOfLines={2}>
          {session.title}
        </Text>
        <Text style={styles.miniTime}>{session.time}</Text>
        <View style={styles.miniTypeTag}>
          <Text style={styles.miniTypeText}>{session.type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function ScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const days = React.useMemo(() => buildDaysFromToday(), []);
  const sessions = useSessionsStore((s) => s.sessions);
  const deleteSession = useSessionsStore((s) => s.deleteSession);
  const getSessionsByDateKey = useSessionsStore((s) => s.getSessionsByDateKey);
  const searchSessions = useSessionsStore((s) => s.searchSessions);
  const [selectedDayIndex, setSelectedDayIndex] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [optionsSession, setOptionsSession] = React.useState<Session | null>(null);
  const [viewMode, setViewMode] = React.useState<ScheduleViewMode>('day');
  // Month view: the day whose session list is shown — only set when a day is tapped.
  const [monthSelectedKey, setMonthSelectedKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (viewMode !== 'month') setMonthSelectedKey(null);
  }, [viewMode]);

  const handleSessionPress = React.useCallback(
    (s: Session) => navigation.navigate('SessionForm', { session: s }),
    [navigation]
  );
  const handleSessionOptions = React.useCallback((s: Session) => setOptionsSession(s), []);

  const shiftMonth = React.useCallback(
    (dir: 1 | -1) => {
      const current = days[selectedDayIndex];
      if (!current) return;
      // Normalize to the 1st of the target month, then find the first matching day.
      const target = new Date(current.year, current.month + dir, 1);
      const targetYear = target.getFullYear();
      const targetMonth = target.getMonth();
      const idx = days.findIndex((d) => d.year === targetYear && d.month === targetMonth);
      if (idx >= 0) {
        setSelectedDayIndex(idx);
        setMonthSelectedKey(null);
      }
    },
    [days, selectedDayIndex]
  );

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
      Alert.alert('Cancel session', `Cancel "${optionsSession.title}"?`, [
        { text: 'No', style: 'cancel', onPress: () => setOptionsSession(null) },
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: () => {
            deleteSession(optionsSession.id);
            setOptionsSession(null);
          },
        },
      ]);
      return;
    }
    setOptionsSession(null);
  };

  const selectedDateKey = days[selectedDayIndex]?.dateKey ?? '';

  const qTrim = search.trim();
  const matchedIds = qTrim ? new Set(searchSessions(qTrim).map((x) => x.id)) : null;
  const matchesSearch = (s: Session) => !matchedIds || matchedIds.has(s.id);
  const daySessions = getSessionsByDateKey(selectedDateKey).filter(matchesSearch);

  const weekDays = React.useMemo(
    () => days.slice(selectedDayIndex, selectedDayIndex + 7),
    [days, selectedDayIndex]
  );

  const monthStart = React.useMemo(() => {
    const sel = days[selectedDayIndex];
    return sel ? new Date(sel.year, sel.month, 1) : new Date();
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

  const renderDayEmptyState = () => (
    <EmptyState
      icon="calendar-outline"
      title="No sessions this day"
      subtitle={
        search.trim()
          ? 'Try a different search or pick another date.'
          : sessions.length === 0
            ? 'Add your first session from the + button.'
            : 'Add a session or choose another date.'
      }
    />
  );

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

      <MonthSelector
        dateKey={days[selectedDayIndex]?.dateKey ?? ''}
        onPrev={() => shiftMonth(-1)}
        onNext={() => shiftMonth(1)}
      />

      <View {...panResponder.panHandlers}>
        {viewMode === 'day' && (
          <DayStrip days={days} selectedIndex={selectedDayIndex} onSelect={setSelectedDayIndex} />
        )}

        {viewMode === 'week' && (
          <WeekStrip
            weekDays={weekDays}
            baseIndex={selectedDayIndex}
            onSelect={setSelectedDayIndex}
            getCount={(dateKey) => getSessionsByDateKey(dateKey).length}
            cellWidth={(width - spacing.lg * 2 - spacing.sm * 6) / 7}
          />
        )}

        {viewMode === 'month' && (
          <MonthGrid
            monthDays={monthDays}
            cellSize={monthCellSize}
            getCount={(dateKey) => getSessionsByDateKey(dateKey).length}
            onSelectDate={(dateKey) => {
              setMonthSelectedKey(dateKey);
              const idx = days.findIndex((d) => d.dateKey === dateKey);
              if (idx >= 0) setSelectedDayIndex(idx);
            }}
          />
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
          (daySessions.length === 0
            ? renderDayEmptyState()
            : daySessions.map((session) => (
                <ScheduleCard
                  key={session.id}
                  session={session}
                  onPress={handleSessionPress}
                  onOptionsPress={handleSessionOptions}
                />
              )))}
        {viewMode === 'week' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weekColumns}
          >
            {weekDays.map((day) => {
              const sess = getSessionsByDateKey(day.dateKey).filter(matchesSearch);
              return (
                <View key={day.dateKey} style={styles.weekColumn}>
                  <Text style={styles.weekColumnTitle}>
                    {day.label} {day.date}
                  </Text>
                  {sess.length === 0 ? (
                    <Text style={styles.weekColumnEmpty}>No sessions</Text>
                  ) : (
                    sess.map((s) => (
                      <WeekMiniCard key={s.id} session={s} onPress={handleSessionPress} />
                    ))
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
        {viewMode === 'month' &&
          monthSelectedKey &&
          (() => {
            const selDay = days.find((d) => d.dateKey === monthSelectedKey);
            const monthSessions = getSessionsByDateKey(monthSelectedKey).filter(matchesSearch);
            return (
              <View style={styles.monthDetail}>
                <Text style={styles.monthDetailTitle}>
                  {selDay ? `${selDay.label} ${selDay.date}` : monthSelectedKey}
                </Text>
                {monthSessions.length === 0
                  ? renderDayEmptyState()
                  : monthSessions.map((session) => (
                      <ScheduleCard
                        key={session.id}
                        session={session}
                        onPress={handleSessionPress}
                        onOptionsPress={handleSessionOptions}
                      />
                    ))}
              </View>
            );
          })()}
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
    backgroundColor: 'transparent',
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
    paddingRight: spacing.lg,
  },
  weekColumn: {
    width: 160,
  },
  weekColumnTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  weekColumnEmpty: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  miniCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral2,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  miniBar: {
    width: 2,
  },
  miniBody: {
    flex: 1,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  miniTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text,
    lineHeight: 16,
  },
  miniTime: {
    fontSize: 11,
    color: colors.neutral9,
  },
  miniTypeTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  miniTypeText: {
    fontSize: 11,
    color: colors.text,
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
