import React from 'react';
import { LineChart } from 'react-native-chart-kit';

import { useDateRangePicker } from '../../../hooks/datetime/useDateRangePicker';
import { formatShortDate } from '../../../utils';

type LineData = React.ComponentProps<typeof LineChart>['data'];

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Synthesize a 4-week "month" series from the provided week series so the
 * timeframe selector visibly changes the chart. (Placeholder until the backend
 * exposes real /analytics aggregates.)
 */
export function deriveMonthIncome(incomeData: LineData): LineData {
  const week = incomeData.datasets[0]?.data ?? [];

  const total = week.reduce((sum, n) => sum + n, 0);

  return {
    labels: ['W1', 'W2', 'W3', 'W4'],
    datasets: [
      {
        data: [
          Math.round(total * 0.9),
          Math.round(total * 0.75),
          Math.round(total * 1.05),
          Math.round(total * 0.85),
        ],
      },
    ],
  };
}

/** Synthesize an income series spanning a custom date range (max 7 points). */
export function deriveCustomIncome(
  incomeData: LineData,
  range: { start: Date; end: Date } | null
): LineData {
  if (!range) return incomeData;

  const pattern = incomeData.datasets[0]?.data ?? [100];

  const days = Math.max(
    1,
    Math.round((range.end.getTime() - range.start.getTime()) / DAY_MS) + 1
  );

  const count = Math.min(days, 7);

  const step = days / count;

  const data: number[] = [];

  const labels: string[] = [];

  for (let i = 0; i < count; i++) {
    const dayIndex = Math.floor(i * step);

    const d = new Date(range.start.getTime() + dayIndex * DAY_MS);

    data.push(pattern[dayIndex % pattern.length] ?? 0);
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
  }

  return { labels, datasets: [{ data }] };
}

export interface Timeframe {
  key: string;
  label: string;
  data: LineData;
}

/**
 * Encapsulates the income chart's Week/Month/Custom timeframe state: owns the
 * date-range picker, derives the per-timeframe series, and resolves the active
 * one. Keeps AnalyticsChartCard purely presentational.
 */
export function useIncomeTimeframes(incomeData: LineData) {
  const picker = useDateRangePicker();

  const monthIncome = React.useMemo(
    () => deriveMonthIncome(incomeData),
    [incomeData]
  );

  const customIncome = React.useMemo(
    () => deriveCustomIncome(incomeData, picker.customRange),
    [incomeData, picker.customRange]
  );

  const timeframes: Timeframe[] = [
    { key: 'week', label: 'Week', data: incomeData },
    { key: 'month', label: 'Month', data: monthIncome },
    {
      key: 'custom',
      label: picker.customRange
        ? `${formatShortDate(picker.customRange.start)} – ${formatShortDate(picker.customRange.end)}`
        : 'Custom',
      data: customIncome,
    },
  ];

  const activeIncome = timeframes[picker.timeframe]?.data ?? incomeData;

  return { picker, timeframes, activeIncome };
}
