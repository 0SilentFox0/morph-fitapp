import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Avatar } from './Avatar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export interface SwitcherClient {
  id: string;
  name: string;
  avatar?: string;
  /** Short badge over the avatar, e.g. a running rest timer "1:20". */
  badge?: string;
}

interface ClientSwitcherStripProps {
  clients: SwitcherClient[];
  activeId: string | null;
  onSelect: (id: string) => void;
  /** Status line for the active client, e.g. "set 3 · rest 1:20". */
  activeSubtitle?: string;
}

/**
 * Sticky horizontal strip of client avatars for switching between simultaneous
 * trainings. The active client gets an accent ring; a small badge surfaces a
 * running rest timer so the trainer keeps real-time awareness of everyone.
 */
export function ClientSwitcherStrip({
  clients,
  activeId,
  onSelect,
  activeSubtitle,
}: ClientSwitcherStripProps) {
  if (clients.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
      >
        {clients.map((client) => {
          const active = client.id === activeId;
          const firstName = client.name.split(' ')[0];
          return (
            <TouchableOpacity
              key={client.id}
              onPress={() => onSelect(client.id)}
              style={styles.item}
              activeOpacity={0.8}
            >
              <View style={[styles.ring, active && styles.ringActive]}>
                <Avatar uri={client.avatar} name={client.name} size={48} />
                {!!client.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{client.badge}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[styles.name, active ? styles.nameActive : styles.nameInactive]}
                numberOfLines={1}
              >
                {firstName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {!!activeSubtitle && <Text style={styles.subtitle}>{activeSubtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  strip: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  item: {
    alignItems: 'center',
    width: 60,
  },
  ring: {
    padding: 2,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ringActive: {
    borderColor: colors.accent,
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    minWidth: 18,
    paddingHorizontal: 4,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
  name: {
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
    maxWidth: 60,
    textAlign: 'center',
  },
  nameActive: {
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
  nameInactive: {
    color: colors.textSecondary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
