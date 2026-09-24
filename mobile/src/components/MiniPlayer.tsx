import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../store/playerStore';
import { colors, spacing } from '../constants/theme';

interface MiniPlayerProps {
  onPress: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onPress }) => {
  const { currentTrack, isPlaying, togglePlayPause, progress } = usePlayerStore();

  if (!currentTrack) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      {/* Tiny progress bar at the very top of mini player */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${Math.min(100, progress * 100)}%` }]} />
      </View>

      <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={onPress}>
        <Image source={{ uri: currentTrack.coverUrl }} style={styles.cover} />

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.playButton}
          onPress={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 56, // Sits above bottom tabs
    left: 8,
    right: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  progressBarBackground: {
    height: 2,
    backgroundColor: '#333333',
    width: '100%',
  },
  progressBarFill: {
    height: 2,
    backgroundColor: colors.primary,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  playButton: {
    padding: 6,
  },
});
