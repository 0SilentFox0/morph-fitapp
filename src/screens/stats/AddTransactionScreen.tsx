import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenHeader } from '../../components/layout';
import {
  Button,
  Card,
  DatePickerInput,
  DropdownSelect,
  FormInput,
  Segmented,
  TimePickerInput,
} from '../../components/ui';
import type { StatsStackParamList } from '../../navigation/types';
import theme from '../../theme';
import { TransactionCard } from './Analytics/TransactionCard';

const { colors, radius, typography, spacing } = theme;

import {
  PAYMENT_METHODS,
  TRANSACTION_STATUSES,
} from '../../constants/transactions';
import { formatDate, formatTime } from '../../utils';
import { useTransactionForm } from './useTransactionForm';

type Nav = NativeStackNavigationProp<StatsStackParamList, 'AddTransaction'>;

export function AddTransactionScreen() {
  const navigation = useNavigation<Nav>();

  const insets = useSafeAreaInsets();

  const {
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
  } = useTransactionForm();

  const handleSave = async () => {
    try {
      await submit();
      navigation.navigate('YouGotPaid');
    } catch {
      // error is surfaced inline via the `error` state; stay on the form.
    }
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
          <DatePickerInput value={formatDate(date)} onPress={datePicker.open} />
          <TimePickerInput
            value={formatTime(time)}
            onPress={timePicker.open}
            style={styles.timeField}
          />
        </View>

        {datePicker.visible && (
          <View style={styles.picker}>
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={datePicker.handleChange}
              themeVariant="dark"
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.done} onPress={datePicker.close}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {timePicker.visible && (
          <View style={styles.picker}>
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={timePicker.handleChange}
              themeVariant="dark"
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.done} onPress={timePicker.close}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.spacer}>
          <Segmented
            options={TRANSACTION_STATUSES.map((s) => ({
              label: s.label,
              activeColor: s.color,
            }))}
            value={statusIndex}
            onChange={setStatusIndex}
          />
        </View>

        <View style={styles.spacer}>
          <DropdownSelect
            value={method}
            placeholder="Payment method"
            onPress={methodMenu.toggle}
          />
          {methodMenu.visible && (
            <Card style={styles.methodMenu}>
              {PAYMENT_METHODS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={styles.methodItem}
                  onPress={() => {
                    setMethod(m);
                    methodMenu.close();
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
          {
            paddingBottom:
              Math.max(insets.bottom, spacing.md) + spacing.tabBarInset,
          },
        ]}
      >
        {error && <Text style={styles.error}>{error}</Text>}
        <Button
          title="Save Transaction"
          onPress={handleSave}
          loading={submitting}
        />
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
  error: {
    color: colors.Error,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
