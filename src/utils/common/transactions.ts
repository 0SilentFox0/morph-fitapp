import { Alert, Share } from 'react-native';
import type { Transaction, TransactionStatus } from '../../types';
import type { Transaction as ApiTransaction } from '../../schemas/api/models';
import { formatDate } from '../format/date';

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', EUR: '€', UAH: '₴', GBP: '£' };

/** "$65" / "₴1500" — symbol when known, otherwise the ISO code as a prefix. */
function formatMoney(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  return `${symbol}${amount}`;
}

const STATUS_MAP: Record<ApiTransaction['status'], TransactionStatus> = {
  paid: 'completed',
  pending: 'pending',
  canceled: 'canceled',
};

/**
 * Adapt a backend transaction to the UI row shape rendered by TransactionCard.
 * `clientNameById` resolves the client_id to a display name; unknown/absent ids
 * fall back to a generic label.
 */
export function apiTransactionToUi(
  t: ApiTransaction,
  clientNameById: Record<string, string> = {},
): Transaction {
  return {
    id: t.id,
    clientName: (t.client_id && clientNameById[t.client_id]) || 'Client',
    date: formatDate(t.paid_at ?? t.created_at ?? ''),
    amount: formatMoney(t.amount, t.currency),
    type: t.client_package_id ? 'Subscription' : 'Training',
    status: STATUS_MAP[t.status],
  };
}

/** Serialize transactions to a CSV string (one header row + one row per item). */
export function transactionsToCsv(transactions: Transaction[]): string {
  const header = 'Client,Date,Amount,Type,Status';
  const rows = transactions.map((t) =>
    [t.clientName, t.date, t.amount, t.type, t.status].join(',')
  );
  return [header, ...rows].join('\n');
}

/**
 * Export the given transactions via the native share sheet (CSV payload).
 * Used by the "download" action on the analytics / transactions screens.
 */
export async function exportTransactions(transactions: Transaction[]): Promise<void> {
  try {
    await Share.share({
      title: 'Transactions export',
      message: transactionsToCsv(transactions),
    });
  } catch {
    Alert.alert('Export failed', 'Could not export transactions. Please try again.');
  }
}
