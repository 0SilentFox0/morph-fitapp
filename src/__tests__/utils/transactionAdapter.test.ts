import { apiTransactionToUi } from '../../utils/common/transactions';
import type { Transaction as ApiTransaction } from '../../schemas/api/models';

const base: ApiTransaction = {
  id: 't1',
  trainer_id: 'tr1',
  client_id: 'c1',
  client_package_id: null,
  amount: 65,
  currency: 'USD',
  method: 'card',
  status: 'paid',
  paid_at: '2025-12-07T10:00:00Z',
  note: null,
  created_at: '2025-12-07T10:00:00Z',
};

describe('apiTransactionToUi', () => {
  it('maps a paid one-off payment to a completed Training row', () => {
    const ui = apiTransactionToUi(base, { c1: 'Sarah Mitchell' });
    expect(ui).toMatchObject({
      id: 't1',
      clientName: 'Sarah Mitchell',
      amount: '$65',
      type: 'Training',
      status: 'completed',
    });
    expect(ui.date).toContain('Dec 7, 2025');
  });

  it('maps a package payment to a Subscription row and keeps pending status', () => {
    const ui = apiTransactionToUi(
      { ...base, client_package_id: 'p1', status: 'pending' },
      { c1: 'Sarah Mitchell' },
    );
    expect(ui.type).toBe('Subscription');
    expect(ui.status).toBe('pending');
  });

  it('falls back to a generic client label when the id is unknown', () => {
    expect(apiTransactionToUi(base, {}).clientName).toBe('Client');
    expect(apiTransactionToUi({ ...base, client_id: null }).clientName).toBe('Client');
  });

  it('formats non-USD currency with its symbol', () => {
    expect(apiTransactionToUi({ ...base, amount: 1500, currency: 'UAH' }, {}).amount).toBe('₴1500');
  });
});
