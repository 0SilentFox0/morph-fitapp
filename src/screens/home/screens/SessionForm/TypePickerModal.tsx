import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Overlay } from '../../../../components/ui';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';
import { radius } from '../../../../theme';

export interface TypePickerModalProps {
  visible: boolean;
  onClose: () => void;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}

export function TypePickerModal({
  visible,
  onClose,
  options,
  value,
  onChange,
}: TypePickerModalProps) {
  return (
    <Overlay visible={visible} onClose={onClose}>
      <View style={styles.box}>
        {options.map((opt) => {
          const active = value === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.option, active && styles.optionActive]}
              onPress={() => {
                onChange(opt);
                onClose();
              }}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '80%',
    backgroundColor: colors.neutral2,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    maxHeight: 400,
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  optionActive: {
    backgroundColor: colors.neutral3,
  },
  optionText: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  optionTextActive: {
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
});
