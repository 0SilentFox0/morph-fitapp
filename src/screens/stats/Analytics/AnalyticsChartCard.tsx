import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Card } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';

const CHART_TABS = ['Income Over Time', 'By Source'];
const TIMEFRAME = ['Week', 'Month', 'Custom'];

const chartConfig = {
  backgroundColor: colors.neutral2,
  backgroundGradientFrom: colors.neutral2,
  backgroundGradientTo: colors.neutral1,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(166, 95, 98, ${opacity})`,
  labelColor: () => colors.neutral9,
  style: { borderRadius: radius.sm },
};

export interface AnalyticsChartCardProps {
  incomeData: React.ComponentProps<typeof LineChart>['data'];
  sourceData: React.ComponentProps<typeof BarChart>['data'];
  chartWidth: number;
}

/** Revenue chart card with Income/By-Source tabs and a timeframe selector. */
export function AnalyticsChartCard({
  incomeData,
  sourceData,
  chartWidth,
}: AnalyticsChartCardProps) {
  const [chartTab, setChartTab] = React.useState(0);
  const [timeframe, setTimeframe] = React.useState(0);

  return (
    <Card style={styles.chartCard}>
      <View style={styles.chartTabs}>
        {CHART_TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            onPress={() => setChartTab(i)}
            style={[styles.chartTab, i === chartTab && styles.chartTabActive]}
          >
            <Text style={[styles.chartTabText, i === chartTab && styles.chartTabTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.timeframeRow}>
        {TIMEFRAME.map((t, i) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTimeframe(i)}
            style={[styles.timeframeBtn, i === timeframe && styles.timeframeBtnActive]}
          >
            <Text style={[styles.timeframeText, i === timeframe && styles.timeframeTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.chartContainer}>
        {chartTab === 0 ? (
          <LineChart
            data={incomeData}
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
    </Card>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    marginBottom: spacing.xl,
  },
  chartTabs: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  chartTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  chartTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  chartTabText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  chartTabTextActive: {
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
  timeframeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timeframeBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeframeBtnActive: {
    backgroundColor: colors.neutral1,
    borderColor: colors.accent,
  },
  timeframeText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  timeframeTextActive: {
    color: colors.accent,
  },
  chartContainer: {
    marginTop: spacing.sm,
  },
  chart: {
    marginVertical: 0,
    borderRadius: radius.sm,
  },
});
