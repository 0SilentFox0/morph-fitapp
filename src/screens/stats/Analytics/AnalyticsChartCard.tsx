import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import theme from '../../../theme';
const { colors, radius, typography, spacing, createChartConfig } = theme;
import { useIncomeTimeframes } from './useIncomeTimeframes';

const CHART_TABS = ['Income Over Time', 'By Source'];

const chartConfig = createChartConfig();

// chart-kit treats `paddingRight` as the LEFT gutter (y-axis labels live here and
// the plot starts at this x). The 64px default pushes the whole graph far to the
// right of the tabs; 28 keeps room for "$140"-style labels while aligning the plot
// under the Income/Week tabs.
const CHART_LEFT_GUTTER = 28;

type LineData = React.ComponentProps<typeof LineChart>['data'];

export interface AnalyticsChartCardProps {
  incomeData: LineData;
  sourceData: React.ComponentProps<typeof BarChart>['data'];
  chartWidth: number;
}

/** Revenue chart card with Income/By-Source tabs and a working timeframe selector. */
export function AnalyticsChartCard({
  incomeData,
  sourceData,
  chartWidth,
}: AnalyticsChartCardProps) {
  const [chartTab, setChartTab] = React.useState(0);
  const { picker, timeframes, activeIncome } = useIncomeTimeframes(incomeData);

  return (
    <View style={styles.chartCard}>
      <Text style={styles.heading}>Earnings Overview</Text>

      <View style={styles.chartTabs}>
        {CHART_TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            onPress={() => setChartTab(i)}
            style={[styles.chartTab, i === chartTab && styles.chartTabActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.chartTabText, i === chartTab && styles.chartTabTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.timeframeRow}>
        {timeframes.map((tf, i) => {
          const active = i === picker.timeframe;
          const showReset = tf.key === 'custom' && picker.customRange;
          return (
            <TouchableOpacity
              key={tf.key}
              onPress={() => picker.selectTimeframe(i, tf.key === 'custom')}
              style={[styles.timeframeBtn, active && styles.timeframeBtnActive]}
              activeOpacity={0.8}
            >
              <Text
                numberOfLines={1}
                style={[styles.timeframeText, active && styles.timeframeTextActive]}
              >
                {tf.label}
              </Text>
              {showReset && (
                <TouchableOpacity
                  onPress={picker.reset}
                  activeOpacity={0.8}
                  accessibilityLabel="Reset custom range"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close"
                    size={14}
                    color={active ? colors.text : colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {picker.picking && (
        <View style={styles.picker}>
          <Text style={styles.pickerLabel}>
            {picker.picking === 'start' ? 'Select start date' : 'Select end date'}
          </Text>
          <DateTimePicker
            value={picker.draft}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={picker.handleChange}
            themeVariant="dark"
          />
          {Platform.OS === 'ios' && (
            <View style={styles.pickerActions}>
              <TouchableOpacity style={styles.pickerBtn} onPress={picker.cancel}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickerBtn} onPress={() => picker.commit(picker.draft)}>
                <Text style={styles.pickerDoneText}>{picker.picking === 'start' ? 'Next' : 'Done'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <View style={styles.chartContainer}>
        {chartTab === 0 ? (
          <LineChart
            data={activeIncome}
            width={chartWidth}
            height={200}
            yAxisLabel="$"
            yAxisSuffix=""
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        ) : (
          <BarChart
            data={sourceData}
            width={chartWidth}
            height={200}
            yAxisLabel="$"
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={styles.chart}
          />
        )}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
          <Text style={styles.legendText}>Subscription</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary7 }]} />
          <Text style={styles.legendText}>Training</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: colors.neutral1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 18,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  heading: {
    fontSize: typography.sizes.base,
    lineHeight: 24,
    color: colors.neutral9,
  },
  chartTabs: {
    flexDirection: 'row',
  },
  chartTab: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral5,
  },
  chartTabActive: {
    borderBottomColor: colors.accent,
  },
  chartTabText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  chartTabTextActive: {
    color: colors.text,
  },
  timeframeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  timeframeBtn: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.neutral1,
    borderWidth: 1,
    borderColor: colors.neutral5,
  },
  timeframeBtnActive: {
    backgroundColor: colors.neutral3,
    borderColor: colors.text,
  },
  timeframeText: {
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  timeframeTextActive: {
    color: colors.text,
  },
  picker: {
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  pickerLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  pickerCancelText: {
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
  },
  pickerDoneText: {
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
  chartContainer: {
    alignItems: 'flex-start',
  },
  chart: {
    marginVertical: 0,
    borderRadius: radius.sm,
    paddingRight: CHART_LEFT_GUTTER,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
});
