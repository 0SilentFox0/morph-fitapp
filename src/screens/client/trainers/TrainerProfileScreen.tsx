import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type RouteProp, useRoute } from '@react-navigation/native';

import { ScreenHeader } from '../../../components/layout';
import {
  Avatar,
  Button,
  EmptyState,
  SectionTitle,
  Tag,
} from '../../../components/ui';
import type { TrainersStackParamList } from '../../../navigation/types';
import theme from '../../../theme';

const { colors, radius, typography, spacing } = theme;

import { useTabNavigation } from '../../../hooks/ui/useTabNavigation';
import { useChatStore } from '../../../store/chatStore';
import { useTrainersStore } from '../../../store/trainersStore';

type Route = RouteProp<TrainersStackParamList, 'TrainerProfile'>;

// Cross-tab navigation: from the Trainers stack up to the client tab navigator.

export function TrainerProfileScreen() {
  const route = useRoute<Route>();

  const { trainerId } = route.params;

  const trainer = useTrainersStore((s) => s.getTrainer(trainerId));

  const connect = useTrainersStore((s) => s.connect);

  const getOrCreateConversation = useChatStore(
    (s) => s.getOrCreateConversation
  );

  const tabNav = useTabNavigation();

  if (!trainer) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Trainer" transparent />
        <View style={styles.emptyWrap}>
          <EmptyState icon="person-outline" title="Trainer not found" />
        </View>
      </View>
    );
  }

  const handleMessage = () => {
    const conversation = getOrCreateConversation(trainer.id, {
      id: trainer.id,
      name: trainer.name,
      avatar: trainer.avatar ?? null,
    });

    tabNav?.navigate('ChatTab', {
      screen: 'ChatThread',
      params: { conversationId: conversation.id },
    });
  };

  const handleRequestSession = () => {
    tabNav?.navigate('ClientHomeTab', {
      screen: 'BookSession',
      params: { trainerId: trainer.id },
    });
  };

  const connectLabel =
    trainer.connection === 'connected'
      ? 'Connected'
      : trainer.connection === 'pending'
        ? 'Request sent'
        : 'Connect';

  return (
    <View style={styles.container}>
      <ScreenHeader title={trainer.name} transparent />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Avatar name={trainer.name} uri={trainer.avatar} size={84} />
          <Text style={styles.name}>{trainer.name}</Text>
          <Text style={styles.headline}>{trainer.headline}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="star" size={14} color={colors.accent} />
            <Text style={styles.metaText}>
              {trainer.rating.toFixed(1)} ({trainer.reviews} reviews)
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.textMuted}
            />
            <Text style={styles.metaText}>{trainer.location}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Button
            title={connectLabel}
            onPress={() => connect(trainer.id)}
            disabled={trainer.connection !== 'none'}
            variant={trainer.connection === 'none' ? 'primary' : 'outline'}
            style={styles.actionBtn}
          />
          <Button
            title="Message"
            variant="outline"
            onPress={handleMessage}
            style={styles.actionBtn}
          />
        </View>
        <Button
          title={`Request a session · ${trainer.pricePerSession}`}
          onPress={handleRequestSession}
        />

        {/* About */}
        <SectionTitle>About</SectionTitle>
        <Text style={styles.bio}>{trainer.bio}</Text>

        {/* Specialties */}
        <SectionTitle>Specialties</SectionTitle>
        <View style={styles.tagsRow}>
          {trainer.specialties.map((s) => (
            <Tag key={s} label={s} variant="default" />
          ))}
        </View>

        {/* Details */}
        <SectionTitle>Details</SectionTitle>
        <View style={styles.detailCard}>
          <DetailRow
            icon="time-outline"
            label="Experience"
            value={`${trainer.experienceYears} years`}
          />
          <DetailRow
            icon="ribbon-outline"
            label="Certifications"
            value={trainer.certifications.join(', ')}
          />
          <DetailRow
            icon="videocam-outline"
            label="Online sessions"
            value={trainer.online ? 'Available' : 'In-person only'}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={18} color={colors.textSecondary} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'] + spacing.tabBarInset,
    gap: spacing.md,
  },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  header: { alignItems: 'center', gap: 4 },
  name: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  headline: { fontSize: typography.sizes.base, color: colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: typography.sizes.sm, color: colors.textMuted },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1 },
  bio: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  detailCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  detailLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    width: 110,
  },
  detailValue: { fontSize: typography.sizes.sm, color: colors.text, flex: 1 },
});
