import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ChatStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { MessageBubble, SessionMessageCard, SystemMessageCard } from '../../components/ui';
import { colors } from '../../theme/colors';
import { radius } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useChatStore } from '../../store/chatStore';
import { ChatOptionsSheet, ChatAttachmentSheet, type ChatOptionAction } from './components';
import { useDisclosure } from '../../hooks/useDisclosure';

type Route = RouteProp<ChatStackParamList, 'ChatThread'>;
type Nav = NativeStackNavigationProp<ChatStackParamList, 'ChatThread'>;

export function ChatThreadScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { conversationId } = route.params;

  const conversation = useChatStore((s) => s.conversations.find((c) => c.id === conversationId));
  // Default outside the selector: returning a fresh `[]` from the selector makes
  // zustand see a new reference every render (Object.is) and loops forever for
  // conversations with no seeded messages.
  const messages = useChatStore((s) => s.messagesByConversation[conversationId]) ?? [];
  const sendMessage = useChatStore((s) => s.sendMessage);
  const markAsRead = useChatStore((s) => s.markAsRead);

  const [input, setInput] = React.useState('');
  const optionsSheet = useDisclosure();
  const attachSheet = useDisclosure();
  const scrollRef = React.useRef<ScrollView>(null);
  const scrollTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const title = conversation?.participant.name ?? 'Chat';

  React.useEffect(() => {
    markAsRead(conversationId);
  }, [conversationId, markAsRead]);

  React.useEffect(
    () => () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    },
    []
  );

  const scrollToEndSoon = () => {
    scrollTimeout.current = setTimeout(
      () => scrollRef.current?.scrollToEnd({ animated: true }),
      100
    );
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendMessage(conversationId, text);
    setInput('');
    scrollToEndSoon();
  };

  const handlePickAttachment = (uri: string) => {
    // Mock app: represent a sent photo as a text message referencing it.
    attachSheet.close();
    void uri;
    sendMessage(conversationId, '📷 Photo');
    scrollToEndSoon();
  };

  const handleStartSession = () => {
    Alert.alert('Start session', `Start the session for "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start',
        onPress: () => {
          sendMessage(conversationId, 'Session started — timer running.');
          scrollToEndSoon();
        },
      },
    ]);
  };

  const handleOption = (action: ChatOptionAction) => {
    optionsSheet.close();
    switch (action) {
      case 'reschedule':
        sendMessage(conversationId, 'Requested to reschedule the session.');
        scrollToEndSoon();
        break;
      case 'cancel':
        Alert.alert('Cancel session', `Cancel the session for "${title}"?`, [
          { text: 'Keep', style: 'cancel' },
          {
            text: 'Cancel session',
            style: 'destructive',
            onPress: () => {
              sendMessage(conversationId, 'Session was cancelled.');
              scrollToEndSoon();
            },
          },
        ]);
        break;
      case 'viewClient':
        Alert.alert('Client profile', `Viewing ${title}'s profile.`);
        break;
      case 'viewProgram':
        Alert.alert('Program', `Viewing the program for ${title}.`);
        break;
      case 'addClient':
        // Concrete in-stack destination: pick a client to add.
        navigation.navigate('NewChat');
        break;
    }
  };

  const hasInput = input.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header: back, left-aligned title, more menu (Figma node 2006:10369) */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={optionsSheet.open}
          hitSlop={8}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {conversation ? (
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((msg) => {
            switch (msg.kind) {
              case 'text':
                return (
                  <MessageBubble
                    key={msg.id}
                    text={msg.text}
                    sentAt={msg.sentAt}
                    isFromMe={msg.isFromMe}
                  />
                );
              case 'session':
                return (
                  <SessionMessageCard
                    key={msg.id}
                    title={msg.session.title}
                    date={msg.session.date}
                    time={msg.session.time}
                    participants={msg.session.participants}
                    sentAt={msg.sentAt}
                    onStart={handleStartSession}
                  />
                );
              case 'sessionStarted':
                return (
                  <SystemMessageCard
                    key={msg.id}
                    title="Session started"
                    subtitle="Timer running"
                    sentAt={msg.sentAt}
                  />
                );
            }
          })}
        </ScrollView>
      ) : (
        <View style={styles.center}>
          <Text style={styles.errorText}>Conversation not found</Text>
        </View>
      )}

      {/* Message bar: attach, text input, mic/send (Figma node 2006:10439) */}
      <View style={[styles.inputRow, { paddingBottom: spacing.md + insets.bottom }]}>
        <TouchableOpacity
          style={styles.iconBox}
          onPress={attachSheet.open}
          activeOpacity={0.7}
        >
          <Ionicons name="link-outline" size={24} color={colors.neutral8} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.neutral5}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={1000}
          onSubmitEditing={handleSend}
        />

        <TouchableOpacity
          style={styles.iconBox}
          onPress={hasInput ? handleSend : undefined}
          disabled={!hasInput}
          activeOpacity={0.7}
        >
          <Ionicons
            name={hasInput ? 'send' : 'mic-outline'}
            size={20}
            color={hasInput ? colors.accent : colors.neutral8}
          />
        </TouchableOpacity>
      </View>

      <ChatOptionsSheet
        visible={optionsSheet.visible}
        title={title}
        onClose={optionsSheet.close}
        onSelect={handleOption}
      />

      <ChatAttachmentSheet
        visible={attachSheet.visible}
        onClose={attachSheet.close}
        onPick={handlePickAttachment}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.sizes.xl,
    lineHeight: 28,
    color: colors.text,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: typography.sizes.base,
    color: colors.textMuted,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md - 3,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral1,
    borderWidth: 1,
    borderColor: colors.neutral5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.neutral1,
    borderWidth: 1,
    borderColor: colors.neutral5,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.sm,
    lineHeight: 22,
    color: colors.text,
  },
});
