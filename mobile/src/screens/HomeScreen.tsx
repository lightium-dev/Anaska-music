import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { musicService } from '../services/musicService';
import { usePlayerStore } from '../store/playerStore';
import { useUserStore } from '../store/userStore';
import { Genre, Track } from '../types';

interface HomeScreenProps {
  navigation: any;
}

const FILTER_TAGS = [
  'All',
  'Sub-Zero Beats',
  'Arctic Chill',
  'Glacial Bass',
  'Frost Trance',
  'Synthwave',
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useUserStore();
  const { play, pause, currentTrack, isPlaying } = usePlayerStore();

  const [activeFilter, setActiveFilter] = useState('All');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
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
    if (activeFilter === 'Synthwave') return t.genreId === 'synthwave';
    if (activeFilter === 'Sub-Zero Beats' || activeFilter === 'Glacial Bass') {
      return t.genreId === 'electronic' || t.genreId === 'hiphop';
    }
    if (activeFilter === 'Arctic Chill' || activeFilter === 'Frost Trance') {
      return t.genreId === 'ambient' || t.genreId === 'lofi';
    }
    return true;
  });

  const heroTrack = tracks[0] || {
    id: 'hero-1',
    title: 'Neural Hyperdrive - Vol. 4',
    artist: 'Kavinsky • Muse AI • 132 BPM',
    genreId: 'synthwave',
    audioUrl: 'https://cdn.freesound.org/previews/612/612627_5674468-lq.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    duration: 215,
  };

  const isHeroPlaying = currentTrack?.id === heroTrack.id && isPlaying;

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerBrandRow}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerBrandText}>Anaska</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.museBadge}
            onPress={() => navigation.navigate('ChatTab')}
            activeOpacity={0.8}
          >
            <View style={styles.pulseSpark}>
              <View style={styles.pulseInner} />
            </View>
            <Text style={styles.museBadgeText}>MUSE ACTIVE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarButtonWrapper}
            onPress={() => navigation.navigate('ProfileTab')}
            activeOpacity={0.8}
            accessibilityLabel="Settings"
          >
            <View style={styles.avatarButton}>
              <Image
                source={
                  user?.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('file:') || user.avatar.startsWith('content:') || user.avatar.startsWith('data:'))
                    ? { uri: user.avatar }
                    : require('../../assets/avatar.png')
                }
                style={styles.avatarImg}
              />
            </View>
            <View style={styles.settingsBadge}>
              <Ionicons name="settings" size={9} color="#002022" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* User Session Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingMeta}>GLACIAL NIGHT SESSION</Text>
          <Text style={styles.greetingTitle}>
            Good evening, {user?.username || 'Alex'}
          </Text>
        </View>

        {/* Mood & Genre Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_TAGS.map((tag) => {
            const isActive = activeFilter === tag;
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => setActiveFilter(tag)}
                activeOpacity={0.8}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                {isActive ? (
                  <LinearGradient
                    colors={['#00F2FE', '#38BDF8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.filterChipGradient}
                  >
                    <Text style={styles.filterChipTextActive}>{tag}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.filterChipContent}>
                    <Text style={styles.filterChipTextInactive}>{tag}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* AI-Curated Hero Card: Neural Hyperdrive */}
        <View style={styles.heroCardOuter}>
          <ImageBackground
            source={{ uri: heroTrack.coverUrl }}
            style={styles.heroImageBg}
            imageStyle={{ borderRadius: borderRadius.lg }}
          >
            <LinearGradient
              colors={['rgba(7, 11, 20, 0.2)', 'rgba(7, 11, 20, 0.75)', '#070B14']}
              style={styles.heroScrim}
            >
              <View style={styles.heroBadge}>
                <Ionicons name="snow-outline" size={13} color={colors.primary} />
                <Text style={styles.heroBadgeText}>SYNTHESIZED FOR YOUR MOOD</Text>
              </View>

              <View style={styles.heroBottomRow}>
                <View style={styles.heroTextCol}>
                  <Text style={styles.heroSub}>AI Curated Focus</Text>
                  <Text style={styles.heroTitle} numberOfLines={1}>
                    {heroTrack.title}
                  </Text>
                  <Text style={styles.heroMeta} numberOfLines={1}>
                    {heroTrack.artist} • Cryo Mix
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.heroPlayOrb}
                  onPress={() => {
                    if (isHeroPlaying) {
                      pause();
                    } else {
                      play(heroTrack);
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#00F2FE', '#38BDF8', '#E0F2FE']}
                    style={styles.heroPlayGradient}
                  >
                    <Ionicons
                      name={isHeroPlaying ? 'pause' : 'play'}
                      size={28}
                      color="#002022"
                      style={{ marginLeft: isHeroPlaying ? 0 : 3 }}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* DJ Muse Interactive Hub Banner */}
        <TouchableOpacity
          style={styles.museHubCard}
          onPress={() => navigation.navigate('ChatTab')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#0E1829', '#142135']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.museHubGradient}
          >
            <View style={styles.museHubIconCircle}>
              <MaterialCommunityIcons name="waveform" size={22} color={colors.primary} />
            </View>

            <View style={styles.museHubTextCol}>
              <Text style={styles.museHubTitle}>DJ Muse Interactive Hub</Text>
              <Text style={styles.museHubSubtitle}>Say “Play sub-zero ambient frost”</Text>
            </View>

            <View style={styles.museHubPromptButton}>
              <Ionicons name="mic-outline" size={14} color={colors.textFrost} />
              <Text style={styles.museHubPromptText}>Prompt</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Recommended for You Horizontal Carousel */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <Text style={styles.sectionSubtitle}>Glacial flow curated from your timeline</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} style={styles.exploreLink}>
            <Text style={styles.exploreText}>Explore</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        >
          {tracks.slice(0, 5).map((track, idx) => {
            const isThisPlaying = currentTrack?.id === track.id && isPlaying;
            const tagLabels = ['AMBIENT', 'ARCTIC', 'CHILLWAVE', 'GLACIER', 'HYPERION'];
            return (
              <TouchableOpacity
                key={track.id}
                style={styles.carouselCard}
                onPress={() => play(track)}
                activeOpacity={0.85}
              >
                <View style={styles.carouselArtWrapper}>
                  <Image source={{ uri: track.coverUrl }} style={styles.carouselArt} />
                  <View style={styles.carouselTag}>
                    <Text style={styles.carouselTagText}>
                      {tagLabels[idx % tagLabels.length]}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.carouselPlayButton,
                      isThisPlaying && styles.carouselPlayButtonActive,
                    ]}
                  >
                    <Ionicons
                      name={isThisPlaying ? 'pause' : 'play'}
                      size={18}
                      color="#002022"
                      style={{ marginLeft: isThisPlaying ? 0 : 2 }}
                    />
                  </View>
                </View>

                <Text style={styles.carouselTrackTitle} numberOfLines={1}>
                  {track.title}
                </Text>
                <Text style={styles.carouselTrackArtist} numberOfLines={1}>
                  {track.artist}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Heavy Rotation & Flow: Vertical Playlist */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Heavy Rotation & Flow</Text>
            <Text style={styles.sectionSubtitle}>Tracks fueling your daily algorithms</Text>
          </View>
          <TouchableOpacity style={styles.tuneButton} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.trackListCol}>
          {filteredTracks.map((track, index) => {
            const isSelected = currentTrack?.id === track.id;
            const isThisPlaying = isSelected && isPlaying;

            const formatDuration = (sec: number) => {
              const m = Math.floor(sec / 60);
              const s = sec % 60;
              return `${m}:${s < 10 ? '0' : ''}${s}`;
            };

            return (
              <TouchableOpacity
                key={track.id}
                style={[styles.trackRow, isSelected && styles.trackRowSelected]}
                onPress={() => {
                  if (isSelected && isPlaying) {
                    pause();
                  } else {
                    play(track);
                  }
                }}
                activeOpacity={0.8}
              >
                {/* Index or Animated Equalizer */}
                <View style={styles.trackIndexCol}>
                  {isThisPlaying ? (
                    <View style={styles.equalizerBars}>
                      <View style={[styles.bar, { height: 10 }]} />
                      <View style={[styles.bar, { height: 16 }]} />
                      <View style={[styles.bar, { height: 12 }]} />
                    </View>
                  ) : (
                    <Text style={styles.trackIndexText}>
                      {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </Text>
                  )}
                </View>

                {/* Album Thumbnail */}
                <View style={[styles.trackThumbWrapper, isSelected && styles.trackThumbActive]}>
                  <Image source={{ uri: track.coverUrl }} style={styles.trackThumb} />
                </View>

                {/* Title & Artist */}
                <View style={styles.trackInfoCol}>
                  <Text
                    style={[styles.trackTitleText, isSelected && styles.trackTitleTextActive]}
                    numberOfLines={1}
                  >
                    {track.title}
                  </Text>
                  <Text style={styles.trackArtistText} numberOfLines={1}>
                    {track.artist}
                  </Text>
                </View>

                {/* Duration */}
                <Text
                  style={[styles.trackDurationText, isSelected && styles.trackDurationActive]}
                >
                  {formatDuration(track.duration)}
                </Text>

                <TouchableOpacity
                  style={styles.trackMenuButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="ellipsis-vertical" size={16} color={colors.textSecondary} />
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
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  headerBrandText: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  museBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(14, 24, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  pulseSpark: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
  },
  pulseInner: {
    width: '100%',
    height: '100%',
    borderRadius: 3.5,
    backgroundColor: colors.primary,
  },
  museBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  avatarButtonWrapper: {
    position: 'relative',
  },
  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 242, 254, 0.6)',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  settingsBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    width: 15,
    height: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#070B14',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 4,
  },
  scroll: {
    paddingBottom: 220,
  },
  greetingSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  greetingMeta: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  greetingTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: 8,
  },
  filterChip: {
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(28, 44, 62, 0.8)',
    backgroundColor: '#0E1829',
  },
  filterChipActive: {
    borderColor: 'rgba(224, 242, 254, 0.4)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  filterChipGradient: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
  },
  filterChipContent: {
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  filterChipTextActive: {
    color: '#002022',
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextInactive: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  heroCardOuter: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.25)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  heroImageBg: {
    width: '100%',
    height: 200,
  },
  heroScrim: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(7, 11, 20, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.35)',
  },
  heroBadgeText: {
    color: colors.textFrost,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heroTextCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  heroSub: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 2,
  },
  heroMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  heroPlayOrb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 8,
  },
  heroPlayGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  museHubCard: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.2)',
  },
  museHubGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  museHubIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  museHubTextCol: {
    flex: 1,
  },
  museHubTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  museHubSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  museHubPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    backgroundColor: '#1A2B45',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.35)',
  },
  museHubPromptText: {
    color: colors.textFrost,
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  exploreLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  exploreText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tuneButton: {
    padding: 4,
  },
  carouselContainer: {
    paddingHorizontal: spacing.lg,
    gap: 14,
  },
  carouselCard: {
    width: 140,
  },
  carouselArtWrapper: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#0E1829',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.2)',
    marginBottom: 6,
    position: 'relative',
  },
  carouselArt: {
    width: '100%',
    height: '100%',
  },
  carouselTag: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(7, 11, 20, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.35)',
  },
  carouselTagText: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  carouselPlayButton: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  carouselPlayButtonActive: {
    backgroundColor: colors.secondary,
  },
  carouselTrackTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  carouselTrackArtist: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  trackListCol: {
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: borderRadius.md,
    backgroundColor: '#0E1829',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  trackRowSelected: {
    backgroundColor: '#142135',
    borderColor: 'rgba(0, 242, 254, 0.35)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  trackIndexCol: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackIndexText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  equalizerBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 16,
  },
  bar: {
    width: 2.5,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  trackThumbWrapper: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: '#142135',
  },
  trackThumbActive: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  trackThumb: {
    width: '100%',
    height: '100%',
  },
  trackInfoCol: {
    flex: 1,
  },
  trackTitleText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  trackTitleTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  trackArtistText: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  trackDurationText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  trackDurationActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  trackMenuButton: {
    padding: 4,
  },
});
