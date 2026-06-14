import { Alert, Share } from 'react-native';
import type { Transaction } from '../types';

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
