import React from 'react';
import { Alert, Dimensions } from 'react-native';

import type { SessionOptionAction } from '../../../../components/ui';
import { useVerticalSwipeCycle } from '../../../../hooks/ui/useVerticalSwipeCycle';
import { useSessionsStore } from '../../../../store/sessionsStore';
import theme from '../../../../theme';
import type { Session } from '../../../../types';
import { buildDaysFromToday, type ScheduleViewMode } from './scheduleUtils';

const { spacing } = theme;

const VIEW_MODES: readonly ScheduleViewMode[] = ['day', 'week', 'month'];

/**
 * All Schedule calendar state and derivations: selected day, view mode (day/
 * week/month) with vertical-swipe cycling, search, the month grid + week slice,
 * and the session-options handler. Navigation to a session is injected.
 */
export function useSchedule(onOpenSession: (s: Session) => void) {
  const days = React.useMemo(() => buildDaysFromToday(), []);

  const sessions = useSessionsStore((s) => s.sessions);

  const cancelSession = useSessionsStore((s) => s.cancelSession);

  const getSessionsByDateKey = useSessionsStore((s) => s.getSessionsByDateKey);

  const searchSessions = useSessionsStore((s) => s.searchSessions);

  const [selectedDayIndex, setSelectedDayIndex] = React.useState(0);

  const [search, setSearch] = React.useState('');

  const [optionsSession, setOptionsSession] = React.useState<Session | null>(
    null
  );

  const [viewMode, setViewMode] = React.useState<ScheduleViewMode>('day');

  // Month view: the day whose session list is shown — only set when a day is tapped.
  const [monthSelectedKey, setMonthSelectedKey] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    if (viewMode !== 'month') setMonthSelectedKey(null);
  }, [viewMode]);

  const shiftMonth = React.useCallback(
    (dir: 1 | -1) => {
      const current = days[selectedDayIndex];

      if (!current) return;

      const target = new Date(current.year, current.month + dir, 1);

      const idx = days.findIndex(
        (d) => d.year === target.getFullYear() && d.month === target.getMonth()
      );

      if (idx >= 0) {
        setSelectedDayIndex(idx);
        setMonthSelectedKey(null);
      }
    },
    [days, selectedDayIndex]
  );

  const swipeHandlers = useVerticalSwipeCycle(
    VIEW_MODES,
    viewMode,
    setViewMode
  );

  const handleSessionOption = (action: SessionOptionAction) => {
    if (!optionsSession) return;

    if (action === 'edit' || action === 'reschedule') {
      onOpenSession(optionsSession);
    } else if (action === 'cancel') {
      Alert.alert('Cancel session', `Cancel "${optionsSession.title}"?`, [
        { text: 'No', style: 'cancel', onPress: () => setOptionsSession(null) },
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: () => {
            void cancelSession(optionsSession.id);
            setOptionsSession(null);
          },
        },
      ]);

      return;
    }

    setOptionsSession(null);
  };

  const selectMonthDate = (dateKey: string) => {
    setMonthSelectedKey(dateKey);

    const idx = days.findIndex((d) => d.dateKey === dateKey);

    if (idx >= 0) setSelectedDayIndex(idx);
  };

  const selectedDateKey = days[selectedDayIndex]?.dateKey ?? '';

  const qTrim = search.trim();

  const matchedIds = qTrim
    ? new Set(searchSessions(qTrim).map((x) => x.id))
    : null;

  const matchesSearch = (s: Session) => !matchedIds || matchedIds.has(s.id);

  const daySessions =
    getSessionsByDateKey(selectedDateKey).filter(matchesSearch);

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

    const startPad = new Date(year, month, 1).getDay();

    const total = new Date(year, month + 1, 0).getDate();

    const cells: { dateKey: string; date: number; empty: boolean }[] = [];

    for (let i = 0; i < startPad; i++)
      cells.push({ dateKey: '', date: 0, empty: true });
    for (let d = 1; d <= total; d++) {
      cells.push({
        dateKey: new Date(year, month, d).toISOString().slice(0, 10),
        date: d,
        empty: false,
      });
    }

    return cells;
  }, [monthStart]);

  const { width } = Dimensions.get('window');

  const weekCellWidth = (width - spacing.lg * 2 - spacing.sm * 6) / 7;

  const monthCellSize = Math.floor(
    (width - spacing.lg * 2 - spacing.xs * 6) / 7
  );

  return {
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
  };
}
