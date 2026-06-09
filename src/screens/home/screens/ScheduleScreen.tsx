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
import { useSessionsStore } from '../../../store/sessionsStore';
import type { Session } from '../../../mocks';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Schedule'>;

const SWIPE_THRESHOLD = 60;

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

  const handleSessionPress = React.useCallback(
    (s: Session) => navigation.navigate('SessionForm', { session: s }),
    [navigation]
  );
  const handleSessionOptions = React.useCallback((s: Session) => setOptionsSession(s), []);

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

  const onDayForSelected = getSessionsByDateKey(selectedDateKey);
  const qTrim = search.trim();
  const daySessions = !qTrim
    ? onDayForSelected
    : onDayForSelected.filter((s) => new Set(searchSessions(qTrim).map((x) => x.id)).has(s.id));

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

      <MonthSelector dateKey={days[selectedDayIndex]?.dateKey ?? ''} />

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
          <View style={styles.weekColumns}>
            {weekDays.map((day) => (
              <View key={day.dateKey} style={styles.weekColumn}>
                <Text style={styles.weekColumnTitle}>
                  {day.label} {day.date}
                </Text>
                {getSessionsByDateKey(day.dateKey).map((s) => (
                  <ScheduleCard
                    key={s.id}
                    session={s}
                    onPress={handleSessionPress}
                    onOptionsPress={handleSessionOptions}
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
            {daySessions.length === 0
              ? renderDayEmptyState()
              : daySessions.map((session) => (
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
