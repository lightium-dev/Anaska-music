import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';
import { chatService } from '../services/chatService';
import { ChatMessage } from '../types';

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoadingHistory(true);
        const history = await chatService.getHistory();
        setSessionId(history.sessionId);
        if (history.messages.length > 0) {
          setMessages(history.messages);
        } else {
          // Welcome greeting from DJ Muse
          setMessages([
            {
              id: 'welcome',
              sessionId: history.sessionId,
              role: 'assistant',
              content:
                "Hey! I'm DJ Muse, your Anaska AI music companion. 🎧 Tell me what you're working on or feeling, and I'll curate the perfect soundscape!",
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.warn('Could not load chat history:', err);
        setMessages([
          {
            id: 'welcome',
            sessionId: 'local',
            role: 'assistant',
            content:
              "Hey! I'm DJ Muse, your Anaska AI music companion. 🎧 How can I assist your sonic journey today?",
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoadingHistory(false);
      }
    }

    loadHistory();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isStreaming) return;

    const userText = inputText.trim();
    setInputText('');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sessionId: sessionId || 'temp',
      role: 'user',
      content: userText,
      createdAt: new Date().toISOString(),
    };

    const assistantMsgPlaceholder: ChatMessage = {
      id: `ast-${Date.now()}`,
      sessionId: sessionId || 'temp',
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsgPlaceholder]);
    setIsStreaming(true);

    let accumulatedContent = '';

    await chatService.streamChat(
      userText,
      sessionId,
      (chunk) => {
        accumulatedContent += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: accumulatedContent,
            };
          }
          return updated;
        });
        flatListRef.current?.scrollToEnd({ animated: true });
      },
      (fullText) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: fullText,
            };
          }
          return updated;
        });
        setIsStreaming(false);
      },
      (err) => {
        console.error('Chat error:', err);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: 'Sorry, I lost my frequency for a moment! Please try asking again.',
            };
          }
          return updated;
        });
        setIsStreaming(false);
      }
    );
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.userRow : styles.assistantRow,
        ]}
      >
        {!isUser && (
          <View style={styles.museAvatar}>
            <Ionicons name="sparkles" size={16} color="#000" />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
            {item.content || (isStreaming ? 'Thinking...' : '')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerAvatar}>
            <Ionicons name="sparkles" size={18} color="#000" />
          </View>
          <View>
            <Text style={styles.headerTitle}>DJ Muse</Text>
            <Text style={styles.headerStatus}>
              {isStreaming ? 'Streaming response...' : 'Online & ready to curate'}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      {loadingHistory ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask DJ Muse about tracks, vibes, trivia..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isStreaming) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isStreaming}
        >
          {isStreaming ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Ionicons name="arrow-up" size={20} color="#000000" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerStatus: {
    color: colors.primaryAccent,
    fontSize: 12,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  museAvatar: {
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.surfaceElevated,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  userText: {
    color: '#000000',
    fontWeight: '500',
  },
  assistantText: {
    color: colors.textPrimary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 60, // Above bottom tab bar
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
