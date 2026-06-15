import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '../../../../components/ui';
import theme from '../../../../theme';

const { colors, typography, spacing, radius } = theme;

export interface StatCardsRowProps {
  onRevenuePress: () => void;
}

/** Revenue + profile-view summary cards at the top of the Home dashboard. */
export function StatCardsRow({ onRevenuePress }: StatCardsRowProps) {
  return (
    <View style={styles.cardsRow}>
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={0.8}
        onPress={onRevenuePress}
      >
        <Card style={styles.statCard}>
          <View style={styles.statCardTop}>
            <View style={styles.statCardLabel}>
              <Ionicons name="wallet" size={16} color={colors.text} />
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={[styles.arrowBtn, styles.arrowBtnLight]}>
              <Ionicons name="arrow-forward" size={16} color={colors.text} />
            </View>
          </View>
          <Text style={styles.statValue}>$ 320</Text>
        </Card>
      </TouchableOpacity>
      <Card style={[styles.statCard, { flex: 1 }]}>
        <View style={styles.statCardTop}>
          <View style={styles.statCardLabel}>
            <Ionicons name="eye" size={16} color={colors.text} />
            <Text style={[styles.statLabel, styles.statLabelMuted]}>
              Profile view
            </Text>
          </View>
          <View style={styles.arrowBtn}>
            <Ionicons name="arrow-forward" size={16} color={colors.neutral7} />
          </View>
        </View>
        <Text style={styles.statValue}>123</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  cardsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    height: 98,
    padding: spacing.md,
    justifyContent: 'space-between',
    borderRadius: radius.lg,
  },
  statCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statCardLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  statLabelMuted: {
    color: colors.neutral9,
  },
  arrowBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.neutral7,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  arrowBtnLight: {
    borderColor: colors.neutral8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
});
