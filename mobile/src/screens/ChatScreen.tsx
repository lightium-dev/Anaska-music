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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../constants/theme';
import { chatService } from '../services/chatService';
import { usePlayerStore } from '../store/playerStore';
import { useUserStore } from '../store/userStore';
import { ChatMessage, PlaylistAction, Track } from '../types';

const PROMPT_SUGGESTIONS = [
  { icon: 'speedometer-outline' as const, label: 'Drop the tempo' },
  { icon: 'mic-outline' as const, label: 'Add vocal trance' },
  { icon: 'snow-outline' as const, label: 'Glacial ambient' },
  { icon: 'dice-outline' as const, label: 'Surprise me' },
  { icon: 'flash-outline' as const, label: 'Play Heavy Metal' },
  { icon: 'musical-notes-outline' as const, label: 'Make rock playlist' },
];

export const ChatScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 12);
  const bottomBarPadding = 56 + safeBottom + 28;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const { user } = useUserStore();
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
          // Welcome greeting from DJ Muse matching Obsidian minimal mock
          setMessages([
            {
              id: 'welcome',
              sessionId: history.sessionId,
              role: 'assistant',
              content:
                "Hey! I am DJ Muse, your Sub-Zero Neural Co-Pilot. 🎧 Ask me to play any track, blend frequencies, or generate a continuous set for your flow state.",
              createdAt: new Date().toISOString(),
              playlist: {
                type: 'playlist',
                title: 'Cyber Drift Vol. 1',
                description: '12 tracks • 42 mins continuous • Key Dm',
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
    const isPlaylistActive = playlist.tracks.some((t) => t.id === currentTrack?.id);

    return (
      <View style={styles.playlistBox}>
        {/* Playlist Header Card */}
        <View style={styles.playlistHeaderRow}>
          <Image
            source={{ uri: playlist.tracks[0]?.coverUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80' }}
            style={styles.playlistCover}
          />
          <View style={styles.playlistMetaCol}>
            <Text style={styles.playlistTitle} numberOfLines={1}>{playlist.title}</Text>
            <Text style={styles.playlistSubtitle} numberOfLines={1}>{playlist.description}</Text>
            <View style={styles.tagRow}>
              <View style={styles.miniTag}>
                <Text style={styles.miniTagText}>320kbps</Text>
              </View>
              <View style={styles.miniTag}>
                <Text style={styles.miniTagText}>Key Dm</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Master Play Button */}
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
          <Ionicons
            name={isPlaylistActive && isPlaying ? 'pause' : 'play'}
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.masterPlayBtnText}>
            {isPlaylistActive && isPlaying ? 'Pause Flow' : 'Play Bespoke Set'}
          </Text>
        </TouchableOpacity>

        {/* Track Rows */}
        <View style={styles.tracksContainer}>
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
                  styles.trackRow,
                  isThisTrackSelected && styles.trackRowActive,
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
                <Image source={{ uri: track.coverUrl }} style={styles.trackThumb} />

                <View style={styles.trackMetaCol}>
                  <Text
                    style={[
                      styles.trackTitle,
                      isThisTrackSelected && styles.trackTitleActive,
                    ]}
                    numberOfLines={1}
                  >
                    {track.title}
                  </Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>
                    {track.artist} • 128 BPM
                  </Text>
                </View>

                <Text style={styles.trackDuration}>
                  {formatDuration(track.duration || 180)}
                </Text>

                <View style={styles.trackActionBtn}>
                  <Ionicons
                    name={isThisTrackPlaying ? 'pause' : 'play'}
                    size={14}
                    color={isThisTrackSelected ? colors.primary : colors.textMuted}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Apply to Mix Button */}
        <TouchableOpacity
          style={styles.applyBtn}
          onPress={() => {
            if (playlist.tracks.length > 0) {
              play(playlist.tracks[0], playlist.tracks);
            }
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="list" size={14} color={colors.primary} />
          <Text style={styles.applyBtnText}>Apply to Active Mix</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.museBadgeIcon}>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
          </View>
          <View>
            <View style={styles.museTitleRow}>
              <Text style={styles.museTitle}>DJ Muse</Text>
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>v4.2</Text>
              </View>
            </View>
            <Text style={styles.museSubtitle}>Harmonic Engine Online</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.avatarMiniWrapper}>
            <Image
              source={
                user?.avatar
                  ? { uri: user.avatar }
                  : require('../../assets/avatar.png')
              }
              style={styles.avatarMini}
            />
          </View>
        </View>
      </View>

      {/* Session Control Strip */}
      <View style={styles.sessionStrip}>
        <View style={styles.sessionLeft}>
          <View style={styles.activeDot} />
          <Text style={styles.sessionTitle} numberOfLines={1}>
            {currentTrack ? currentTrack.title : 'Late Night Focus Session'}
          </Text>
          <Text style={styles.sessionBpm}>/ 128 BPM</Text>
        </View>

        <TouchableOpacity
          style={[styles.voiceBtn, isVoiceActive && styles.voiceBtnActive]}
          onPress={() => setIsVoiceActive(!isVoiceActive)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="mic-outline"
            size={14}
            color={isVoiceActive ? '#FFFFFF' : colors.primary}
          />
          <Text style={[styles.voiceBtnText, isVoiceActive && styles.voiceBtnTextActive]}>
            Voice Mode
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
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
              {/* Message Header Meta */}
              <View style={[styles.msgMeta, isUser && styles.msgMetaUser]}>
                {isUser ? (
                  <>
                    <Text style={styles.msgTime}>
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <Text style={styles.msgSenderUser}>You</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.msgSenderMuse}>DJ Muse</Text>
                    <Text style={styles.msgTime}>
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </>
                )}
              </View>

              {/* Message Bubble */}
              {isUser ? (
                <View style={styles.userBubble}>
                  <Text style={styles.userText}>{item.content}</Text>
                </View>
              ) : (
                <View style={styles.museBubble}>
                  <Text style={styles.museText}>
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

      {/* Suggestion Chips */}
      <View style={styles.suggestionsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsScroll}
        >
          {PROMPT_SUGGESTIONS.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.suggestionChip}
              onPress={() => handleSend(item.label)}
              activeOpacity={0.8}
            >
              <Ionicons name={item.icon} size={13} color={colors.primary} />
              <Text style={styles.suggestionText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputWrapper, { paddingBottom: bottomBarPadding }]}>
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.micBtn}
              onPress={() => setIsVoiceActive(!isVoiceActive)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="mic-outline"
                size={18}
                color={isVoiceActive ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Ask DJ Muse to mix, find tracks, or adapt vibe..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={300}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                Boolean(inputText.trim()) && styles.sendBtnActive,
              ]}
              onPress={() => handleSend()}
              disabled={isStreaming || !inputText.trim()}
              activeOpacity={0.85}
            >
              <Ionicons
                name="arrow-up"
                size={16}
                color={Boolean(inputText.trim()) ? '#FFFFFF' : colors.textMuted}
              />
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
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 52 : 24,
    paddingBottom: 14,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  museBadgeIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  museTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  museTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  versionBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
  },
  versionText: {
    color: '#a1a1aa',
    fontSize: 10,
    fontWeight: '600',
  },
  museSubtitle: {
    color: '#888888',
    fontSize: 11,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#262626',
    overflow: 'hidden',
  },
  avatarMini: {
    width: '100%',
    height: '100%',
  },
  sessionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
  },
  sessionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    maxWidth: '55%',
  },
  sessionBpm: {
    color: '#888888',
    fontSize: 11,
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.xs,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#262626',
  },
  voiceBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  voiceBtnText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  voiceBtnTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: 14,
    paddingBottom: 16,
  },
  messageRow: {
    marginBottom: 16,
  },
  userRow: {
    alignItems: 'flex-end',
  },
  assistantRow: {
    alignItems: 'flex-start',
  },
  msgMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  msgMetaUser: {
    justifyContent: 'flex-end',
  },
  msgSenderMuse: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  msgSenderUser: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  msgTime: {
    color: '#888888',
    fontSize: 10,
  },
  userBubble: {
    maxWidth: '85%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    borderBottomRightRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  museBubble: {
    maxWidth: '92%',
    backgroundColor: '#181818',
    borderRadius: borderRadius.md,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#262626',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  museText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 20,
  },
  playlistBox: {
    marginTop: 12,
    backgroundColor: '#111111',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#262626',
    padding: 12,
  },
  playlistHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  playlistCover: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: '#262626',
  },
  playlistMetaCol: {
    flex: 1,
  },
  playlistTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  playlistSubtitle: {
    color: '#a1a1aa',
    fontSize: 11,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  miniTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
  },
  miniTagText: {
    color: '#a1a1aa',
    fontSize: 9,
    fontWeight: '600',
  },
  masterPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xs,
    paddingVertical: 8,
    marginBottom: 10,
  },
  masterPlayBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tracksContainer: {
    gap: 6,
    marginBottom: 10,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: borderRadius.xs,
    padding: 6,
    gap: 8,
  },
  trackRowActive: {
    borderColor: colors.primary,
    backgroundColor: '#181818',
  },
  trackThumb: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: '#262626',
  },
  trackMetaCol: {
    flex: 1,
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  trackTitleActive: {
    color: colors.primary,
  },
  trackArtist: {
    color: '#888888',
    fontSize: 10,
    marginTop: 1,
  },
  trackDuration: {
    color: '#888888',
    fontSize: 10,
    fontWeight: '600',
  },
  trackActionBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: borderRadius.xs,
    paddingVertical: 7,
  },
  applyBtnText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  suggestionsWrapper: {
    paddingVertical: 6,
  },
  suggestionsScroll: {
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  inputWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
  },
  micBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    maxHeight: 70,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.xs,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: colors.primary,
  },
});
