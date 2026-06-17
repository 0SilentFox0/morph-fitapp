import type { BodyMeasurement } from '../../schemas/api/models';
import * as meApi from '../../services/api/me';
import {
  apiMeasurementsToUi,
  loadClientMeasurements,
  recordClientMeasurement,
} from '../../services/repositories/measurementsRepository';

afterEach(() => jest.restoreAllMocks());

const row = (
  metric_type: BodyMeasurement['metric_type'],
  value: number,
  measured_at: string,
  id = `${metric_type}-${measured_at}`
): BodyMeasurement =>
  ({
    id,
    client_id: 'c1',
    metric_type,
    value,
    unit: metric_type === 'weight' ? 'kg' : 'cm',
    measured_at,
    recorded_by_user_id: 'u1',
    created_at: measured_at,
  }) as BodyMeasurement;

describe('apiMeasurementsToUi', () => {
  it('groups a day’s metrics into one entry and maps biceps → arm', () => {
    const ui = apiMeasurementsToUi([
      row('weight', 80, '2026-05-08T07:00:00Z'),
      row('waist', 85, '2026-05-08T07:01:00Z'),
      row('biceps', 35, '2026-05-08T07:02:00Z'),
    ]);

    expect(ui).toHaveLength(1);
    expect(ui[0]).toMatchObject({ weightKg: 80, waistCm: 85, armCm: 35 });
  });

  it('drops metrics without a UI field (height/hips/thigh/body_fat_percent)', () => {
    const ui = apiMeasurementsToUi([
      row('weight', 80, '2026-05-08T07:00:00Z'),
      row('height', 180, '2026-05-08T07:00:00Z'),
      row('hips', 95, '2026-05-08T07:00:00Z'),
      row('thigh', 55, '2026-05-08T07:00:00Z'),
      row('body_fat_percent', 18, '2026-05-08T07:00:00Z'),
    ]);

    expect(ui[0]).toEqual({
      id: 'm-2026-05-08',
      date: '2026-05-08T07:00:00Z',
      weightKg: 80,
    });
  });

  it('returns one entry per day, sorted oldest → newest', () => {
    const ui = apiMeasurementsToUi([
      row('weight', 79, '2026-05-15T07:00:00Z'),
      row('weight', 80, '2026-05-01T07:00:00Z'),
    ]);

    expect(ui.map((e) => e.weightKg)).toEqual([80, 79]);
  });
});

describe('loadClientMeasurements', () => {
  it('fetches GET /me/measurements and adapts the rows', async () => {
    const spy = jest.spyOn(meApi, 'getMyMeasurements').mockResolvedValue({
      data: [row('weight', 81, '2026-06-01T07:00:00Z')],
    } as never);

    const entries = await loadClientMeasurements();

    expect(spy).toHaveBeenCalledWith({ per_page: 200 });
    expect(entries).toEqual([
      { id: 'm-2026-06-01', date: '2026-06-01T07:00:00Z', weightKg: 81 },
    ]);
  });
});

describe('recordClientMeasurement', () => {
  it('POSTs one request per recorded metric with the right type + unit', async () => {
    const spy = jest
      .spyOn(meApi, 'recordMyMeasurement')
      .mockResolvedValue({} as never);

    await recordClientMeasurement({
      date: '2026-06-10T00:00:00Z',
      weightKg: 82,
      chestCm: 100,
      waistCm: 84,
      armCm: 36,
    });

    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy.mock.calls.map(([input]) => input)).toEqual(
      expect.arrayContaining([
        { metric_type: 'weight', value: 82, unit: 'kg', measured_at: '2026-06-10T00:00:00Z' },
        { metric_type: 'chest', value: 100, unit: 'cm', measured_at: '2026-06-10T00:00:00Z' },
        { metric_type: 'waist', value: 84, unit: 'cm', measured_at: '2026-06-10T00:00:00Z' },
        { metric_type: 'biceps', value: 36, unit: 'cm', measured_at: '2026-06-10T00:00:00Z' },
      ])
    );
  });

  it('POSTs only the fields that are present', async () => {
    const spy = jest
      .spyOn(meApi, 'recordMyMeasurement')
      .mockResolvedValue({} as never);

    await recordClientMeasurement({ date: '2026-06-10T00:00:00Z', weightKg: 82 });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({
      metric_type: 'weight',
      value: 82,
      unit: 'kg',
      measured_at: '2026-06-10T00:00:00Z',
    });
  });
});
