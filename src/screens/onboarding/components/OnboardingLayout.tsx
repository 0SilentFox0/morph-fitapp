import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProgressIndicator } from '../../../components/layout';
import { FitnessLogo } from '../../../components/icons/FitnessLogo';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';

const TOTAL_STEPS = 9;

interface OnboardingLayoutProps {
  children: React.ReactNode;
  step?: number;
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
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) + 12 }]}>
      {showLogo && (
        <View style={styles.logo} accessible accessibilityRole="header">
          <FitnessLogo width={138} height={32} />
        </View>
      )}

      {step != null && (
        <View accessibilityLabel={`Step ${step} of ${TOTAL_STEPS}`}>
          <ProgressIndicator total={TOTAL_STEPS} current={step} />
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
                <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
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
    borderRadius: 24,
    backgroundColor: colors.neutral2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
