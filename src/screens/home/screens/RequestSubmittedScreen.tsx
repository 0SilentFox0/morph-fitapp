import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../../components/ui';
import type { HomeStackParamList } from '../../../navigation/types';
import theme from '../../../theme';

const { colors, radius, typography, spacing } = theme;

type Nav = NativeStackNavigationProp<HomeStackParamList, 'RequestSubmitted'>;
type Route = RouteProp<HomeStackParamList, 'RequestSubmitted'>;

export function RequestSubmittedScreen() {
  const navigation = useNavigation<Nav>();

  const route = useRoute<Route>();

  // Who has to approve, in whatever context this modal is shown (a trainer sees
  // the client's name; a client sees the trainer's). Neutral fallback when unknown.
  const approver = route.params?.counterpartName?.trim() || 'the other person';

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={48} color={colors.white} />
        </View>
        <Text style={styles.title}>Request submitted</Text>
        <Text style={styles.message}>
          The session time is confirmed once {approver} approves it. Otherwise it
          will be canceled in 8 hr.
        </Text>
        <Button
          title="Done"
          onPress={() => navigation.goBack()}
          style={styles.primaryBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.neutral2,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  primaryBtn: {
    width: '100%',
    marginBottom: spacing.md,
  },
});
