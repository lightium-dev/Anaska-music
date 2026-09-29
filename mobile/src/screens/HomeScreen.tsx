import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { useUserStore } from '../store/userStore';
import { usePlayerStore } from '../store/playerStore';
import { musicService } from '../services/musicService';
import { Track, Genre } from '../types';

const FILTER_TAGS = [
  'All',
  'Chill',
  'Electronic',
  'Rock',
  'Metal',
  'Synthwave',
  'Ambient',
];

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const user = useUserStore((s) => s.user);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  const [activeFilter, setActiveFilter] = useState('All');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [genreList, trackList] = await Promise.all([
        musicService.getGenres(),
        musicService.getTracks(),
      ]);
      setGenres(genreList);
      setTracks(trackList);
    } catch (err) {
      console.warn('Using local fallback music feed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  // Filtered tracks
  const filteredTracks = tracks.filter((t) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Chill') return t.genreId === 'lofi' || t.genreId === 'ambient';
    if (activeFilter === 'Electronic') return t.genreId === 'electronic' || t.genreId === 'synthwave';
    if (activeFilter === 'Rock') return t.genreId === 'rock';
    if (activeFilter === 'Metal') return t.genreId === 'metal';
    if (activeFilter === 'Synthwave') return t.genreId === 'synthwave';
    if (activeFilter === 'Ambient') return t.genreId === 'ambient';
    return true;
  });

  const heroTrack = tracks[0] || {
    id: 'hero-default',
    title: 'Neural Hyperdrive - Vol. 4',
    artist: 'Kavinsky • Muse AI Session',
    genreId: 'synthwave',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl:
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    duration: 372,
  };

  const isHeroPlaying = currentTrack?.id === heroTrack.id && isPlaying;

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <View style={styles.headerBrandRow}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerBrandText}>ANASKA</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.7}
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => navigation.navigate('ProfileTab')}
            activeOpacity={0.8}
            accessibilityLabel="Profile"
          >
            <Image
              source={
                user?.avatar &&
                (user.avatar.startsWith('http') ||
                  user.avatar.startsWith('file:') ||
                  user.avatar.startsWith('content:') ||
                  user.avatar.startsWith('data:'))
                  ? { uri: user.avatar }
                  : require('../../assets/avatar.png')
              }
              style={styles.avatarImg}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primaryLight}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting & DJ Muse Status */}
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.sessionMetaLabel}>GLACIAL SESSION</Text>
            <Text style={styles.greetingTitle}>
              Good evening, {user?.username || 'Alex'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.museChip}
            onPress={() => navigation.navigate('ChatTab')}
            activeOpacity={0.8}
          >
            <View style={styles.musePulseDot} />
            <Text style={styles.museChipText}>DJ MUSE</Text>
          </TouchableOpacity>
        </View>

        {/* Flat Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsScroll}
          style={styles.filterRow}
        >
          {FILTER_TAGS.map((tag) => {
            const isActive = activeFilter === tag;
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setActiveFilter(tag)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isActive && styles.filterPillTextActive,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* AI-Curated Feature Card */}
        <View style={styles.featureCard}>
          <View style={styles.featureCardHeader}>
            <Text style={styles.featureTag}>AI CURATED FOCUS</Text>
            <Text style={styles.featureBpm}>132 BPM</Text>
          </View>

          <View style={styles.featureBody}>
            <View style={styles.featureArtContainer}>
              <Image source={{ uri: heroTrack.coverUrl }} style={styles.featureArt} />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle} numberOfLines={1}>
                {heroTrack.title}
              </Text>
              <Text style={styles.featureArtist} numberOfLines={1}>
                {heroTrack.artist} • Muse Session
              </Text>
              <Text style={styles.featureSub} numberOfLines={1}>
                Glacial synthetic progression
              </Text>
            </View>
          </View>

          <View style={styles.featureFooter}>
            <TouchableOpacity
              style={styles.promptMuseBtn}
              onPress={() => navigation.navigate('ChatTab')}
              activeOpacity={0.7}
            >
              <Ionicons name="mic-outline" size={15} color={colors.textSecondary} />
              <Text style={styles.promptMuseText}>Prompt Muse</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playMixBtn}
              onPress={() => {
                if (isHeroPlaying) {
                  pause();
                } else {
                  play(heroTrack, [heroTrack, ...tracks]);
                }
              }}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isHeroPlaying ? 'pause' : 'play'}
                size={14}
                color="#FFFFFF"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.playMixBtnText}>
                {isHeroPlaying ? 'Pause Mix' : 'Play Mix'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recommended Carousel */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Recommended</Text>
            <Text style={styles.sectionSubtitle}>Curated for your daily timeline</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        >
          {tracks.slice(0, 6).map((track) => {
            const isThisPlaying = currentTrack?.id === track.id && isPlaying;
            return (
              <TouchableOpacity
                key={track.id}
                style={styles.carouselCard}
                onPress={() => play(track, tracks)}
                activeOpacity={0.85}
              >
                <View style={styles.carouselArtWrapper}>
                  <Image source={{ uri: track.coverUrl }} style={styles.carouselArt} />
                  {isThisPlaying && (
                    <View style={styles.playingBadge}>
                      <Ionicons name="volume-high" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <Text style={styles.carouselTitle} numberOfLines={1}>
                  {track.title}
                </Text>
                <Text style={styles.carouselArtist} numberOfLines={1}>
                  {track.artist}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Heavy Rotation Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Heavy Rotation</Text>
          <Text style={styles.sectionBadge}>
            {filteredTracks.length} TRACKS
          </Text>
        </View>

        <View style={styles.trackList}>
          {filteredTracks.map((track, idx) => {
            const isSelected = currentTrack?.id === track.id;
            const isThisPlaying = isSelected && isPlaying;

            return (
              <TouchableOpacity
                key={track.id}
                style={[styles.trackRow, isSelected && styles.trackRowActive]}
                onPress={() => {
                  if (isSelected && isPlaying) {
                    pause();
                  } else {
                    play(track, filteredTracks.length > 0 ? filteredTracks : tracks);
                  }
                }}
                activeOpacity={0.8}
              >
                {/* Index / Status */}
                <View style={styles.trackIndexCol}>
                  {isThisPlaying ? (
                    <Ionicons name="stats-chart" size={14} color={colors.primaryLight} />
                  ) : (
                    <Text style={styles.trackIndexText}>
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </Text>
                  )}
                </View>

                {/* Album Art */}
                <View style={styles.trackRowArtWrapper}>
                  <Image source={{ uri: track.coverUrl }} style={styles.trackRowArt} />
                </View>

                {/* Title & Artist */}
                <View style={styles.trackRowMeta}>
                  <Text
                    style={[styles.trackRowTitle, isSelected && styles.trackRowTitleActive]}
                    numberOfLines={1}
                  >
                    {track.title}
                  </Text>
                  <Text style={styles.trackRowArtist} numberOfLines={1}>
                    {track.artist}
                  </Text>
                </View>

                {/* Duration */}
                <Text style={[styles.trackRowDuration, isSelected && styles.trackRowDurationActive]}>
                  {formatDuration(track.duration || 180)}
                </Text>

                {/* Options / Action Button */}
                <TouchableOpacity style={styles.trackRowAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="ellipsis-vertical" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    height: 56,
    marginTop: Platform.OS === 'ios' ? 44 : 10,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  headerBrandText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 140,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sessionMetaLabel: {
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  greetingTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  museChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.xs,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
  },
  musePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryLight,
  },
  museChipText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  filterRow: {
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.lg,
  },
  filterPillsScroll: {
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.xs,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  featureCard: {
    backgroundColor: '#111111',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#262626',
    padding: 14,
    marginBottom: spacing.xl,
  },
  featureCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  featureTag: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  featureBpm: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  featureBody: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  featureArtContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.xs,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#262626',
  },
  featureArt: {
    width: '100%',
    height: '100%',
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  featureArtist: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  featureSub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  featureFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#262626',
  },
  promptMuseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  promptMuseText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  playMixBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.xs,
  },
  playMixBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  sectionLink: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '600',
  },
  sectionBadge: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  carouselContainer: {
    gap: 12,
    paddingBottom: spacing.lg,
  },
  carouselCard: {
    width: 120,
  },
  carouselArtWrapper: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.xs,
    overflow: 'hidden',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: 6,
    position: 'relative',
  },
  carouselArt: {
    width: '100%',
    height: '100%',
  },
  playingBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  carouselArtist: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  trackList: {
    gap: 6,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: borderRadius.xs,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#262626',
    gap: 10,
  },
  trackRowActive: {
    backgroundColor: '#181818',
    borderColor: '#383838',
  },
  trackIndexCol: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackIndexText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  trackRowArtWrapper: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xs,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#262626',
  },
  trackRowArt: {
    width: '100%',
    height: '100%',
  },
  trackRowMeta: {
    flex: 1,
  },
  trackRowTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  trackRowTitleActive: {
    color: colors.primaryLight,
  },
  trackRowArtist: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  trackRowDuration: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  trackRowDurationActive: {
    color: colors.primary,
  },
  trackRowAction: {
    padding: 2,
  },
});
