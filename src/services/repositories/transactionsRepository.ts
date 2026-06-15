import { apiReadiness } from '../../config/apiReadiness';
import type { Transaction as ApiTransaction } from '../../schemas/api/models';
import type { TransactionStatus, TransactionType } from '../../types';
import type { TransactionInput } from '../api/transactions';
import * as transactionsApi from '../api/transactions';
import { withMockFallback } from '../mockFallback';

/** Raw form values collected by the Add Transaction screen. */
export interface TransactionFormValues {
  clientName: string;
  amount: string;
  type: TransactionType;
  status: TransactionStatus;
  /** One of PAYMENT_METHODS labels ("Card", "Cash", "Bank transfer", "PayPal"). */
  method: string;
  /** ISO timestamp the payment is recorded against. */
  paidAt: string;
  /** Trainer's account currency (e.g. "USD"). */
  currency: string;
}

const STATUS_MAP: Record<TransactionStatus, TransactionInput['status']> = {
  completed: 'paid',
  pending: 'pending',
  canceled: 'canceled',
};

const METHOD_MAP: Record<string, TransactionInput['method']> = {
  Card: 'card',
  Cash: 'cash',
  'Bank transfer': 'transfer',
  PayPal: 'other',
};

/**
 * Adapt the UI form to the backend `TransactionInput`. Pure + validated so the
 * screen can `await` a single call and trust that a rejected promise means
 * nothing was sent.
 *
 * Notes / known limitations until a client picker lands:
 * - `clientName` is free text with no id, so it is preserved in `note` rather
 *   than `client_id`.
 * - the UI `type` (Training/Subscription) has no backend column yet, so it is
 *   not sent; it only drives the local preview.
 */
export function buildTransactionInput(
  form: TransactionFormValues
): TransactionInput {
  const amount = Number(form.amount.replace(/[^0-9.-]/g, ''));

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  return {
    amount,
    currency: form.currency,
    method: METHOD_MAP[form.method] ?? 'other',
    status: STATUS_MAP[form.status],
    paid_at: form.paidAt,
    note: form.clientName.trim() || undefined,
  };
}

/**
 * Persist a transaction. Lives behind the `transactions` readiness flag; the
 * mock branch echoes the input back so the form behaves identically before the
 * endpoint is deployed (it is already live, so this is mostly for tests/offline).
 */
export async function createTransaction(
  form: TransactionFormValues
): Promise<ApiTransaction> {
  const input = buildTransactionInput(form);

  return withMockFallback(
    apiReadiness.transactions,
    async () => {
      const res = await transactionsApi.createTransaction(input);

      return res.data;
    },
    () => ({
      id: `mock-${input.paid_at ?? ''}`,
      trainer_id: 'mock-trainer',
      client_id: null,
      client_package_id: null,
      amount: input.amount,
      currency: input.currency,
      method: input.method,
      status: input.status,
      paid_at: input.paid_at ?? null,
      note: input.note ?? null,
      created_at: null,
    })
  );
}
