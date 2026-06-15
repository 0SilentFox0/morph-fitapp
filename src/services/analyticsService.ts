import { apiReadiness } from '../config/apiReadiness';
import { mockAnalyticsData, mockTransactions } from '../mocks';
import type { Transaction } from '../types';
import { apiTransactionToUi } from '../utils/common/transactions';
import * as clientsApi from './api/clients';
import * as transactionsApi from './api/transactions';
import { withMockFallback } from './mockFallback';

export interface BusinessAnalytics {
  totals: { month: number; subscriptions: number; trainings: number };
  incomeData: typeof mockAnalyticsData.incomeOverTime;
  revenueBySource: typeof mockAnalyticsData.revenueBySource;
  transactions: Transaction[];
}

/**
 * Load the trainer business-analytics dashboard.
 *
 * Transactions come from the live `/transactions` endpoint (with client names
 * resolved from `/clients`). The aggregate widgets (earnings, income chart,
 * revenue split) have no `/analytics/*` endpoint yet, so they fall back to mock
 * data — flip `apiReadiness.analytics` once the backend ships them.
 */
export async function loadBusinessAnalytics(): Promise<BusinessAnalytics> {
  const transactions = await withMockFallback(
    apiReadiness.transactions,
    async () => {
      const [txRes, clientsRes] = await Promise.all([
        transactionsApi.listTransactions({ per_page: 50 }),
        clientsApi.listClients({ per_page: 100 }),
      ]);

      const nameById: Record<string, string> = {};

      for (const c of clientsRes.data) nameById[c.id] = c.name;

      return txRes.data.map((t) => apiTransactionToUi(t, nameById));
    },
    () => mockTransactions
  );

  const aggregates = await withMockFallback(
    apiReadiness.analytics,
    () => Promise.reject(new Error('analytics endpoint not implemented')),
    () => mockAnalyticsData
  );

  return {
    totals: {
      month: aggregates.totalEarningsPerMonth,
      subscriptions: aggregates.fromSubscriptions,
      trainings: aggregates.fromTrainings,
    },
    incomeData: aggregates.incomeOverTime,
    revenueBySource: aggregates.revenueBySource,
    transactions,
  };
}
