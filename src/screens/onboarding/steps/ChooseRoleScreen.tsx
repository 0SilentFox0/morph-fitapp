import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useAppStore } from '../../../store/appStore';
import { OnboardingLayout } from '../components/OnboardingLayout';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'ChooseRole'>;

const RoleCard = ({
  role,
  selected,
  setUserRole,
  icon,
}: {
  role: 'client' | 'trainer';
  selected: boolean;
  setUserRole: (role: 'client' | 'trainer') => void;
  icon: keyof typeof Ionicons.glyphMap;
}) => {
  return (
    <TouchableOpacity
      onPress={() => setUserRole(role)}
      activeOpacity={0.8}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
    >
      <View style={[styles.roleCard, selected && styles.roleCardSelected]}>
        <View style={styles.roleTop}>
          <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
            <Ionicons name={icon} size={24} color={colors.text} />
          </View>
          <View style={styles.roleContent}>
            <Text style={styles.roleTitle}>I'm a {role}</Text>
            <Text style={styles.roleSubtitle}>
              {role === 'client' ? 'Looking for a trainer' : 'Want to work as a trainer'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export function ChooseRoleScreen() {
  const navigation = useNavigation<Nav>();
  const { setUserRole } = useAppStore();
  const [selected, setSelected] = React.useState<'client' | 'trainer'>('trainer');

  const handleApply = (role: 'client' | 'trainer') => {
    setUserRole(role);
    if (role === 'trainer') {
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
        <RoleCard
          role="trainer"
          selected={selected === 'trainer'}
          setUserRole={() => setSelected('trainer')}
          icon="briefcase-outline"
        />
        <RoleCard
          role="client"
          selected={selected === 'client'}
          setUserRole={() => setSelected('client')}
          icon="person-outline"
        />
      </View>

      <Button title="Continue" onPress={() => handleApply(selected)} style={styles.button} />
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
