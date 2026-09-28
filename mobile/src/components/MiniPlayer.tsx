import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../store/playerStore';
import { colors, spacing, borderRadius } from '../constants/theme';

interface MiniPlayerProps {
  onPress: () => void;
  bottomOffset?: number;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onPress, bottomOffset }) => {
  const { currentTrack, isPlaying, togglePlayPause, progress } = usePlayerStore();
  const [isLiked, setIsLiked] = useState(false);

  if (!currentTrack) {
    return null;
  }

  return (
    <View style={[styles.wrapper, bottomOffset !== undefined && { bottom: bottomOffset }]}>
      {/* Glacial Scrubber Line at the very top */}
      <View style={styles.progressBarBackground}>
        <LinearGradient
          colors={['#00F2FE', '#38BDF8', '#E0F2FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, progress * 100))}%` }]}
        />
      </View>

      <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={onPress}>
        {/* Track Thumbnail with Cyan Border */}
        <View style={styles.coverRing}>
          <Image source={{ uri: currentTrack.coverUrl }} style={styles.cover} />
        </View>

        {/* Track Meta & AI Mix Badge */}
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI MIX</Text>
            </View>
          </View>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist} • Muse Cryo
          </Text>
        </View>

        {/* Action Controls */}
        <View style={styles.controlsRow}>
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
              size={20}
              color={isLiked ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Glowing Glacial Play/Pause Orb */}
          <TouchableOpacity
            style={styles.playOrb}
            onPress={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#00F2FE', '#38BDF8']}
              style={styles.playOrbGradient}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={18}
                color="#002022"
                style={{ marginLeft: isPlaying ? 0 : 2 }}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 112, // Lifted comfortably above the custom bottom tab bar and DJ Muse halo
    left: 10,
    right: 10,
    backgroundColor: 'rgba(11, 19, 43, 0.95)',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: '#1A283F',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 10,
  },
  coverRing: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.45)',
    overflow: 'hidden',
    backgroundColor: '#0E1829',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  aiBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.4)',
  },
  aiBadgeText: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  artist: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
  playOrb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 4,
  },
  playOrbGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
