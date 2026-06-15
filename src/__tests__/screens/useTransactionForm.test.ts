import { act, renderHook } from '@testing-library/react-native';

import { useTransactionForm } from '../../screens/stats/useTransactionForm';

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
});
