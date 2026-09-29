import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../store/playerStore';
import { colors, borderRadius } from '../constants/theme';

interface MiniPlayerProps {
  onPress: () => void;
  bottomOffset?: number;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onPress, bottomOffset }) => {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const playNext = usePlayerStore((s) => s.playNext);
  const progress = usePlayerStore((s) => s.progress);

  const [isLiked, setIsLiked] = useState(false);

  if (!currentTrack) {
    return null;
  }

  return (
    <View style={[styles.wrapper, bottomOffset !== undefined && { bottom: bottomOffset }]}>
      {/* 2px Micro Progress Bar at the Top */}
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${Math.min(100, Math.max(0, progress * 100))}%` },
          ]}
        />
      </View>

      <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={onPress}>
        {/* Square Album Artwork */}
        <View style={styles.coverRing}>
          <Image source={{ uri: currentTrack.coverUrl }} style={styles.cover} />
        </View>

        {/* Track Title & Artist */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>

        {/* Action Controls */}
        <View style={styles.controlsRow}>
          {/* Heart Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={18}
              color={isLiked ? colors.primaryLight : colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Solid Electric Blue Play/Pause Square Button */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={16}
              color="#FFFFFF"
              style={{ marginLeft: isPlaying ? 0 : 2 }}
            />
          </TouchableOpacity>

          {/* Skip Next Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={(e) => {
              e.stopPropagation();
              playNext();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="play-skip-forward" size={17} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 74,
    left: 12,
    right: 12,
    backgroundColor: '#111111',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#262626',
    zIndex: 40,
  },
  progressBarBackground: {
    height: 2,
    backgroundColor: '#262626',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 10,
  },
  coverRing: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#262626',
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  artist: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
