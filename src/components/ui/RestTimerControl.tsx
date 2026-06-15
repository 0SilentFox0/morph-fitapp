import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
const { colors, radius, typography, spacing } = theme;
import type { RestState } from '../../store/activeTrainingStore';

interface RestTimerControlProps {
  rest: RestState;
  /** Start the rest timer (when idle) — default duration is up to the caller. */
  onStart: () => void;
  /** Stop/pause a running timer. */
  onStop: () => void;
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
}

function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Bottom control of the live Exercise screen (Figma 2006:8361): prev · center
 * timer · next. The center toggles between a filled accent Play (idle → start
 * rest) and a bordered countdown ring (running → tap to stop). The ring is a
 * plain bordered circle — no SVG arc — sufficient for the current mock.
 */
export function RestTimerControl({
  rest,
  onStart,
  onStop,
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
}: RestTimerControlProps) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={onPrev}
        disabled={prevDisabled}
        style={styles.arrowButton}
        activeOpacity={0.7}
      >
        <Ionicons
          name="play-back"
          size={40}
          color={prevDisabled ? colors.neutral5 : colors.neutral7}
        />
      </TouchableOpacity>

      {rest.running ? (
        <TouchableOpacity onPress={onStop} style={styles.timerRing} activeOpacity={0.8}>
          <Text style={styles.timerText}>{formatTime(rest.remainingSec)}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onStart} style={styles.playCircle} activeOpacity={0.8}>
          <Ionicons name="play" size={40} color={colors.white} />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={onNext}
        disabled={nextDisabled}
        style={styles.arrowButton}
        activeOpacity={0.7}
      >
        <Ionicons
          name="play-forward"
          size={40}
          color={nextDisabled ? colors.neutral5 : colors.neutral7}
        />
      </TouchableOpacity>
    </View>
  );
}

const CIRCLE = 124;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  arrowButton: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  playCircle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRing: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.heavy,
    color: colors.neutral9,
  },
});
