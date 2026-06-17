import * as meApi from '../../services/api/me';
import {
  type MeasurementEntry,
  useMeasurementsStore,
} from '../../store/measurementsStore';

const seed = useMeasurementsStore.getState().entries;

afterEach(() => {
  jest.restoreAllMocks();
  useMeasurementsStore.setState({ entries: seed, loaded: false });
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
    useMeasurementsStore
      .getState()
      .addEntry({ date: '2026-05-04T00:00:00Z', weightKg: 79.5 });

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

  it('load() pulls from GET /me/measurements and sets loaded; no-ops after', async () => {
    const spy = jest.spyOn(meApi, 'getMyMeasurements').mockResolvedValue({
      data: [
        {
          id: 'r1',
          client_id: 'c1',
          metric_type: 'weight',
          value: 77,
          unit: 'kg',
          measured_at: '2026-06-01T07:00:00Z',
          recorded_by_user_id: 'u1',
        },
      ],
    } as never);

    await useMeasurementsStore.getState().load();

    expect(useMeasurementsStore.getState().loaded).toBe(true);
    expect(useMeasurementsStore.getState().entries).toEqual([
      { id: 'm-2026-06-01', date: '2026-06-01T07:00:00Z', weightKg: 77 },
    ]);

    await useMeasurementsStore.getState().load();
    expect(spy).toHaveBeenCalledTimes(1); // guarded after first success
  });
});
