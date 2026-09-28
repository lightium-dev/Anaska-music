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
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../constants/theme';
import { chatService } from '../services/chatService';
import { usePlayerStore } from '../store/playerStore';
import { ChatMessage, PlaylistAction, Track } from '../types';

const PROMPT_SUGGESTIONS = [
  '⚡ Play some Heavy Metal',
  '🎸 Make an indie rock playlist',
  '🏎️ Play Neon Horizon',
  '☕ Make a Lo-Fi study mix',
  '🌌 Curate an Ambient set',
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

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);

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
                "Hey! I am DJ Muse, your Sub-Zero Neural Co-Pilot. 🎧 Ask me to play any track, genre, or artist, or say 'make a rock playlist' and I will curate and launch your frequencies on the fly!",
              createdAt: new Date().toISOString(),
              playlist: {
                type: 'playlist',
                title: '⚡ Cyber Drift Initiation',
                description: 'Synthwave & Electronic continuous starter flow',
                tracks: [
                  {
                    id: 'track-1',
                    title: 'Neon Horizon',
                    artist: 'Cyberpulse',
                    genreId: 'synthwave',
                    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
                    duration: 372,
                  },
                  {
                    id: 'track-2',
                    title: 'Midnight Drive',
                    artist: 'Vector Runner',
                    genreId: 'synthwave',
                    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
                    duration: 423,
                  },
                  {
                    id: 'track-metal-1',
                    title: 'Cyberpunk Industrial Metal',
                    artist: 'Distorted Orion',
                    genreId: 'metal',
                    audioUrl: 'https://discoveryprovider.audius.co/v1/tracks/GEB4kJw/stream?app_name=ANASKA',
                    coverUrl: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=600&auto=format&fit=crop&q=80',
                    duration: 245,
                  },
                ],
              },
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
      (completeText, playlist) => {
        setIsStreaming(false);
        if (playlist) {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
              updated[lastIndex] = {
                ...updated[lastIndex],
                playlist,
              };
            }
            return updated;
          });

          // If autoPlay requested (e.g. "play Neon Horizon" or "play rock"), immediately start playing!
          if (playlist.autoPlay && playlist.tracks.length > 0) {
            play(playlist.tracks[0], playlist.tracks);
          }
        }
      },
      (error) => {
        setIsStreaming(false);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: accumulatedContent || "Encountered a momentary neural interruption. Try asking again!",
            };
          }
          return updated;
        });
      }
    );
  };

  const renderPlaylistWidget = (playlist: PlaylistAction) => {
    const isPlaylistActive =
      playlist.tracks.some((t) => t.id === currentTrack?.id);

    return (
      <View style={styles.playlistCard}>
        {/* Header */}
        <View style={styles.playlistHeader}>
          <View style={styles.playlistHeaderLeft}>
            <View style={styles.playlistIconCircle}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.playlistTitle}>{playlist.title}</Text>
              <Text style={styles.playlistSub} numberOfLines={2}>
                {playlist.description}
              </Text>
            </View>
          </View>
        </View>

        {/* Master Play Button & Shuffle Bar */}
        <View style={styles.playlistActionsRow}>
          <TouchableOpacity
            style={styles.masterPlayBtn}
            onPress={() => {
              if (playlist.tracks.length > 0) {
                if (isPlaylistActive && isPlaying) {
                  pause();
                } else {
                  play(playlist.tracks[0], playlist.tracks);
                }
              }
            }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#00F2FE', '#38BDF8', '#0284C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.masterPlayGradient}
            >
              <Ionicons
                name={isPlaylistActive && isPlaying ? 'pause' : 'play'}
                size={16}
                color="#002022"
              />
              <Text style={styles.masterPlayText}>
                {isPlaylistActive && isPlaying ? 'Pause Flow' : 'Play Full Playlist'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shuffleIconBtn}
            onPress={() => {
              toggleShuffle();
              if (playlist.tracks.length > 0) {
                const randomIdx = Math.floor(Math.random() * playlist.tracks.length);
                play(playlist.tracks[randomIdx], playlist.tracks);
              }
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="shuffle" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Track List Items */}
        <View style={styles.tracksListContainer}>
          {playlist.tracks.map((track, idx) => {
            const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;
            const isThisTrackSelected = currentTrack?.id === track.id;

            const formatDuration = (sec: number) => {
              const m = Math.floor(sec / 60);
              const s = sec % 60;
              return `${m}:${s < 10 ? '0' : ''}${s}`;
            };

            return (
              <TouchableOpacity
                key={track.id || idx}
                style={[
                  styles.trackItemRow,
                  isThisTrackSelected && styles.trackItemRowSelected,
                ]}
                onPress={() => {
                  if (isThisTrackSelected && isPlaying) {
                    pause();
                  } else {
                    play(track, playlist.tracks);
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={styles.trackThumbWrapper}>
                  <Image source={{ uri: track.coverUrl }} style={styles.trackThumb} />
                  <View style={styles.trackThumbOverlay}>
                    <Ionicons
                      name={isThisTrackPlaying ? 'pause' : 'play'}
                      size={12}
                      color="#FFFFFF"
                    />
                  </View>
                </View>

                <View style={styles.trackItemMeta}>
                  <Text
                    style={[
                      styles.trackItemTitle,
                      isThisTrackSelected && styles.trackItemTitleActive,
                    ]}
                    numberOfLines={1}
                  >
                    {track.title}
                  </Text>
                  <Text style={styles.trackItemArtist} numberOfLines={1}>
                    {track.artist}
                  </Text>
                </View>

                <Text style={styles.trackItemDuration}>
                  {formatDuration(track.duration || 180)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

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
        renderItem={({ item }) => {
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

                  {/* Render Curated Interactive Playlist Card */}
                  {item.playlist && renderPlaylistWidget(item.playlist)}
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
              placeholder="Ask DJ Muse to play songs or make playlists..."
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
                colors={
                  !inputText.trim() || isStreaming
                    ? ['#1A283F', '#1A283F']
                    : ['#00F2FE', '#38BDF8']
                }
                style={styles.sendGradient}
              >
                <Ionicons
                  name="arrow-up"
                  size={18}
                  color={!inputText.trim() || isStreaming ? colors.textMuted : '#002022'}
                />
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
    top: -50,
    alignSelf: 'center',
    width: 340,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 242, 254, 0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 52 : 20,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(56, 189, 248, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
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
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  headerTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
  },
  headerTagText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 20,
  },
  messageRow: {
    marginBottom: spacing.md,
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
    paddingHorizontal: 4,
  },
  msgMetaRowRight: {
    justifyContent: 'flex-end',
  },
  userNameText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  museNameText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timestampText: {
    color: colors.textMuted,
    fontSize: 10,
  },
  userBubble: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    borderBottomRightRadius: 2,
  },
  userMessageText: {
    color: '#F0F9FF',
    fontSize: 14,
    lineHeight: 20,
  },
  assistantBubble: {
    maxWidth: '92%',
    backgroundColor: 'rgba(14, 24, 42, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  assistantMessageText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },
  playlistCard: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(7, 11, 20, 0.95)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.35)',
    padding: 12,
    width: '100%',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  playlistHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  playlistHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  playlistIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  playlistSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  playlistActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  masterPlayBtn: {
    flex: 1,
    height: 38,
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
  },
  masterPlayGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  masterPlayText: {
    color: '#002022',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  shuffleIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tracksListContainer: {
    gap: 6,
  },
  trackItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.1)',
  },
  trackItemRowSelected: {
    borderColor: 'rgba(0, 242, 254, 0.5)',
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
  },
  trackThumbWrapper: {
    width: 34,
    height: 34,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 10,
  },
  trackThumb: {
    width: '100%',
    height: '100%',
  },
  trackThumbOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackItemMeta: {
    flex: 1,
    marginRight: 8,
  },
  trackItemTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  trackItemTitleActive: {
    color: colors.primary,
  },
  trackItemArtist: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  trackItemDuration: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  suggestionsContainer: {
    paddingVertical: spacing.xs,
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
    backgroundColor: 'rgba(14, 24, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.25)',
  },
  suggestionText: {
    color: colors.textFrost,
    fontSize: 11,
    fontWeight: '600',
  },
  inputContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 19, 43, 0.95)',
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  textInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    maxHeight: 80,
    paddingVertical: 6,
    marginRight: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sendGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
