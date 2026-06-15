import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import theme from '../../theme';
const { colors, spacing } = theme;
import { EmptyState } from './EmptyState';
import { toErrorMessage } from '../../utils';
import type { AsyncStatus } from '../../hooks/data/useAsyncResource';

export interface AsyncBoundaryProps {
  status: AsyncStatus;
  error?: unknown;
  /** Show the empty state instead of children when the fetch succeeded with no rows. */
  isEmpty?: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
  errorTitle?: string;
  emptyLabel?: string;
  emptyIcon?: React.ComponentProps<typeof EmptyState>['icon'];
}

/**
 * Renders the standard loading / error+retry / empty / content states around an
 * async resource so screens don't hand-roll them. Pairs with useAsyncResource.
 */
export function AsyncBoundary({
  status,
  error,
  isEmpty,
  onRetry,
  children,
  errorTitle = 'Something went wrong',
  emptyLabel = 'Nothing here yet',
  emptyIcon = 'file-tray-outline',
}: AsyncBoundaryProps) {
  if (status === 'loading' || status === 'idle') {
    return (
      <View testID="async-loading" style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View testID="async-error" style={styles.centered}>
        <EmptyState
          icon="cloud-offline-outline"
          title={errorTitle}
          subtitle={toErrorMessage(error)}
          actionLabel={onRetry ? 'Retry' : undefined}
          onAction={onRetry ? () => onRetry() : undefined}
          actionTestID="async-retry"
        />
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View testID="async-empty" style={styles.centered}>
        <EmptyState icon={emptyIcon} title={emptyLabel} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
  },
});
