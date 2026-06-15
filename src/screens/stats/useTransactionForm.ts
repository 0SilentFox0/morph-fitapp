import React from 'react';

import {
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
} from '../../constants/transactions';
import { useDateTimePicker } from '../../hooks/datetime/useDateTimePicker';
import { useDisclosure } from '../../hooks/ui/useDisclosure';
import { createTransaction } from '../../services/repositories/transactionsRepository';
import { useAuthStore } from '../../store/authStore';
import type { Transaction, TransactionType } from '../../types';
import { formatDate } from '../../utils';

/** Merge the separate date + time pickers into one timestamp. */
function mergeDateTime(date: Date, time: Date): Date {
  const merged = new Date(date);

  merged.setHours(time.getHours(), time.getMinutes(), 0, 0);

  return merged;
}

/**
 * State + live preview for the Add Transaction form, separated from its layout.
 * Owns the client/amount/type/status/method fields and the date/time pickers,
 * and derives the TransactionCard preview shown under the form.
 */
export function useTransactionForm() {
  const [clientName, setClientName] = React.useState('');

  const [typeIndex, setTypeIndex] = React.useState(0);

  const [amount, setAmount] = React.useState('');

  const [date, setDate] = React.useState(new Date());

  const [time, setTime] = React.useState(new Date());

  const [statusIndex, setStatusIndex] = React.useState(0);

  const [method, setMethod] = React.useState('');

  const methodMenu = useDisclosure();

  const datePicker = useDateTimePicker(setDate);

  const timePicker = useDateTimePicker(setTime);

  const [submitting, setSubmitting] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);

  const currency = useAuthStore((s) => s.user?.currency) ?? 'USD';

  const type = TRANSACTION_TYPES[typeIndex] as TransactionType;

  const status = TRANSACTION_STATUSES[statusIndex];

  /**
   * Persist the transaction. Resolves only once the write succeeds, so the
   * caller can safely navigate to the success screen; rejects (and surfaces
   * `error`) otherwise — no more fake "saved" navigation.
   */
  const submit = React.useCallback(async () => {
    setError(null);
    setSubmitting(true);
    try {
      await createTransaction({
        clientName,
        amount,
        type,
        status: status?.value ?? 'completed',
        method,
        paidAt: mergeDateTime(date, time).toISOString(),
        currency,
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Could not save the transaction';

      setError(message);
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, [clientName, amount, type, status, method, date, time, currency]);

  const preview: Transaction = {
    id: 'preview',
    clientName: clientName || 'Client Name',
    date: formatDate(date),
    amount: amount ? (amount.startsWith('$') ? amount : `$${amount}`) : '$40',
    type,
    status: status?.value ?? 'completed',
    ...(typeIndex === 1 ? { sessionsUsed: 0, sessionsTotal: 9 } : {}),
  };

  return {
    clientName,
    setClientName,
    typeIndex,
    setTypeIndex,
    amount,
    setAmount,
    date,
    time,
    statusIndex,
    setStatusIndex,
    method,
    setMethod,
    methodMenu,
    datePicker,
    timePicker,
    preview,
    submit,
    submitting,
    error,
  };
}
