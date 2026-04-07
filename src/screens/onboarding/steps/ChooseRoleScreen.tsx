import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { useAppStore } from '../../../store/appStore';
import { OnboardingLayout } from '../components/OnboardingLayout';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'ChooseRole'>;

export function ChooseRoleScreen() {
  const navigation = useNavigation<Nav>();
  const { setUserRole } = useAppStore();
  const [selected, setSelected] = React.useState<'client' | 'trainer'>('trainer');

  const handleApply = () => {
    setUserRole(selected);
    if (selected === 'trainer') {
      navigation.navigate('WelcomeTrainer');
    } else {
      navigation.navigate('YoureAllSet');
    }
  };

  return (
    <OnboardingLayout
      title="Choose your role"
      subtitle="To personalize your experience"
      showFooter={false}
    >
      <View style={styles.cardsContainer}>
        <TouchableOpacity
          onPress={() => setSelected('client')}
          activeOpacity={0.8}
          accessibilityRole="radio"
          accessibilityState={{ checked: selected === 'client' }}
        >
          <View style={[styles.roleCard, selected === 'client' && styles.roleCardSelected]}>
            <View style={styles.roleTop}>
              <View style={[styles.iconBox, selected === 'client' && styles.iconBoxSelected]}>
                <Ionicons name="person-outline" size={24} color={colors.text} />
              </View>
              <View style={styles.roleContent}>
                <Text style={styles.roleTitle}>I'm a client</Text>
                <Text style={styles.roleSubtitle}>Looking for a trainer</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              {selected === 'client' && <View style={styles.radioInner} />}
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelected('trainer')}
          activeOpacity={0.8}
          accessibilityRole="radio"
          accessibilityState={{ checked: selected === 'trainer' }}
        >
          <View style={[styles.roleCard, selected === 'trainer' && styles.roleCardSelected]}>
            <View style={styles.roleTop}>
              <View style={[styles.iconBox, selected === 'trainer' && styles.iconBoxSelected]}>
                <Ionicons name="briefcase-outline" size={24} color={colors.text} />
              </View>
              <View style={styles.roleContent}>
                <Text style={styles.roleTitle}>I'm a trainer</Text>
                <Text style={styles.roleSubtitle}>Want to work as a trainer</Text>
              </View>
            </View>
            <View style={styles.radioOuter}>
              {selected === 'trainer' && <View style={styles.radioInner} />}
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <Button title="Continue" onPress={handleApply} style={styles.button} />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  cardsContainer: {
    gap: spacing.md,
  },
  roleCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 138,
  },
  roleCardSelected: {
    backgroundColor: colors.primary2,
  },
  roleTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.neutral2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxSelected: {
    backgroundColor: colors.primary1,
  },
  roleContent: {
    flex: 1,
    gap: 4,
  },
  roleTitle: {
    fontSize: 20,
    lineHeight: 28,
    color: colors.text,
  },
  roleSubtitle: {
    fontSize: 12,
    lineHeight: 20,
    color: '#D1D5DC',
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.neutral5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  button: {
    marginTop: spacing['2xl'],
    borderRadius: 80,
  },
});
