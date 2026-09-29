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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
              <View style={[styles.bar, { height: 6 }]} />
              <View style={[styles.bar, { height: 12 }]} />
              <View style={[styles.bar, { height: 8 }]} />
            </View>
          ) : (
            <Text style={styles.trackIndexText}>{index + 1 < 10 ? `0${index + 1}` : index + 1}</Text>
          )}
        </View>

        <View style={styles.thumbWrapper}>
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

        <View style={styles.playActionBtn}>
          <Ionicons
            name={isThisPlaying ? 'pause' : 'play'}
            size={16}
            color={isCurrent ? colors.primary : colors.textMuted}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.metaLabel}>DISCOVERY ENGINE</Text>
            <Text style={styles.pageTitle}>Search Frequencies</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.primary} style={styles.searchIcon} />
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
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Genre Filter Pills */}
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
                <Text style={[styles.genreText, isSelected && styles.genreTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Results List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
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
              <Ionicons name="musical-notes-outline" size={40} color={colors.textMuted} />
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
    backgroundColor: '#000000',
  },
  searchHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 52 : 24,
    paddingBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.xs,
  },
  metaLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginTop: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#262626',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    padding: 0,
  },
  genreFilterContainer: {
    paddingVertical: 6,
  },
  genreList: {
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  genrePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.xs,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
  },
  genrePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genreText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '500',
  },
  genreTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  trackList: {
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    paddingBottom: 180,
    gap: 8,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: borderRadius.sm,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#262626',
  },
  trackRowActive: {
    borderColor: colors.primary,
    backgroundColor: '#181818',
  },
  trackIndexCol: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackIndexText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '600',
  },
  equalizerBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 12,
  },
  bar: {
    width: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  thumbWrapper: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xs,
    overflow: 'hidden',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
  },
  trackThumb: {
    width: '100%',
    height: '100%',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  trackTitleActive: {
    color: colors.primary,
  },
  trackArtist: {
    color: '#888888',
    fontSize: 11,
    marginTop: 2,
  },
  trackDuration: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '500',
  },
  trackDurationActive: {
    color: colors.primary,
    fontWeight: '600',
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
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
  },
  emptySubtitle: {
    color: '#888888',
    fontSize: 12,
    marginTop: 3,
  },
});
