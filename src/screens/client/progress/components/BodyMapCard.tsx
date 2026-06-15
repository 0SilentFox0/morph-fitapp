import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BodyMap } from '../../../../components/ui';
import theme from '../../../../theme';

const { colors, heatColors, radius, typography, spacing } = theme;

interface BodyMapCardProps {
  intensities: React.ComponentProps<typeof BodyMap>['intensities'];
  view: 'front' | 'back';
  onViewChange: (view: 'front' | 'back') => void;
  onMusclePress: React.ComponentProps<typeof BodyMap>['onMusclePress'];
}

/** Front/back muscle heat-map with a face toggle and a "less → more" legend. */
export function BodyMapCard({
  intensities,
  view,
  onViewChange,
  onMusclePress,
}: BodyMapCardProps) {
  return (
    <View style={styles.mapCard}>
      <View style={styles.faceToggle}>
        {(['front', 'back'] as const).map((f) => {
          const active = f === view;

          return (
            <TouchableOpacity
              key={f}
              onPress={() => onViewChange(f)}
              style={[styles.faceBtn, active && styles.faceBtnActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.faceText, active && styles.faceTextActive]}>
                {f === 'front' ? 'Front' : 'Back'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <BodyMap
        intensities={intensities}
        view={view}
        onMusclePress={onMusclePress}
      />

      <View style={styles.legend}>
        <Text style={styles.legendLabel}>Less</Text>
        <View style={styles.legendBar}>
          {heatColors.map((c) => (
            <View
              key={c}
              style={[styles.legendSwatch, { backgroundColor: c }]}
            />
          ))}
        </View>
        <Text style={styles.legendLabel}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    backgroundColor: colors.neutral1,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  faceToggle: {
    flexDirection: 'row',
    backgroundColor: colors.neutral3,
    borderRadius: radius.pill,
    padding: 3,
  },
  faceBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  faceBtnActive: { backgroundColor: colors.accent },
  faceText: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  faceTextActive: {
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
  legend: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendLabel: { fontSize: typography.sizes.xs, color: colors.textMuted },
  legendBar: {
    flexDirection: 'row',
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  legendSwatch: { width: 22, height: 8 },
});
