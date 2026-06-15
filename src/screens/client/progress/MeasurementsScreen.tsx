import React from 'react';
import { numericDate } from '../../../utils';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { getChartWidth } from '../../../utils/common/layout';
import { LineChart } from 'react-native-chart-kit';
import { ScreenHeader } from '../../../components/layout';
import { Button, SectionTitle } from '../../../components/ui';
import theme from '../../../theme';
const { colors, createChartConfig, radius, typography, spacing } = theme;
import { useMeasurementsStore } from '../../../store/measurementsStore';
import { formatDate } from '../../../utils';

const chartConfig = createChartConfig(1);


export function MeasurementsScreen() {
  const entries = useMeasurementsStore((s) => s.entries);
  const addEntry = useMeasurementsStore((s) => s.addEntry);
  const getSeries = useMeasurementsStore((s) => s.getSeries);
  const latest = useMeasurementsStore((s) => s.latest());

  const [weightInput, setWeightInput] = React.useState('');

  const series = getSeries('weightKg');
  const first = series[0]?.value;
  const current = latest?.weightKg;
  const delta = first != null && current != null ? current - first : null;

  const handleAdd = () => {
    const value = parseFloat(weightInput.replace(',', '.'));
    if (Number.isNaN(value) || value <= 0) return;
    addEntry({ date: new Date().toISOString(), weightKg: Math.round(value * 10) / 10 });
    setWeightInput('');
  };

  const chartWidth = getChartWidth(spacing.md * 2);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Measurements" transparent />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.headlineCard}>
          <Text style={styles.headlineLabel}>Current weight</Text>
          <Text style={styles.headlineValue}>{current != null ? `${current} kg` : '—'}</Text>
          {delta != null && (
            <Text style={[styles.delta, delta <= 0 ? styles.deltaDown : styles.deltaUp]}>
              {delta > 0 ? '+' : ''}
              {delta.toFixed(1)} kg since start
            </Text>
          )}
        </View>

        {series.length >= 2 && (
          <View style={styles.chartCard}>
            <LineChart
              data={{ labels: series.map((p) => numericDate(p.date)), datasets: [{ data: series.map((p) => p.value) }] }}
              width={chartWidth}
              height={200}
              yAxisLabel=""
              yAxisSuffix="kg"
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        <SectionTitle>Log weight</SectionTitle>
        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            value={weightInput}
            onChangeText={setWeightInput}
            keyboardType="decimal-pad"
            placeholder="e.g. 79.5"
            placeholderTextColor={colors.textMuted}
          />
          <Button title="Add" onPress={handleAdd} style={styles.addBtn} />
        </View>

        <SectionTitle>History</SectionTitle>
        <View style={styles.list}>
          {[...entries].reverse().map((e) => (
            <View key={e.id} style={styles.entryRow}>
              <Text style={styles.entryDate}>{formatDate(e.date) || e.date}</Text>
              <Text style={styles.entryWeight}>{e.weightKg} kg</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['2xl'] + spacing.tabBarInset, gap: spacing.md },
  headlineCard: { backgroundColor: colors.cardBg, borderRadius: radius.lg, padding: spacing.lg, gap: 4 },
  headlineLabel: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  headlineValue: { fontSize: typography.sizes['3xl'], fontWeight: typography.weights.bold, color: colors.text },
  delta: { fontSize: typography.sizes.sm },
  deltaDown: { color: colors.Success },
  deltaUp: { color: colors.Warning },
  chartCard: { backgroundColor: colors.neutral1, borderRadius: radius.lg, padding: spacing.md },
  chart: { borderRadius: radius.sm },
  addRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: typography.sizes.base,
  },
  addBtn: { paddingHorizontal: spacing.xl },
  list: { gap: spacing.xs },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  entryDate: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  entryWeight: { fontSize: typography.sizes.base, color: colors.text, fontWeight: typography.weights.semibold },
});
