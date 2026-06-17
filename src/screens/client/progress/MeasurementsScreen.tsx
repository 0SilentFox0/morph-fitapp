import React from 'react';
import { LineChart } from 'react-native-chart-kit';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ScreenHeader } from '../../../components/layout';
import { Button, SectionTitle } from '../../../components/ui';
import theme from '../../../theme';
import { numericDate } from '../../../utils';
import { getChartWidth } from '../../../utils/common/layout';

const { colors, createChartConfig, radius, typography, spacing } = theme;

import { useAppStore } from '../../../store/appStore';
import { useMeasurementsStore } from '../../../store/measurementsStore';
import { formatDate } from '../../../utils';
import {
  displayToKg,
  kgToDisplay,
  weightUnitLabel,
} from '../../../utils/format/units';

const chartConfig = createChartConfig(1);

/** Parse a positive number from a free-text field; null if blank/invalid. */
function parsePositive(text: string): number | null {
  const value = parseFloat(text.replace(',', '.'));

  return Number.isNaN(value) || value <= 0 ? null : value;
}

export function MeasurementsScreen() {
  const entries = useMeasurementsStore((s) => s.entries);

  const loadMeasurements = useMeasurementsStore((s) => s.load);

  const addEntry = useMeasurementsStore((s) => s.addEntry);

  // Pull the client's own measurements from GET /me/measurements once on mount.
  React.useEffect(() => {
    void loadMeasurements().catch(() => {});
  }, [loadMeasurements]);

  const getSeries = useMeasurementsStore((s) => s.getSeries);

  const latest = useMeasurementsStore((s) => s.latest());

  const units = useAppStore((s) => s.units);

  const unitLabel = weightUnitLabel(units);

  const [weightInput, setWeightInput] = React.useState('');

  const [chestInput, setChestInput] = React.useState('');

  const [waistInput, setWaistInput] = React.useState('');

  const [armInput, setArmInput] = React.useState('');

  const [error, setError] = React.useState<string | null>(null);

  const series = getSeries('weightKg');

  const first = series[0]?.value;

  const current = latest?.weightKg;

  const delta = first != null && current != null ? current - first : null;

  const handleAdd = () => {
    setError(null);

    const weight = parsePositive(weightInput);

    const chest = parsePositive(chestInput);

    const waist = parsePositive(waistInput);

    const arm = parsePositive(armInput);

    if (weight == null && chest == null && waist == null && arm == null) {
      setError('Enter at least one measurement.');

      return;
    }

    addEntry({
      date: new Date().toISOString(),
      // Weight is entered in the user's unit but always stored in kg.
      ...(weight != null
        ? { weightKg: Math.round(displayToKg(weight, units) * 10) / 10 }
        : {}),
      ...(chest != null ? { chestCm: chest } : {}),
      ...(waist != null ? { waistCm: waist } : {}),
      ...(arm != null ? { armCm: arm } : {}),
    });
    setWeightInput('');
    setChestInput('');
    setWaistInput('');
    setArmInput('');
  };

  const chartWidth = getChartWidth(spacing.md * 2);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Measurements" transparent />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.headlineCard}>
          <Text style={styles.headlineLabel}>Current weight</Text>
          <Text style={styles.headlineValue}>
            {current != null
              ? `${kgToDisplay(current, units)} ${unitLabel}`
              : '—'}
          </Text>
          {delta != null && (
            <Text
              style={[
                styles.delta,
                delta <= 0 ? styles.deltaDown : styles.deltaUp,
              ]}
            >
              {delta > 0 ? '+' : ''}
              {kgToDisplay(delta, units).toFixed(1)} {unitLabel} since start
            </Text>
          )}
        </View>

        {series.length >= 2 && (
          <View style={styles.chartCard}>
            <LineChart
              data={{
                labels: series.map((p) => numericDate(p.date)),
                datasets: [
                  { data: series.map((p) => kgToDisplay(p.value, units)) },
                ],
              }}
              width={chartWidth}
              height={200}
              yAxisLabel=""
              yAxisSuffix={unitLabel}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        <SectionTitle>Log measurements</SectionTitle>
        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            value={weightInput}
            onChangeText={setWeightInput}
            keyboardType="decimal-pad"
            placeholder={`Weight (${unitLabel})`}
            placeholderTextColor={colors.textMuted}
          />
          <Button title="Add" onPress={handleAdd} style={styles.addBtn} />
        </View>
        <View style={styles.measuresRow}>
          <TextInput
            style={[styles.input, styles.measureInput]}
            value={chestInput}
            onChangeText={setChestInput}
            keyboardType="decimal-pad"
            placeholder="Chest (cm)"
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={[styles.input, styles.measureInput]}
            value={waistInput}
            onChangeText={setWaistInput}
            keyboardType="decimal-pad"
            placeholder="Waist (cm)"
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={[styles.input, styles.measureInput]}
            value={armInput}
            onChangeText={setArmInput}
            keyboardType="decimal-pad"
            placeholder="Arm (cm)"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <SectionTitle>History</SectionTitle>
        <View style={styles.list}>
          {[...entries].reverse().map((e) => (
            <View key={e.id} style={styles.entryRow}>
              <Text style={styles.entryDate}>
                {formatDate(e.date) || e.date}
              </Text>
              <Text style={styles.entryWeight}>
                {[
                  e.weightKg != null
                    ? `${kgToDisplay(e.weightKg, units)} ${unitLabel}`
                    : null,
                  e.chestCm != null ? `chest ${e.chestCm}` : null,
                  e.waistCm != null ? `waist ${e.waistCm}` : null,
                  e.armCm != null ? `arm ${e.armCm}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
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
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
    gap: spacing.md,
  },
  headlineCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 4,
  },
  headlineLabel: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  headlineValue: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  delta: { fontSize: typography.sizes.sm },
  deltaDown: { color: colors.Success },
  deltaUp: { color: colors.Warning },
  chartCard: {
    backgroundColor: colors.neutral1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  chart: { borderRadius: radius.sm },
  addRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  measuresRow: { flexDirection: 'row', gap: spacing.sm },
  measureInput: { flex: 1, paddingVertical: spacing.sm },
  error: { color: colors.Error, fontSize: typography.sizes.sm },
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
  entryWeight: {
    fontSize: typography.sizes.base,
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
});
