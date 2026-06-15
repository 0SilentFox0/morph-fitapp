import React from 'react';
import { formatDate } from '../../utils';
import type { Transaction, TransactionType } from '../../types';
import { TRANSACTION_TYPES, TRANSACTION_STATUSES } from '../../constants/transactions';
import { useDisclosure } from '../../hooks/ui/useDisclosure';
import { useDateTimePicker } from '../../hooks/datetime/useDateTimePicker';

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

  const type = TRANSACTION_TYPES[typeIndex] as TransactionType;
  const status = TRANSACTION_STATUSES[statusIndex];

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
  };
}
