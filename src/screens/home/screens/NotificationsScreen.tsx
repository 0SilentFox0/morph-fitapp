import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ScreenHeader } from '../../../components/layout';
import { AsyncBoundary, Card } from '../../../components/ui';
import { useAsyncResource } from '../../../hooks/data/useAsyncResource';
import {
  loadNotifications,
  markAllRead,
  markRead,
  type UiNotification,
} from '../../../services/repositories/notificationsRepository';
import theme from '../../../theme';
import { formatRelativeTime } from '../../../utils';

const { colors, radius, typography, spacing } = theme;

export function NotificationsScreen() {
  const navigation = useNavigation();

  const { data, status, error, refetch } = useAsyncResource(() =>
    loadNotifications()
  );

  const [items, setItems] = React.useState<UiNotification[]>([]);

  React.useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  const hasUnread = items.some((n) => !n.read);

  const handleOpen = async (n: UiNotification) => {
    if (n.read) return;

    setItems((prev) =>
      prev.map((i) => (i.id === n.id ? { ...i, read: true } : i))
    );
    try {
      await markRead(n.id);
    } catch {
      // Optimistic; a failed read is harmless and self-heals on next load.
    }
  };

  const handleMarkAll = async () => {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    try {
      await markAllRead();
    } catch {
      // Optimistic.
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Notifications"
        showBack
        onBack={() => navigation.goBack()}
        rightElement={
          hasUnread ? (
            <TouchableOpacity onPress={handleMarkAll}>
              <Text style={styles.markAll}>Mark all</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <AsyncBoundary
        status={status}
        error={error}
        onRetry={refetch}
        errorTitle="Couldn't load notifications"
        isEmpty={items.length === 0}
        emptyLabel="You're all caught up"
        emptyIcon="notifications-outline"
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {items.map((n) => (
            <Card
              key={n.id}
              style={n.read ? styles.row : styles.rowUnread}
              onPress={() => handleOpen(n)}
            >
              <View style={styles.rowHeader}>
                <Text style={styles.title} numberOfLines={1}>
                  {n.title}
                </Text>
                {!n.read && <View style={styles.dot} />}
              </View>
              <Text style={styles.body}>{n.body}</Text>
              <Text style={styles.time}>{formatRelativeTime(n.createdAt)}</Text>
            </Card>
          ))}
        </ScrollView>
      </AsyncBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
  },
  markAll: {
    fontSize: typography.sizes.sm,
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
  row: { marginBottom: spacing.md },
  rowUnread: {
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    marginLeft: spacing.sm,
  },
  body: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  time: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
