import { useMeasurementsStore, type MeasurementEntry } from '../../store/measurementsStore';

const seed = useMeasurementsStore.getState().entries;

afterEach(() => {
  useMeasurementsStore.setState({ entries: seed });
});

const sample: MeasurementEntry[] = [
  { id: 'a', date: '2026-05-01T00:00:00Z', weightKg: 80 },
  { id: 'b', date: '2026-05-08T00:00:00Z', weightKg: 79, waistCm: 85 },
];

describe('useMeasurementsStore', () => {
  it('seeds with mock measurements', () => {
    expect(useMeasurementsStore.getState().entries.length).toBeGreaterThan(0);
  });

  it('addEntry inserts and keeps entries sorted oldest → newest', () => {
    useMeasurementsStore.setState({ entries: [...sample] });
    useMeasurementsStore.getState().addEntry({ date: '2026-05-04T00:00:00Z', weightKg: 79.5 });
    const dates = useMeasurementsStore.getState().entries.map((e) => e.date);
    expect(dates).toEqual([
      '2026-05-01T00:00:00Z',
      '2026-05-04T00:00:00Z',
      '2026-05-08T00:00:00Z',
    ]);
  });

  it('getSeries returns only entries that recorded the field', () => {
    useMeasurementsStore.setState({ entries: [...sample] });
    expect(useMeasurementsStore.getState().getSeries('weightKg')).toEqual([
      { date: '2026-05-01T00:00:00Z', value: 80 },
      { date: '2026-05-08T00:00:00Z', value: 79 },
    ]);
    expect(useMeasurementsStore.getState().getSeries('waistCm')).toEqual([
      { date: '2026-05-08T00:00:00Z', value: 85 },
    ]);
  });

  it('latest returns the most recent entry', () => {
    useMeasurementsStore.setState({ entries: [...sample] });
    expect(useMeasurementsStore.getState().latest()?.id).toBe('b');
  });
});
