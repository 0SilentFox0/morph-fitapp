import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import theme from '../../../theme';

const { colors, radius, typography, spacing } = theme;

function IconSquare({ icon }: { icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.iconSquare}>
      <Ionicons name={icon} size={16} color={colors.white} />
    </View>
  );
}

/** Target / Level / Type info tiles on the client profile. */
export function ClientInfoSection() {
  return (
    <>
      <View style={styles.infoRowFull}>
        <IconSquare icon="flag" />
        <Text style={styles.infoLabel}>Target:</Text>
        <Text style={styles.infoValue}>Fat loss, Endurance</Text>
      </View>
      <View style={styles.infoColumns}>
        <View style={styles.infoCol}>
          <IconSquare icon="rocket" />
          <Text style={styles.infoLabel}>Level:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            Intermediate
          </Text>
        </View>
        <View style={styles.infoCol}>
          <IconSquare icon="walk" />
          <Text style={styles.infoLabel}>Type:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            HIIT, Cardio
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  infoRowFull: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  infoColumns: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  infoCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral2,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  iconSquare: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  infoValue: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    flexShrink: 1,
  },
});
