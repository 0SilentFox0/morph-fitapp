import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useAppStore } from '../../store/appStore';

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
      // Client flow - for now go to main app
      navigation.navigate('YoureAllSet');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Ionicons name="flash" size={24} color={colors.text} />
        <Text style={styles.logoText}>FITNESS</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Choose your role</Text>
        <Text style={styles.subtitle}>To personalize your experience</Text>

        <TouchableOpacity
          onPress={() => setSelected('client')}
          activeOpacity={0.8}
        >
          <Card
            style={[
              styles.roleCard,
              selected === 'client' ? styles.roleCardSelected : undefined,
            ]}
          >
            <Ionicons
              name="person-outline"
              size={24}
              color={selected === 'client' ? '#FFFFFF' : colors.text}
            />
            <View style={styles.roleContent}>
              <Text
                style={[
                  styles.roleTitle,
                  selected === 'client' && styles.roleTitleSelected,
                ]}
              >
                I'm a client
              </Text>
              <Text
                style={[
                  styles.roleSubtitle,
                  selected === 'client' && styles.roleSubtitleSelected,
                ]}
              >
                Looking for a trainer
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                selected === 'client' ? styles.radioSelected : undefined,
              ]}
            />
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelected('trainer')}
          activeOpacity={0.8}
        >
          <Card
            style={[
              styles.roleCard,
              selected === 'trainer' ? styles.roleCardSelected : undefined,
            ]}
          >
            <Ionicons
              name="briefcase-outline"
              size={24}
              color={selected === 'trainer' ? '#FFFFFF' : colors.text}
            />
            <View style={styles.roleContent}>
              <Text
                style={[
                  styles.roleTitle,
                  selected === 'trainer' && styles.roleTitleSelected,
                ]}
              >
                I'm a trainer
              </Text>
              <Text
                style={[
                  styles.roleSubtitle,
                  selected === 'trainer' && styles.roleSubtitleSelected,
                ]}
              >
                Want to work as a trainer
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                selected === 'trainer' ? styles.radioSelected : undefined,
              ]}
            />
          </Card>
        </TouchableOpacity>

        <Button title="Apply" onPress={handleApply} style={styles.button} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 60,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  logoText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  roleCardSelected: {
    backgroundColor: colors.Accent1,
  },
  roleContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  roleTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  roleTitleSelected: {
    color: '#FFFFFF',
  },
  roleSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  roleSubtitleSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radioSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  button: {
    marginTop: spacing.xl,
  },
});
