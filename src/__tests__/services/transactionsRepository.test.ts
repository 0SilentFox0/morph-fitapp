import type { Transaction as ApiTransaction } from '../../schemas/api/models';
import * as transactionsApi from '../../services/api/transactions';
import {
  buildTransactionInput,
  createTransaction,
} from '../../services/repositories/transactionsRepository';

afterEach(() => jest.restoreAllMocks());

describe('buildTransactionInput', () => {
  const base = {
    clientName: 'Bob',
    amount: '$50',
    type: 'Training' as const,
    status: 'completed' as const,
    method: 'Card',
    paidAt: '2026-06-15T10:00:00.000Z',
    currency: 'USD',
  };

  it('parses the amount, stripping a leading $', () => {
    expect(buildTransactionInput(base).amount).toBe(50);
    expect(buildTransactionInput({ ...base, amount: '40' }).amount).toBe(40);
  });

  it('maps the UI "completed" status to the API "paid"', () => {
    expect(buildTransactionInput(base).status).toBe('paid');
    expect(buildTransactionInput({ ...base, status: 'pending' }).status).toBe(
      'pending'
    );
    expect(buildTransactionInput({ ...base, status: 'canceled' }).status).toBe(
      'canceled'
    );
  });

  it('maps UI payment labels to the API method enum', () => {
    expect(buildTransactionInput(base).method).toBe('card');
    expect(buildTransactionInput({ ...base, method: 'Cash' }).method).toBe(
      'cash'
    );
    expect(
      buildTransactionInput({ ...base, method: 'Bank transfer' }).method
    ).toBe('transfer');
    expect(buildTransactionInput({ ...base, method: 'PayPal' }).method).toBe(
      'other'
    );
    expect(buildTransactionInput({ ...base, method: '' }).method).toBe('other');
  });

  it('preserves the client name in the note and carries currency + paid_at', () => {
    const input = buildTransactionInput(base);

    expect(input.note).toContain('Bob');
    expect(input.currency).toBe('USD');
    expect(input.paid_at).toBe('2026-06-15T10:00:00.000Z');
  });

  it('throws on a non-positive amount', () => {
    expect(() => buildTransactionInput({ ...base, amount: '0' })).toThrow();
    expect(() => buildTransactionInput({ ...base, amount: '' })).toThrow();
    expect(() => buildTransactionInput({ ...base, amount: '-5' })).toThrow();
  });
});

describe('createTransaction', () => {
  const apiTx: ApiTransaction = {
    id: 't1',
    trainer_id: 'tr1',
    client_id: null,
    client_package_id: null,
    amount: 50,
    currency: 'USD',
    method: 'card',
    status: 'paid',
    paid_at: '2026-06-15T10:00:00.000Z',
    note: 'Bob',
    created_at: null,
  };

  it('calls the live API with the built input when transactions are ready', async () => {
    const spy = jest
      .spyOn(transactionsApi, 'createTransaction')
      .mockResolvedValue({ data: apiTx } as never);

    const result = await createTransaction({
      clientName: 'Bob',
      amount: '$50',
      type: 'Training',
      status: 'completed',
      method: 'Card',
      paidAt: '2026-06-15T10:00:00.000Z',
      currency: 'USD',
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 50, status: 'paid', method: 'card' })
    );
    expect(result.id).toBe('t1');
  });
});
