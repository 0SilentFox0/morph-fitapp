/** Payment / transaction models (trainer business stats). */

export type TransactionStatus = 'completed' | 'pending' | 'canceled';
export type TransactionType = 'Training' | 'Subscription';

export interface Transaction {
  id: string;
  clientName: string;
  date: string;
  amount: string;
  type: TransactionType;
  status: TransactionStatus;
  /** Sessions used / total — shown as a progress bar for Subscription transactions. */
  sessionsUsed?: number;
  sessionsTotal?: number;
}
