import { createChartConfig } from '../../theme/chartConfig';

describe('createChartConfig', () => {
  it('defaults to 0 decimal places', () => {
    expect(createChartConfig().decimalPlaces).toBe(0);
  });

  it('honours an explicit decimalPlaces (e.g. measurements use 1)', () => {
    expect(createChartConfig(1).decimalPlaces).toBe(1);
  });

  it('exposes the chart-kit colour/label callbacks', () => {
    const cfg = createChartConfig();
    expect(typeof cfg.color).toBe('function');
    expect(cfg.color(0.5)).toContain('rgba(');
    expect(typeof cfg.labelColor).toBe('function');
  });
});
