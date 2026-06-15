import { buildLineChart } from '../../utils/progress/chartData';

describe('buildLineChart', () => {
  it('returns null for an empty list', () => {
    expect(
      buildLineChart(
        [],
        () => '',
        () => 0
      )
    ).toBeNull();
  });

  it('maps items to labels and a single dataset', () => {
    const items = [
      { date: 'Jan 1', value: 10 },
      { date: 'Jan 2', value: 20 },
    ];

    expect(
      buildLineChart(
        items,
        (i) => i.date,
        (i) => i.value
      )
    ).toEqual({
      labels: ['Jan 1', 'Jan 2'],
      datasets: [{ data: [10, 20] }],
    });
  });
});
