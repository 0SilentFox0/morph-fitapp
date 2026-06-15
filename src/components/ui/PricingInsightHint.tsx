import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import theme from '../../theme';

const { colors, spacing, radius, typography } = theme;

import {
  fetchPricingInsight,
  type PackageKind,
  type PricingInsight,
} from '../../services/gamificationApi';

interface PricingInsightHintProps {
  /** Whole-number price the trainer is entering. */
  price: number;
  currency?: string;
  kind?: PackageKind;
}

/**
 * DOU-style market hint (GAME-008): tells a trainer how their price compares to
 * peers (anonymous, percentile only — never other trainers' raw prices). Renders
 * nothing until there's a positive price and enough sample. Data flows through
 * the gamification service, so it switches to the live API with no changes here.
 */
export function PricingInsightHint({
  price,
  currency = 'USD',
  kind,
}: PricingInsightHintProps) {
  const [insight, setInsight] = useState<PricingInsight | null>(null);

  useEffect(() => {
    if (!price || price <= 0) return;

    let active = true;

    fetchPricingInsight(currency, price, kind)
      .then((res) => {
        if (active) setInsight(res);
      })
      .catch(() => {
        /* leave the previous hint in place; render guards handle absence */
      });

    return () => {
      active = false;
    };
  }, [price, currency, kind]);

  if (!price || price <= 0 || !insight || insight.insufficientData) return null;

  const pct = insight.yourPercentile;

  const low = pct < 0.25;

  const label =
    pct >= 0.5
      ? `Higher than ${Math.round(pct * 100)}% of trainers`
      : `Lower than ${Math.round((1 - pct) * 100)}% of trainers`;

  return (
    <View style={[styles.container, low && styles.containerWarn]}>
      <Ionicons
        name={low ? 'trending-down' : 'stats-chart'}
        size={16}
        color={low ? colors.Warning : colors.accent}
      />
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.sub}>
          Typical range {insight.p25}–{insight.p75} {insight.currency}
          {low ? ' · you may be underpricing' : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  containerWarn: { borderColor: colors.Warning },
  text: { flex: 1 },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  sub: { fontSize: typography.sizes.xs, color: colors.textSecondary },
});
