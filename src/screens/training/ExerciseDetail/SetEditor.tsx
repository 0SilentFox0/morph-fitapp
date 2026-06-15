import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Toggle } from '../../../components/ui';
import { useAppStore } from '../../../store/appStore';
import theme from '../../../theme';
import { displayToKg, kgToDisplay, weightUnitLabel } from '../../../utils';

const { colors, radius, typography, spacing } = theme;

export interface SetEditorProps {
  weight: number;
  reps: number;
  toFailure: boolean;
  onWeightChange: (value: number) => void;
  onRepsChange: (value: number) => void;
  onToggleFailure: () => void;
}

/** Weight / reps numeric inputs and the "rep to failure" toggle for the current set. */
export function SetEditor({
  weight,
  reps,
  toFailure,
  onWeightChange,
  onRepsChange,
  onToggleFailure,
}: SetEditorProps) {
  // Weights are stored in kg; show/enter them in the user's preferred unit.
  const units = useAppStore((s) => s.units);

  return (
    <>
      <View style={styles.field}>
        <TextInput
          style={styles.fieldInput}
          keyboardType="decimal-pad"
          inputMode="decimal"
          selectTextOnFocus
          value={String(kgToDisplay(weight, units))}
          onChangeText={(t) => onWeightChange(displayToKg(Number(t) || 0, units))}
        />
        <Text style={styles.fieldSuffix}>{weightUnitLabel(units)}</Text>
      </View>
      <View style={styles.field}>
        <TextInput
          style={styles.fieldInput}
          keyboardType="number-pad"
          inputMode="numeric"
          selectTextOnFocus
          value={String(reps)}
          onChangeText={(t) => onRepsChange(Number(t) || 0)}
        />
        <Text style={styles.fieldSuffix}>x</Text>
      </View>

      <View style={styles.failureRow}>
        <Toggle value={toFailure} onValueChange={onToggleFailure} />
        <Text style={styles.failureLabel}>rep to failure</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral1,
    borderWidth: 1,
    borderColor: colors.neutral5,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  fieldInput: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.neutral9,
    padding: 0,
  },
  fieldSuffix: {
    fontSize: typography.sizes.base,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  failureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  failureLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text,
  },
});
