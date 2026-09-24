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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';
import { musicService } from '../services/musicService';
import { usePlayerStore } from '../store/playerStore';
import { useUserStore } from '../store/userStore';
import { Genre, Track } from '../types';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useUserStore();
  const { play, currentTrack, isPlaying } = usePlayerStore();

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

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Filter or group tracks
  const userPreferredGenres = user?.genrePreferences || [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good vibes,</Text>
            <Text style={styles.username}>{user?.username || 'Music Explorer'}</Text>
          </View>
          <TouchableOpacity
            style={styles.museButton}
            onPress={() => navigation.navigate('ChatTab')}
          >
            <Ionicons name="sparkles" size={16} color="#000000" />
            <Text style={styles.museButtonText}>DJ Muse</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Banner */}
        <TouchableOpacity
          style={styles.banner}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ChatTab')}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerBadge}>AI CURATOR</Text>
            <Text style={styles.bannerTitle}>Talk with DJ Muse</Text>
            <Text style={styles.bannerSubtitle}>
              Ask for music trivia, mood-based playlists, or explore synthetic sounds.
            </Text>
          </View>
          <Ionicons name="chatbubbles" size={44} color={colors.primary} />
        </TouchableOpacity>

        {/* Dynamic Groups by Genre */}
        {genres.map((g) => {
          const genreTracks = tracks.filter((t) => t.genreId === g.id);
          if (genreTracks.length === 0) return null;

          return (
            <View key={g.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{g.name}</Text>
                {userPreferredGenres.includes(g.id) && (
                  <Text style={styles.forYouBadge}>FOR YOU</Text>
                )}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {genreTracks.map((t) => {
                  const isCurrent = currentTrack?.id === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={styles.trackCard}
                      activeOpacity={0.8}
                      onPress={() => play(t)}
                    >
                      <View style={styles.coverWrapper}>
                        <Image source={{ uri: t.coverUrl }} style={styles.trackCover} />
                        <View style={[styles.playOverlay, isCurrent && isPlaying && styles.playingOverlay]}>
                          <Ionicons
                            name={isCurrent && isPlaying ? 'pause' : 'play'}
                            size={20}
                            color="#000000"
                          />
                        </View>
                      </View>
                      <Text style={[styles.trackTitle, isCurrent && styles.activeText]} numberOfLines={1}>
                        {t.title}
                      </Text>
                      <Text style={styles.trackArtist} numberOfLines={1}>
                        {t.artist}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          );
        })}
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
  scroll: {
    padding: spacing.md,
    paddingTop: 50,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  username: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  museButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  museButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 13,
  },
  banner: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  bannerBadge: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  bannerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 8,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  forYouBadge: {
    backgroundColor: colors.surface,
    color: colors.primaryAccent,
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  horizontalScroll: {
    flexDirection: 'row',
  },
  trackCard: {
    width: 140,
    marginRight: 14,
  },
  coverWrapper: {
    position: 'relative',
    width: 140,
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  trackCover: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
  },
  playOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: colors.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  playingOverlay: {
    backgroundColor: colors.primaryAccent,
  },
  trackTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  activeText: {
    color: colors.primaryAccent,
  },
  trackArtist: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
