import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ScreenHeader } from '../../../components/layout';
import { Button, Segmented } from '../../../components/ui';
import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/authStore';
import theme from '../../../theme';
import { toErrorMessage } from '../../../utils/format/error';

const { colors, typography, spacing } = theme;

export function SettingsScreen() {
  const navigation = useNavigation();

  const insets = useSafeAreaInsets();

  const logout = useAuthStore((s) => s.logout);

  const deleteAccount = useAuthStore((s) => s.deleteAccount);

  const units = useAppStore((s) => s.units);

  const setUnits = useAppStore((s) => s.setUnits);

  const [busy, setBusy] = React.useState(false);

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout();
      // RootNavigator swaps to the auth stack once status is unauthenticated.
    } catch (e) {
      Alert.alert('Could not log out', toErrorMessage(e));
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete account?',
      'This permanently removes your account and data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await deleteAccount();
            } catch (e) {
              Alert.alert('Could not delete account', toErrorMessage(e));
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Settings"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, spacing.lg) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Units</Text>
        <Segmented
          options={[{ label: 'kg' }, { label: 'lb' }]}
          value={units === 'imperial' ? 1 : 0}
          onChange={(i) => setUnits(i === 1 ? 'imperial' : 'metric')}
        />

        <Text style={[styles.sectionLabel, styles.sectionGap]}>Account</Text>

        <Button
          title="Log out"
          variant="outline"
          onPress={handleLogout}
          loading={busy}
          style={styles.btn}
        />

        <Button
          title="Delete account"
          variant="outline"
          onPress={confirmDelete}
          disabled={busy}
          style={styles.deleteBtn}
          textStyle={styles.deleteText}
        />

        <Text style={styles.hint}>
          Deleting your account is permanent and removes all your data.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sectionGap: { marginTop: spacing.xl },
  btn: { marginBottom: spacing.md },
  deleteBtn: { marginBottom: spacing.md, borderColor: colors.Error },
  deleteText: { color: colors.Error },
  hint: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
