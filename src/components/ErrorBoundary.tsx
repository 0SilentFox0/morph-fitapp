import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../theme';
const { colors, spacing, radius } = theme;
import { logger } from '../services/logger';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Goes to the registered crash reporter (Sentry, …) via the logger sink.
    logger.error('Uncaught React render error', error, {
      componentStack: info.componentStack,
    });
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <TouchableOpacity onPress={this.reset} style={styles.button}>
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.screenBg,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  message: {
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  buttonText: {
    color: colors.text,
    fontWeight: '600',
  },
});
