import {
  TRANSACTION_STATUSES,
  TRANSACTION_STATUS_COLORS,
} from '../../constants/transactions';

describe('transaction constants', () => {
  it('derives the status → color map from TRANSACTION_STATUSES', () => {
    for (const { value, color } of TRANSACTION_STATUSES) {
      expect(TRANSACTION_STATUS_COLORS[value]).toBe(color);
    }
  });

  it('covers every status with a color', () => {
    expect(Object.keys(TRANSACTION_STATUS_COLORS).sort()).toEqual(
      TRANSACTION_STATUSES.map((s) => s.value).sort(),
    );
  });
});
