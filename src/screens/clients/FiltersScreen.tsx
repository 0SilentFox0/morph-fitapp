import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ClientsStackParamList } from '../../navigation/types';
import { ScreenHeader } from '../../components/layout';
import { Button } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type Nav = NativeStackNavigationProp<ClientsStackParamList, 'Filters'>;

const TRAINING_OPTIONS = ['Personal', 'Group', 'Archived'];
const PAYMENT_OPTIONS = ['Completed', 'Pending', 'Canceled'];

export function FiltersScreen() {
  const navigation = useNavigation<Nav>();
  const [training, setTraining] = React.useState('Personal');
  const [payments, setPayments] = React.useState<Set<string>>(new Set(['Completed']));

  const togglePayment = (opt: string) => {
    setPayments((prev) => {
      const next = new Set(prev);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Filters" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Training</Text>
        <View style={styles.optionsRow}>
          {TRAINING_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => setTraining(opt)}
              style={[
                styles.option,
                training === opt && styles.optionSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  training === opt && styles.optionTextSelected,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Payments</Text>
        {PAYMENT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => togglePayment(opt)}
            style={styles.checkRow}
          >
            <View
              style={[
                styles.checkbox,
                payments.has(opt) && styles.checkboxChecked,
              ]}
            >
              {payments.has(opt) && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text style={styles.checkLabel}>{opt}</Text>
          </TouchableOpacity>
        ))}

        <Button
          title="Submit"
          onPress={() => navigation.goBack()}
          style={styles.button}
        />
      </ScrollView>
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
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.Secondary2,
  },
  optionSelected: {
    backgroundColor: colors.Accent1,
  },
  optionText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: colors.Accent1,
    backgroundColor: colors.Accent1,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkLabel: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  button: {
    marginTop: spacing.xl,
  },
});
