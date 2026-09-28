import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { musicService } from '../services/musicService';
import { usePlayerStore } from '../store/playerStore';
import { Genre, Track } from '../types';

export const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  useEffect(() => {
    async function init() {
      try {
        const [gList, tList] = await Promise.all([
          musicService.getGenres(),
          musicService.getTracks(),
        ]);
        setGenres(gList);
        setTracks(tList);
      } catch (e) {
        console.warn('Failed to load initial search data:', e);
      }
    }
    init();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const results = await musicService.getTracks({
          search: query.trim() || undefined,
          genreId: selectedGenreId || undefined,
        });
        setTracks(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, selectedGenreId]);

  const renderTrackItem = ({ item, index }: { item: Track; index: number }) => {
    const isCurrent = currentTrack?.id === item.id;
    const isThisPlaying = isCurrent && isPlaying;

    const formatDuration = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
      <TouchableOpacity
        style={[styles.trackRow, isCurrent && styles.trackRowActive]}
        activeOpacity={0.8}
        onPress={() => {
          if (isCurrent && isPlaying) {
            pause();
          } else {
            play(item, tracks);
          }
        }}
      >
        <View style={styles.trackIndexCol}>
          {isThisPlaying ? (
            <View style={styles.equalizerBars}>
              <View style={[styles.bar, { height: 8 }]} />
              <View style={[styles.bar, { height: 14 }]} />
              <View style={[styles.bar, { height: 10 }]} />
            </View>
          ) : (
            <Text style={styles.trackIndexText}>{index + 1 < 10 ? `0${index + 1}` : index + 1}</Text>
          )}
        </View>

        <View style={[styles.thumbRing, isCurrent && styles.thumbRingActive]}>
          <Image source={{ uri: item.coverUrl }} style={styles.trackThumb} />
        </View>

        <View style={styles.trackInfo}>
          <Text style={[styles.trackTitle, isCurrent && styles.trackTitleActive]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>

        <Text style={[styles.trackDuration, isCurrent && styles.trackDurationActive]}>
          {formatDuration(item.duration)}
        </Text>

        <TouchableOpacity style={styles.playActionBtn}>
          <Ionicons
            name={isThisPlaying ? 'pause' : 'play'}
            size={16}
            color={isCurrent ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topAura} />

      {/* Header & Search Input */}
      <View style={styles.searchHeader}>
        <Text style={styles.metaLabel}>DISCOVERY ENGINE</Text>
        <Text style={styles.pageTitle}>Search Frequencies</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tracks, artists, soundscapes..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Genre Pills Filter */}
      <View style={styles.genreFilterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'all', name: 'All Frequencies' }, ...genres]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.genreList}
          renderItem={({ item }) => {
            const isAll = item.id === 'all';
            const isSelected = isAll ? selectedGenreId === null : selectedGenreId === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelectedGenreId(isAll ? null : item.id)}
                activeOpacity={0.8}
                style={[styles.genrePill, isSelected && styles.genrePillActive]}
              >
                {isSelected ? (
                  <LinearGradient
                    colors={['#00F2FE', '#38BDF8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.genrePillGradient}
                  >
                    <Text style={styles.genreTextActive}>{item.name}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.genrePillContent}>
                    <Text style={styles.genreTextInactive}>{item.name}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Results List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={renderTrackItem}
          contentContainerStyle={styles.trackList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="musical-notes-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No matching frequencies</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search or genre filter</Text>
            </View>
          }
        />
      )}
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
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
  },
  searchHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.sm,
  },
  metaLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 23, 42, 0.95)',
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.textFrost,
    fontSize: 14,
    paddingVertical: 10,
  },
  genreFilterContainer: {
    paddingVertical: spacing.xs,
  },
  genreList: {
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  genrePill: {
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
    backgroundColor: '#0E1829',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.18)',
  },
  genrePillActive: {
    borderColor: 'rgba(224, 242, 254, 0.4)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  genrePillGradient: {
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  genrePillContent: {
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  genreTextActive: {
    color: '#002022',
    fontSize: 12,
    fontWeight: '700',
  },
  genreTextInactive: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  trackList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 220,
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
  trackRowActive: {
    backgroundColor: '#142135',
    borderColor: 'rgba(0, 242, 254, 0.35)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  trackIndexCol: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackIndexText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  equalizerBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 14,
  },
  bar: {
    width: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  thumbRing: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: '#142135',
  },
  thumbRingActive: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  trackThumb: {
    width: '100%',
    height: '100%',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  trackTitleActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  trackArtist: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  trackDuration: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  trackDurationActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  playActionBtn: {
    padding: 4,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
});
