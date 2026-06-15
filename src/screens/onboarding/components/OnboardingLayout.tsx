import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProgressIndicator } from '../../../components/layout';
import { HorizontalSwipe } from '../../../components/ui';
import { FitnessLogo } from '../../../components/icons/FitnessLogo';
import theme from '../../../theme';
const { colors, radius, typography, spacing } = theme;

const DEFAULT_TOTAL_STEPS = 7;

interface OnboardingLayoutProps {
  children: React.ReactNode;
  step?: number;
  /** Total step count for the progress indicator. Trainer flow has 7, client 8. */
  totalSteps?: number;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  showFooter?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextDisabled?: boolean;
  scrollContentStyle?: ViewStyle;
  centerContent?: boolean;
}

export function OnboardingLayout({
  children,
  step,
  totalSteps = DEFAULT_TOTAL_STEPS,
  title,
  subtitle,
  showLogo = true,
  showFooter = true,
  onNext,
  onBack,
  onSkip,
  nextDisabled = false,
  scrollContentStyle,
  centerContent = false,
}: OnboardingLayoutProps) {
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    if (nextDisabled || !onNext) return;
    onNext();
  };

  return (
    // Swipe left = next step (respects validation); swipe right/back is left to the
    // native-stack gesture, so we only wire onSwipeLeft here.
    <HorizontalSwipe
      style={[styles.container, { paddingTop: Math.max(insets.top, 20) + 12 }]}
      onSwipeLeft={onNext ? handleNext : undefined}
    >
      {showLogo && (
        <View style={styles.logo} accessible accessibilityRole="header">
          <FitnessLogo width={138} height={32} />
        </View>
      )}

      {step != null && (
        <View accessibilityLabel={`Step ${step} of ${totalSteps}`}>
          <ProgressIndicator total={totalSteps} current={step} />
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          centerContent && styles.scrollContentCentered,
          scrollContentStyle,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {title != null && <Text style={styles.title}>{title}</Text>}
        {subtitle != null && <Text style={styles.subtitle}>{subtitle}</Text>}
        {children}
      </ScrollView>

      {showFooter && (onNext || onBack || onSkip) && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <View style={styles.footerSlot}>
            {onBack && (
              <TouchableOpacity
                onPress={onBack}
                style={styles.navBtn}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Previous step"
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footerCenter}>
            {onSkip && (
              <TouchableOpacity
                onPress={onSkip}
                accessibilityRole="button"
                accessibilityLabel="Skip this step"
              >
                <Text style={styles.skip}>Skip</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.footerSlot, styles.footerSlotEnd]}>
            {onNext && (
              <TouchableOpacity
                onPress={handleNext}
                disabled={nextDisabled}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Next step"
                accessibilityState={{ disabled: nextDisabled }}
                style={[styles.nextBtn, nextDisabled && styles.disabled]}
              >
                <Ionicons name="arrow-forward" size={24} color={colors.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </HorizontalSwipe>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  scrollContentCentered: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 32,
    color: colors.neutral9,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.neutral8,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  footerSlot: {
    width: 48,
    alignItems: 'flex-start',
  },
  footerSlotEnd: {
    alignItems: 'flex-end',
  },
  footerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  skip: {
    fontSize: typography.sizes.base,
    color: colors.neutral8,
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: radius['2xl'],
    backgroundColor: colors.neutral2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    width: 48,
    height: 48,
    borderRadius: radius['2xl'],
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
