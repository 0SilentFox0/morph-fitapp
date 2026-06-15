import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
const { colors, typography, spacing, radius } = theme;

export type ChoiceCardVariant = 'card' | 'chip';

export interface ChoiceCardProps {
  selected: boolean;
  onPress: () => void;
  variant?: ChoiceCardVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  testID?: string;
  accessibilityLabel?: string;
}

export const ChoiceCard = React.memo(function ChoiceCard({
  selected,
  onPress,
  variant = 'card',
  icon,
  title,
  subtitle,
  testID,
  accessibilityLabel,
}: ChoiceCardProps) {
  const isChip = variant === 'chip';
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole={isChip ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected }}
      accessibilityLabel={accessibilityLabel ?? title}
      style={[
        isChip ? styles.chip : styles.card,
        selected && (isChip ? styles.chipSelected : styles.cardSelected),
      ]}
    >
      {icon ? (
        <View
          style={[styles.iconBox, isChip && styles.iconBoxChip, selected && styles.iconBoxSelected]}
        >
          <Ionicons name={icon} size={isChip ? 14 : 24} color={colors.text} />
        </View>
      ) : null}
      <View style={[styles.textWrap, !isChip && styles.textWrapCard]}>
        <Text
          style={[
            isChip ? styles.chipText : styles.cardTitle,
            selected && (isChip ? styles.chipTextSelected : styles.cardTitleSelected),
          ]}
        >
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  cardSelected: {
    backgroundColor: colors.primary2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral2,
    borderRadius: radius.xl,
  },
  chipSelected: {
    backgroundColor: colors.accent,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxChip: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  iconBoxSelected: {
    backgroundColor: colors.primary1,
  },
  textWrap: {
    gap: 4,
  },
  // Cards fill the remaining row width (icon + text); chips must hug their
  // text — flex:1 (flexBasis 0%) would collapse an unsized chip to zero width
  // and clip the label, leaving an empty circle.
  textWrapCard: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 28,
    color: colors.text,
  },
  cardTitleSelected: {
    color: colors.text,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.white,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
