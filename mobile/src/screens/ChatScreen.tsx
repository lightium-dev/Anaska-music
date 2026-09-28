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
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../constants/theme';
import { chatService } from '../services/chatService';
import { usePlayerStore } from '../store/playerStore';
import { ChatMessage } from '../types';

const PROMPT_SUGGESTIONS = [
  'Boost sub-bass +4dB',
  'Transition to Ambient',
  'Late night coding cryo set',
  'More synthwave tempo',
];

export const ChatScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 12);
  const bottomBarPadding = 56 + safeBottom + 36;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const { play } = usePlayerStore();
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
                "Hey Alex! I'm DJ Muse, your Sub-Zero Neural Co-Pilot. 🎧 I noticed your late-night session and synthesized a bespoke continuous set blending analog basslines with dark atmospheric textures. Want to tune into the frequencies?",
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        setMessages([
          {
            id: 'welcome',
            sessionId: 'local',
            role: 'assistant',
            content:
              "Welcome to Anaska. I am DJ Muse, your Sub-Zero audio companion. What sonic atmosphere would you like to explore?",
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoadingHistory(false);
      }
    }

    loadHistory();
  }, []);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText.trim();
    if (!textToSend || isStreaming) return;

    if (!customPrompt) setInputText('');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sessionId: sessionId || 'temp',
      role: 'user',
      content: textToSend,
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

    const validSessionId = sessionId && sessionId !== 'local' && sessionId !== 'temp' ? sessionId : undefined;

    await chatService.streamChat(
      textToSend,
      validSessionId,
      (chunk) => {
        accumulatedContent += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: accumulatedContent,
            };
          }
          return updated;
        });
      },
      (completeText) => {
        setIsStreaming(false);
      },
      (error) => {
        setIsStreaming(false);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: accumulatedContent || "The stream encounter an interruption in neural signal. Let's try again.",
            };
          }
          return updated;
        });
      }
    );
  };

  const renderBespokeSetWidget = () => (
    <View style={styles.bespokeWidget}>
      <View style={styles.bespokeTopRow}>
        <View style={styles.bespokeArtWrapper}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
            }}
            style={styles.bespokeArt}
          />
          <View style={styles.bespokeArtPlayOverlay}>
            <Ionicons name="play" size={12} color={colors.primary} />
          </View>
        </View>

        <View style={styles.bespokeMetaCol}>
          <Text style={styles.bespokeTitle}>Cyber Drift Vol. 1</Text>
          <Text style={styles.bespokeSub}>12 tracks • 42 mins continuous</Text>
          <View style={styles.bespokeTagRow}>
            <View style={styles.miniTag}>
              <Text style={styles.miniTagText}>320kbps</Text>
            </View>
            <View style={[styles.miniTag, styles.miniTagCyan]}>
              <Text style={[styles.miniTagText, { color: colors.secondary }]}>Key Dm</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Waveform Visualization */}
      <View style={styles.waveformContainer}>
        {[6, 12, 18, 14, 22, 16, 8, 20, 24, 12, 18, 22, 14, 8, 16, 22, 10].map((h, i) => (
          <View
            key={i}
            style={[
              styles.waveBar,
              {
                height: h,
                backgroundColor: i % 3 === 0 ? colors.primary : colors.secondary,
              },
            ]}
          />
        ))}
      </View>

      {/* Play Action */}
      <TouchableOpacity
        style={styles.bespokePlayBtn}
        onPress={() => {
          play({
            id: 'dj-muse-bespoke',
            title: 'Cyber Drift Vol. 1',
            artist: 'DJ Muse AI Curated',
            genreId: 'synthwave',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
            duration: 372,
          });
        }}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#00F2FE', '#38BDF8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bespokePlayGradient}
        >
          <Ionicons name="play" size={14} color="#002022" />
          <Text style={styles.bespokePlayText}>Play Bespoke Set</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topAura} />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarRing}>
            <LinearGradient
              colors={['#00F2FE', '#38BDF8']}
              style={styles.avatarRingGradient}
            >
              <Ionicons name="sparkles" size={16} color="#002022" />
            </LinearGradient>
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.headerTitle}>DJ Muse</Text>
              <View style={styles.livePulse}>
                <View style={styles.livePulseDot} />
              </View>
            </View>
            <Text style={styles.headerSubtitle}>NEURAL CO-PILOT • ACTIVE</Text>
          </View>
        </View>

        <View style={styles.headerTag}>
          <Text style={styles.headerTagText}>AI FREQUENCY 440HZ</Text>
        </View>
      </View>

      {/* Chat Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isUser = item.role === 'user';
          return (
            <View
              style={[
                styles.messageRow,
                isUser ? styles.userRow : styles.assistantRow,
              ]}
            >
              {/* Message Header */}
              <View style={[styles.msgMetaRow, isUser && styles.msgMetaRowRight]}>
                <Text style={isUser ? styles.userNameText : styles.museNameText}>
                  {isUser ? 'You' : 'DJ Muse'}
                </Text>
                <Text style={styles.timestampText}>
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              {/* Message Bubble */}
              {isUser ? (
                <LinearGradient
                  colors={['#0284C7', '#0369A1', '#0F2747']}
                  style={styles.userBubble}
                >
                  <Text style={styles.userMessageText}>{item.content}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.assistantBubble}>
                  <Text style={styles.assistantMessageText}>
                    {item.content || (isStreaming ? 'Synthesizing frequencies...' : '')}
                  </Text>

                  {/* Show bespoke set widget on first message */}
                  {index === 0 && renderBespokeSetWidget()}
                </View>
              )}
            </View>
          );
        }}
      />

      {/* Prompt Suggestion Chips */}
      <View style={styles.suggestionsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsScroll}
        >
          {PROMPT_SUGGESTIONS.map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              style={styles.suggestionChip}
              onPress={() => handleSend(suggestion)}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles-outline" size={12} color={colors.primary} />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputContainer, { paddingBottom: bottomBarPadding }]}>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask DJ Muse for bespoke curation..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={300}
            />

            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => handleSend()}
              disabled={isStreaming || !inputText.trim()}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#00F2FE', '#38BDF8']}
                style={styles.sendButtonGradient}
              >
                {isStreaming ? (
                  <ActivityIndicator size="small" color="#002022" />
                ) : (
                  <Ionicons name="arrow-up" size={18} color="#002022" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topAura: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(7, 11, 20, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 242, 254, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  avatarRingGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 242, 254, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePulseDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  headerSubtitle: {
    color: colors.secondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  headerTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.25)',
  },
  headerTagText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 20,
    gap: 16,
  },
  messageRow: {
    width: '100%',
  },
  userRow: {
    alignItems: 'flex-end',
  },
  assistantRow: {
    alignItems: 'flex-start',
  },
  msgMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  msgMetaRowRight: {
    flexDirection: 'row-reverse',
  },
  museNameText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  userNameText: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  timestampText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },
  userBubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.35)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  userMessageText: {
    color: colors.textFrost,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  assistantBubble: {
    maxWidth: '92%',
    padding: 14,
    borderRadius: borderRadius.lg,
    borderTopLeftRadius: 4,
    backgroundColor: 'rgba(23, 32, 48, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  assistantMessageText: {
    color: colors.textFrost,
    fontSize: 14,
    lineHeight: 21,
  },
  bespokeWidget: {
    marginTop: 12,
    padding: 10,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(10, 15, 26, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.25)',
  },
  bespokeTopRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bespokeArtWrapper: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0E1829',
  },
  bespokeArt: {
    width: '100%',
    height: '100%',
  },
  bespokeArtPlayOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(7, 11, 20, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bespokeMetaCol: {
    flex: 1,
  },
  bespokeTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  bespokeSub: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  bespokeTagRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  miniTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
  },
  miniTagCyan: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  miniTagText: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 28,
    marginVertical: 10,
    backgroundColor: 'rgba(16, 26, 43, 0.7)',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.15)',
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
  },
  bespokePlayBtn: {
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  bespokePlayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  bespokePlayText: {
    color: '#002022',
    fontSize: 12,
    fontWeight: '800',
  },
  suggestionsContainer: {
    paddingVertical: 6,
  },
  suggestionsScroll: {
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(14, 24, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.25)',
  },
  suggestionText: {
    color: colors.textFrost,
    fontSize: 12,
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: 4,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    backgroundColor: 'rgba(7, 11, 20, 0.95)',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 23, 42, 0.95)',
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    color: colors.textFrost,
    fontSize: 14,
    maxHeight: 80,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
