import theme from '../theme';

const { colors } = theme;

import type { TransactionStatus, TransactionType } from '../types';

export const TRANSACTION_TYPES: TransactionType[] = [
  'Training',
  'Subscription',
];

/** Single source of truth for transaction statuses: label, value and accent color. */
export const TRANSACTION_STATUSES: {
  label: string;
  value: TransactionStatus;
  color: string;
}[] = [
  { label: 'Completed', value: 'completed', color: colors.Success },
  { label: 'Pending', value: 'pending', color: colors.Warning },
  { label: 'Canceled', value: 'canceled', color: colors.Error },
];

/** Status → accent color, derived from TRANSACTION_STATUSES. */
export const TRANSACTION_STATUS_COLORS = Object.fromEntries(
  TRANSACTION_STATUSES.map((s) => [s.value, s.color])
) as Record<TransactionStatus, string>;

export const PAYMENT_METHODS = ['Card', 'Cash', 'Bank transfer', 'PayPal'];
