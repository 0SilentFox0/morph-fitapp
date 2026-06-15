import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useTransactionForm } from '../../screens/stats/useTransactionForm';
import * as transactionsRepository from '../../services/repositories/transactionsRepository';

afterEach(() => jest.restoreAllMocks());

describe('useTransactionForm', () => {
  it('builds a default preview from empty inputs', async () => {
    const { result } = await renderHook(() => useTransactionForm());

    expect(result.current.preview).toMatchObject({
      clientName: 'Client Name',
      amount: '$40',
      type: 'Training',
    });
  });

  it('reflects entered client name and amount, prefixing $', async () => {
    const { result } = await renderHook(() => useTransactionForm());

    await act(async () => {
      result.current.setClientName('Bob');
      result.current.setAmount('50');
    });
    expect(result.current.preview.clientName).toBe('Bob');
    expect(result.current.preview.amount).toBe('$50');
  });

  it('switches to a Subscription preview with session counters', async () => {
    const { result } = await renderHook(() => useTransactionForm());

    await act(async () => result.current.setTypeIndex(1));
    expect(result.current.preview.type).toBe('Subscription');
    expect(result.current.preview.sessionsTotal).toBe(9);
  });

  it('submit() persists via the repository with the entered values', async () => {
    const spy = jest
      .spyOn(transactionsRepository, 'createTransaction')
      .mockResolvedValue({} as never);

    const { result } = await renderHook(() => useTransactionForm());

    await act(async () => {
      result.current.setClientName('Bob');
      result.current.setAmount('50');
    });
    await act(async () => {
      await result.current.submit();
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ clientName: 'Bob', amount: '50' })
    );
    expect(result.current.error).toBeNull();
  });

  it('submit() surfaces an error and rethrows when the write fails', async () => {
    jest
      .spyOn(transactionsRepository, 'createTransaction')
      .mockRejectedValue(new Error('Amount must be a positive number'));

    const { result } = await renderHook(() => useTransactionForm());

    await act(async () => {
      await expect(result.current.submit()).rejects.toThrow();
    });

    await waitFor(() =>
      expect(result.current.error).toBe('Amount must be a positive number')
    );
  });
});
