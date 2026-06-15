import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Overlay } from '../../../../components/ui';
import theme from '../../../../theme';

const { colors, typography, spacing, radius } = theme;

import type { TrainingProgram } from '../../../../types';
import { programMeta } from '../../../../utils';

export interface ProgramPickerModalProps {
  visible: boolean;
  onClose: () => void;
  programs: TrainingProgram[];
  value: string | undefined;
  onChange: (programId: string) => void;
}

export function ProgramPickerModal({
  visible,
  onClose,
  programs,
  value,
  onChange,
}: ProgramPickerModalProps) {
  const handleSelect = (id: string) => {
    onChange(id);
    onClose();
  };

  return (
    <Overlay visible={visible} onClose={onClose}>
      <View style={styles.box}>
        <Text style={styles.title}>Select Program</Text>
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {programs.length > 0 ? (
            programs.map((p) => {
              const active = value === p.id;

              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.option, active && styles.optionActive]}
                  onPress={() => handleSelect(p.id)}
                >
                  <View style={styles.optionRow}>
                    <Ionicons
                      name="barbell-outline"
                      size={16}
                      color={active ? colors.accent : colors.neutral8}
                    />
                    <View style={styles.optionInfo}>
                      <Text
                        style={[
                          styles.optionText,
                          active && styles.optionTextActive,
                        ]}
                      >
                        {p.name}
                      </Text>
                      <Text style={styles.optionMeta}>{programMeta(p)}</Text>
                    </View>
                  </View>
                  {active ? (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={colors.accent}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.empty}>
              No programs yet. Create one in Training Library.
            </Text>
          )}
        </ScrollView>
      </View>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '85%',
    backgroundColor: colors.neutral2,
    borderRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: 500,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  optionActive: {
    backgroundColor: colors.neutral3,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  optionInfo: {
    flex: 1,
  },
  optionText: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  optionTextActive: {
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
  optionMeta: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  empty: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
