import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
import { WeekColumns } from './Schedule/WeekColumns';
import { useSchedule } from './Schedule/useSchedule';
import type { Session } from '../../../types';
import theme from '../../../theme';

const { colors, typography, spacing } = theme;

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Schedule'>;

export function ScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const openSession = React.useCallback(
    (s: Session) => navigation.navigate('SessionForm', { session: s }),
    [navigation],
  );

  const {
    days,
    sessions,
    selectedDayIndex,
    setSelectedDayIndex,
    search,
    setSearch,
    viewMode,
    monthSelectedKey,
    optionsSession,
    setOptionsSession,
    getSessionsByDateKey,
    swipeHandlers,
    shiftMonth,
    selectMonthDate,
    handleSessionOption,
    matchesSearch,
    daySessions,
    weekDays,
    monthDays,
    weekCellWidth,
    monthCellSize,
  } = useSchedule(openSession);

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

      <View {...swipeHandlers}>
        {viewMode === 'day' && (
          <DayStrip days={days} selectedIndex={selectedDayIndex} onSelect={setSelectedDayIndex} />
        )}

        {viewMode === 'week' && (
          <WeekStrip
            weekDays={weekDays}
            baseIndex={selectedDayIndex}
            onSelect={setSelectedDayIndex}
            getCount={(dateKey) => getSessionsByDateKey(dateKey).length}
            cellWidth={weekCellWidth}
          />
        )}

        {viewMode === 'month' && (
          <MonthGrid
            monthDays={monthDays}
            cellSize={monthCellSize}
            getCount={(dateKey) => getSessionsByDateKey(dateKey).length}
            onSelectDate={selectMonthDate}
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
                  onPress={openSession}
                  onOptionsPress={setOptionsSession}
                />
              )))}
        {viewMode === 'week' && (
          <WeekColumns
            weekDays={weekDays}
            getSessions={(dateKey) => getSessionsByDateKey(dateKey).filter(matchesSearch)}
            onSessionPress={openSession}
          />
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
                        onPress={openSession}
                        onOptionsPress={setOptionsSession}
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
