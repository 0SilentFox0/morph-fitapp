import React from 'react';

import {
  MessageBubble,
  SessionMessageCard,
  SystemMessageCard,
} from '../../../components/ui';
import type { ChatMessage } from '../../../store/chatStore';

interface MessageListProps {
  messages: ChatMessage[];
  onStartSession: () => void;
}

/** Renders the chat message stream, dispatching on each message variant. */
export function MessageList({ messages, onStartSession }: MessageListProps) {
  return (
    <>
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
                onStart={onStartSession}
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
    </>
  );
}
