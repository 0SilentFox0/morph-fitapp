import { mockAnalyticsData } from '../../mocks';
import { loadBusinessAnalytics } from '../../services/analyticsService';
import * as clientsApi from '../../services/api/clients';
import * as transactionsApi from '../../services/api/transactions';

const apiTx = {
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

afterEach(() => jest.restoreAllMocks());

describe('loadBusinessAnalytics', () => {
  it('returns live transactions with resolved client names, and mock aggregates', async () => {
    jest
      .spyOn(transactionsApi, 'listTransactions')
      .mockResolvedValue({ data: [apiTx] } as never);
    jest.spyOn(clientsApi, 'listClients').mockResolvedValue({
      data: [{ id: 'c1', name: 'Sarah Mitchell' }],
    } as never);

    const result = await loadBusinessAnalytics();

    expect(transactionsApi.listTransactions).toHaveBeenCalled();
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]!.clientName).toBe('Sarah Mitchell');
    expect(result.transactions[0]!.amount).toBe('$65');
    // Aggregates have no endpoint yet → mock values.
    expect(result.totals.month).toBe(mockAnalyticsData.totalEarningsPerMonth);
    expect(result.revenueBySource).toEqual(mockAnalyticsData.revenueBySource);
  });
});
