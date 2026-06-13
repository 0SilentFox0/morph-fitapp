import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenHeader } from '../../components/layout';
import { EmptyState } from '../../components/ui';
import type { Ionicons } from '@expo/vector-icons';

/**
 * Temporary scaffold for client tabs that are wired into the navigator before
 * their real screen exists. Replaced phase-by-phase as features land.
 */
export function makeClientPlaceholder(
  title: string,
  icon: keyof typeof Ionicons.glyphMap,
  showBack = false,
) {
  return function ClientPlaceholderScreen() {
    return (
      <View style={styles.container}>
        <ScreenHeader title={title} showBack={showBack} transparent />
        <View style={styles.body}>
          <EmptyState icon={icon} title={title} subtitle="Coming soon" />
        </View>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  body: { flex: 1, justifyContent: 'center' },
});
