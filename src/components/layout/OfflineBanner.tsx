import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import theme from '../../theme';

const { colors, typography, spacing } = theme;

import { useNetworkStatus } from '../../hooks/data/useNetworkStatus';

/**
 * App-wide banner shown while the backend is unreachable. Mounts once at the
 * root; reads connectivity derived from request outcomes (no native module).
 */
export function OfflineBanner() {
  const online = useNetworkStatus();

  const insets = useSafeAreaInsets();

  if (online) return null;

  return (
    <View
      style={[styles.banner, { paddingTop: insets.top + spacing.sm }]}
      pointerEvents="none"
    >
      <Ionicons name="cloud-offline-outline" size={16} color={colors.white} />
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.Warning,
  },
  text: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
});
