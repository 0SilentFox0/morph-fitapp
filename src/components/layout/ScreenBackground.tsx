import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

/**
 * Full-screen background: #0D0D0D base with #791A1F shadow in top-right corner.
 */
export function ScreenBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.base}>
      <View style={styles.gradientWrap} pointerEvents="none">
        <LinearGradient
          colors={['rgba(121,26,31,0.35)', 'rgba(121,26,31,0.08)', 'transparent']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  gradientWrap: {
    ...StyleSheet.absoluteFillObject,
  },
});
