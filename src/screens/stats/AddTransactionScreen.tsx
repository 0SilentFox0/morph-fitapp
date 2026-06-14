import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StatsStackParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/layout';
import {
  FormInput,
  DatePickerInput,
  TimePickerInput,
  DropdownSelect,
  Button,
  Card,
} from '../../components/ui';
import { TransactionCard } from './Analytics/TransactionCard';
import { colors } from '../../theme/colors';
import { radius } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { formatDate, formatTime } from '../../utils';
import type { Transaction, TransactionType } from '../../types';
import {
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
  PAYMENT_METHODS,
} from '../../constants/transactions';

type Nav = NativeStackNavigationProp<StatsStackParamList, 'AddTransaction'>;

interface SegmentOption {
  label: string;
  activeColor?: string;
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: SegmentOption[];
  value: number;
  onChange: (i: number) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o, i) => {
        const active = i === value;
        return (
          <TouchableOpacity
            key={o.label}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(i)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                active && { color: o.activeColor ?? colors.text, fontWeight: typography.weights.semibold },
              ]}
            >
              {o.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function AddTransactionScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [clientName, setClientName] = React.useState('');
  const [typeIndex, setTypeIndex] = React.useState(0);
  const [amount, setAmount] = React.useState('');
  const [date, setDate] = React.useState(new Date());
  const [time, setTime] = React.useState(new Date());
  const [statusIndex, setStatusIndex] = React.useState(0);
  const [method, setMethod] = React.useState('');
  const [methodOpen, setMethodOpen] = React.useState(false);
  const [showDate, setShowDate] = React.useState(false);
  const [showTime, setShowTime] = React.useState(false);

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

  const handleDateChange = (_: unknown, selected?: Date) => {
    if (Platform.OS === 'android') setShowDate(false);
    if (selected) setDate(selected);
  };
  const handleTimeChange = (_: unknown, selected?: Date) => {
    if (Platform.OS === 'android') setShowTime(false);
    if (selected) setTime(selected);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Add Transaction" transparent />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormInput
          placeholder="Enter client name"
          value={clientName}
          onChangeText={setClientName}
        />

        <Segmented
          options={[{ label: 'Training' }, { label: 'Subscription' }]}
          value={typeIndex}
          onChange={setTypeIndex}
        />

        <FormInput
          placeholder="$ 40"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          containerStyle={styles.spacer}
        />

        <View style={styles.dateRow}>
          <DatePickerInput value={formatDate(date)} onPress={() => setShowDate(true)} />
          <TimePickerInput
            value={formatTime(time)}
            onPress={() => setShowTime(true)}
            style={styles.timeField}
          />
        </View>

        {showDate && (
          <View style={styles.picker}>
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              themeVariant="dark"
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.done} onPress={() => setShowDate(false)}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {showTime && (
          <View style={styles.picker}>
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              themeVariant="dark"
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.done} onPress={() => setShowTime(false)}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.spacer}>
          <Segmented
            options={TRANSACTION_STATUSES.map((s) => ({ label: s.label, activeColor: s.color }))}
            value={statusIndex}
            onChange={setStatusIndex}
          />
        </View>

        <View style={styles.spacer}>
          <DropdownSelect
            value={method}
            placeholder="Payment method"
            onPress={() => setMethodOpen((o) => !o)}
          />
          {methodOpen && (
            <Card style={styles.methodMenu}>
              {PAYMENT_METHODS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={styles.methodItem}
                  onPress={() => {
                    setMethod(m);
                    setMethodOpen(false);
                  }}
                >
                  <Text style={styles.methodText}>{m}</Text>
                </TouchableOpacity>
              ))}
            </Card>
          )}
        </View>

        <View style={styles.previewWrap}>
          <TransactionCard transaction={preview} />
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.tabBarInset },
        ]}
      >
        <Button title="Save Transaction" onPress={() => navigation.navigate('YouGotPaid')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  spacer: {
    marginTop: spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  timeField: {
    minWidth: 0,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.neutral1,
    borderWidth: 1,
    borderColor: colors.neutral5,
    borderRadius: radius.sm,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm - 2,
  },
  segmentActive: {
    backgroundColor: colors.neutral3,
  },
  segmentText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  picker: {
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  done: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  doneText: {
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
  methodMenu: {
    marginTop: spacing.xs,
    padding: spacing.xs,
  },
  methodItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  methodText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  previewWrap: {
    marginTop: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});
