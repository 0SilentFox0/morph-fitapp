import { colors } from './colors';
import { radius } from './radius';

/**
 * Shared react-native-chart-kit config used by every chart in the app
 * (income, progress, measurements, muscle load, …). Previously copy-pasted into
 * 7 screens — keep it here so the chart styling stays consistent.
 *
 * @param decimalPlaces y-axis precision (0 for counts/money, 1 for measurements).
 */
export function createChartConfig(decimalPlaces = 0) {
  return {
    backgroundColor: colors.neutral1,
    backgroundGradientFrom: colors.neutral1,
    backgroundGradientTo: colors.neutral1,
    decimalPlaces,
    color: (opacity = 1) => `rgba(174, 69, 31, ${opacity})`,
    labelColor: () => colors.neutral7,
    propsForBackgroundLines: { stroke: colors.neutral5, strokeDasharray: '' },
    style: { borderRadius: radius.sm },
  };
}
