import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';

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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
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
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '80%',
    backgroundColor: colors.neutral2,
    borderRadius: 16,
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
