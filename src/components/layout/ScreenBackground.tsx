import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import theme from '../../theme';

const { colors } = theme;

/**
 * Full-screen background: a smooth vertical gradient from a #791A1F tint at the
 * top fading into the #0D0D0D base toward the bottom.
 */
export function ScreenBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.base}>
      <LinearGradient
        colors={['rgba(121,26,31,0.45)', 'rgba(121,26,31,0.12)', 'transparent']}
        locations={[0, 0.4, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
});
