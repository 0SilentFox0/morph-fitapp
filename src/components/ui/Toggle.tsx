import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
const { colors } = theme;

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

/**
 * Custom on/off switch matching Figma node 2003:9281 — accent plate with a
 * check when on, neutral plate with an ✕ when off. Avoids pulling in an
 * animation/SVG dependency.
 */
export function Toggle({ value, onValueChange, disabled }: ToggleProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[styles.track, value ? styles.trackOn : styles.trackOff]}
    >
      {value && (
        <Ionicons name="checkmark" size={10} color={colors.white} style={styles.iconLeft} />
      )}
      <View style={[styles.handle, value ? styles.handleOn : styles.handleOff]}>
        {!value && <Ionicons name="close" size={10} color={colors.neutral7} />}
      </View>
    </TouchableOpacity>
  );
}

const TRACK_W = 48;
const TRACK_H = 22;
const HANDLE = 18;

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: 16,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: colors.accent,
  },
  trackOff: {
    backgroundColor: colors.neutral3,
  },
  handle: {
    position: 'absolute',
    width: HANDLE,
    height: HANDLE,
    borderRadius: HANDLE / 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleOn: {
    right: 2,
  },
  handleOff: {
    left: 2,
  },
  iconLeft: {
    position: 'absolute',
    left: 5,
  },
});
