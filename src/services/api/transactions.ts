import { dataEnvelope, paginatedEnvelope } from '../../schemas/api/envelope';
import { TransactionSchema, WithdrawalSchema } from '../../schemas/api/models';
import type { Query } from './client';
import { api } from './client';

export interface TransactionInput {
  client_id?: string;
  client_package_id?: string;
  amount: number;
  currency: string;
  method: 'cash' | 'transfer' | 'card' | 'other';
  status: 'paid' | 'pending' | 'canceled';
  paid_at?: string;
  note?: string;
  idempotency_key?: string;
}

export interface WithdrawalInput {
  amount: number;
  currency: string;
  withdrawn_at: string;
  note?: string;
}

export const listTransactions = (query?: Query) =>
  api.get('/transactions', {
    query,
    schema: paginatedEnvelope(TransactionSchema),
  });

export const getTransaction = (id: string) =>
  api.get(`/transactions/${id}`, { schema: dataEnvelope(TransactionSchema) });

export const createTransaction = (body: TransactionInput) =>
  api.post('/transactions', { body, schema: dataEnvelope(TransactionSchema) });

export const updateTransaction = (
  id: string,
  body: Partial<TransactionInput>
) =>
  api.put(`/transactions/${id}`, {
    body,
    schema: dataEnvelope(TransactionSchema),
  });

export const deleteTransaction = (id: string) =>
  api.delete(`/transactions/${id}`);

export const listWithdrawals = (query?: Query) =>
  api.get('/withdrawals', {
    query,
    schema: paginatedEnvelope(WithdrawalSchema),
  });

export const createWithdrawal = (body: WithdrawalInput) =>
  api.post('/withdrawals', { body, schema: dataEnvelope(WithdrawalSchema) });

export const deleteWithdrawal = (id: string) =>
  api.delete(`/withdrawals/${id}`);
