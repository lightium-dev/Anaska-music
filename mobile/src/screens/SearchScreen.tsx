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
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';
import { musicService } from '../services/musicService';
import { usePlayerStore } from '../store/playerStore';
import { Genre, Track } from '../types';

export const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedGenreId, setSelectedGenreId] = useState<string | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  const { play, currentTrack, isPlaying } = usePlayerStore();

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

  const renderTrackItem = ({ item }: { item: Track }) => {
    const isCurrent = currentTrack?.id === item.id;
    return (
      <TouchableOpacity
        style={styles.trackRow}
        activeOpacity={0.8}
        onPress={() => play(item)}
      >
        <Image source={{ uri: item.coverUrl }} style={styles.trackThumb} />
        <View style={styles.trackDetails}>
          <Text style={[styles.trackTitle, isCurrent && styles.activeTitle]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {item.artist} • {item.genreId}
          </Text>
        </View>
        <Ionicons
          name={isCurrent && isPlaying ? 'pause-circle' : 'play-circle'}
          size={32}
          color={isCurrent ? colors.primary : colors.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Search</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Artists, tracks, or vibes..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Genre filter chips */}
        <View style={styles.chipsRow}>
          <TouchableOpacity
            style={[styles.filterChip, selectedGenreId === null && styles.filterChipActive]}
            onPress={() => setSelectedGenreId(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedGenreId === null && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {genres.map((g) => {
            const isActive = selectedGenreId === g.id;
            return (
              <TouchableOpacity
                key={g.id}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedGenreId(isActive ? null : g.id)}
              >
                <Text
                  style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                >
                  {g.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : tracks.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="musical-notes-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>No tracks found matching your query</Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={renderTrackItem}
          contentContainerStyle={styles.list}
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
  header: {
    paddingTop: 50,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  filterChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryAccent,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#000000',
    fontWeight: 'bold',
  },
  list: {
    padding: spacing.md,
    paddingBottom: 110,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trackThumb: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: colors.surfaceElevated,
  },
  trackDetails: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  trackTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  activeTitle: {
    color: colors.primaryAccent,
  },
  trackArtist: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.textMuted,
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
});
