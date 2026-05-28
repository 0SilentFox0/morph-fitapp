import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../theme/colors';
import { typography } from '../../../../theme/typography';
import { spacing } from '../../../../theme/spacing';
import type { TrainingProgram } from '../../../../mocks';

export interface ProgramPickerModalProps {
  visible: boolean;
  onClose: () => void;
  programs: TrainingProgram[];
  value: string | undefined;
  onChange: (programId: string) => void;
}

function programMeta(p: TrainingProgram): string {
  const count = p.exercises?.length ?? p.videoCount;
  return `${p.tag} · ${count} exercises`;
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
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
                        <Text style={[styles.optionText, active && styles.optionTextActive]}>
                          {p.name}
                        </Text>
                        <Text style={styles.optionMeta}>{programMeta(p)}</Text>
                      </View>
                    </View>
                    {active ? <Ionicons name="checkmark" size={18} color={colors.accent} /> : null}
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.empty}>No programs yet. Create one in Training Library.</Text>
            )}
          </ScrollView>
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
    width: '85%',
    backgroundColor: colors.neutral2,
    borderRadius: 16,
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
    borderRadius: 12,
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
