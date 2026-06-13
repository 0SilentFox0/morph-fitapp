import React from 'react';
import { View, StyleSheet } from 'react-native';
import Body, { type ExtendedBodyPart, type Slug } from 'react-native-body-highlighter';
import {
  MUSCLE_TO_SLUGS,
  SLUG_TO_MUSCLE,
  MUSCLE_GROUPS,
  type MuscleGroup,
} from '../../constants/muscles';
import { colors } from '../../theme/colors';

/**
 * Heat-map ramp (low → high load), drawn from the theme primary scale so it sits
 * with the rest of the palette. `intensity` on a body part is a 1-based index
 * into this array (the library convention).
 */
const HEAT_COLORS = ['#5E1A08', '#8C1E03', '#AE451F', '#BF4F33', '#E7775B'] as const;
const BANDS = HEAT_COLORS.length;

/** Quantize a 0..1 intensity into a 1..BANDS color band; 0 means "not worked". */
function toBand(intensity: number): number {
  if (intensity <= 0) return 0;
  return Math.min(BANDS, Math.ceil(intensity * BANDS));
}

export interface BodyMapProps {
  /** Per-muscle load, normalized 0..1 (see utils/muscleStats.toIntensities). */
  intensities: Record<MuscleGroup, number>;
  view: 'front' | 'back';
  onMusclePress?: (muscle: MuscleGroup) => void;
  scale?: number;
}

export function BodyMap({ intensities, view, onMusclePress, scale = 1 }: BodyMapProps) {
  const data: ExtendedBodyPart[] = React.useMemo(() => {
    const parts: ExtendedBodyPart[] = [];
    for (const group of MUSCLE_GROUPS) {
      const band = toBand(intensities[group] ?? 0);
      if (band === 0) continue;
      for (const slug of MUSCLE_TO_SLUGS[group]) {
        parts.push({ slug: slug as Slug, intensity: band });
      }
    }
    return parts;
  }, [intensities]);

  const handlePress = React.useCallback(
    (part: ExtendedBodyPart) => {
      const slug = part.slug;
      if (!slug || !onMusclePress) return;
      const muscle = SLUG_TO_MUSCLE[slug];
      if (muscle) onMusclePress(muscle);
    },
    [onMusclePress],
  );

  return (
    <View style={styles.container}>
      <Body
        data={data}
        side={view}
        gender="male"
        scale={scale}
        colors={HEAT_COLORS as unknown as string[]}
        defaultFill={colors.neutral4}
        border={colors.neutral2}
        onBodyPartPress={handlePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
