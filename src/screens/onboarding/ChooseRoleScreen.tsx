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
      navigation.replace('WelcomeTrainer');
    } else {
      // Client flow - for now go to main app
      navigation.replace('YoureAllSet');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Ionicons name="flash" size={24} color={colors.text} />
        <Text style={styles.logoText}>FITNESS</Text>
      </View>
      <View style={styles.body}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Choose your role</Text>
          <Text style={styles.subtitle}>To personalize your experience</Text>

          <TouchableOpacity onPress={() => setSelected('client')} activeOpacity={0.8}>
            <Card
              style={[styles.roleCard, selected === 'client' ? styles.roleCardSelected : undefined]}
            >
              <View style={[styles.iconBg, selected === 'client' && styles.iconBgSelected]}>
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={selected === 'client' ? '#FFFFFF' : colors.text}
                />
              </View>
              <View style={styles.roleContent}>
                <Text style={[styles.roleTitle, selected === 'client' && styles.roleTitleSelected]}>
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
                  styles.radioBorder,
                  selected === 'client' ? styles.radioBorderSelected : undefined,
                ]}
              >
                <View
                  style={[styles.radio, selected === 'client' ? styles.radioSelected : undefined]}
                />
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setSelected('trainer')} activeOpacity={0.8}>
            <Card
              style={[
                styles.roleCard,
                selected === 'trainer' ? styles.roleCardSelected : undefined,
              ]}
            >
              <View style={[styles.iconBg, selected === 'trainer' && styles.iconBgSelected]}>
                <Ionicons
                  name="briefcase-outline"
                  size={24}
                  color={selected === 'trainer' ? '#FFFFFF' : colors.text}
                />
              </View>
              <View style={styles.roleContent}>
                <Text
                  style={[styles.roleTitle, selected === 'trainer' && styles.roleTitleSelected]}
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
                  styles.radioBorder,
                  selected === 'trainer' ? styles.radioBorderSelected : undefined,
                ]}
              >
                <View
                  style={[styles.radio, selected === 'trainer' ? styles.radioSelected : undefined]}
                />
              </View>
            </Card>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Apply" onPress={handleApply} style={styles.button} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 80,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    marginHorizontal: 'auto',
  },
  logoText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.tabBarInset + spacing.xl,
  },
  body: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.heavy,
    color: colors.text,
    marginBottom: spacing.sm,
    marginHorizontal: 'auto',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    marginHorizontal: 'auto',
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF0D',
  },
  roleCardSelected: {
    backgroundColor: colors.SelectedCards,
  },
  iconBg: {
    backgroundColor: colors.Secondary2,
    padding: spacing.md,
    borderRadius: 8,
  },
  iconBgSelected: {
    backgroundColor: colors.Secondary3,
  },
  roleContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  roleTitle: {
    fontSize: typography.sizes['xl'],
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
  radioBorder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  },
  radioBorderSelected: {
    borderColor: '#AE451F',
    backgroundColor: colors.SelectedCards,
  },
  radio: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
  radioSelected: {
    backgroundColor: '#AE451F',
  },
  button: {
    marginTop: spacing.xl,
  },
});
