/**
 * Helpers for shaping data into react-native-chart-kit's line-chart format.
 */

export interface LineChartData {
  labels: string[];
  datasets: { data: number[] }[];
}

/**
 * Build a single-series line chart from a list, mapping each item to a label
 * and a numeric value. Returns null for an empty list so callers can render an
 * empty state instead of an empty chart.
 */
export function buildLineChart<T>(
  items: T[],
  label: (item: T) => string,
  value: (item: T) => number
): LineChartData | null {
  if (items.length === 0) return null;

  return {
    labels: items.map(label),
    datasets: [{ data: items.map(value) }],
  };
}
