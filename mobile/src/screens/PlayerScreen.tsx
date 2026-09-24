import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../store/playerStore';
import { colors, spacing } from '../constants/theme';

const { width } = Dimensions.get('window');

interface PlayerScreenProps {
  navigation: any;
}

export const PlayerScreen: React.FC<PlayerScreenProps> = ({ navigation }) => {
  const {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    togglePlayPause,
    seek,
  } = usePlayerStore();

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleSeekPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const barWidth = width - spacing.lg * 2;
    const ratio = Math.max(0, Math.min(1, locationX / barWidth));
    seek(ratio);
  };

  if (!currentTrack) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.noTrackText}>No track currently playing</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Ionicons name="chevron-down" size={30} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.nowPlayingLabel}>NOW PLAYING</Text>
          <Text style={styles.genreLabel}>{currentTrack.genreId.toUpperCase()}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ChatTab')}>
          <Ionicons name="sparkles" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Main Cover Art */}
      <View style={styles.coverContainer}>
        <Image source={{ uri: currentTrack.coverUrl }} style={styles.largeCover} />
      </View>

      {/* Track Metadata */}
      <View style={styles.trackInfo}>
        <View style={styles.titles}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={26} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Scrubber / Progress Bar */}
      <View style={styles.scrubberContainer}>
        <TouchableOpacity
          style={styles.progressBarWrapper}
          activeOpacity={1}
          onPress={handleSeekPress}
        >
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${Math.min(100, progress * 100)}%` }]} />
            <View
              style={[
                styles.scrubberThumb,
                { left: `${Math.min(97, Math.max(0, progress * 100))}%` },
              ]}
            />
          </View>
        </TouchableOpacity>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="shuffle" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => seek(Math.max(0, progress - 0.1))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="play-skip-back" size={32} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mainPlayButton}
          onPress={togglePlayPause}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={36}
            color="#000000"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => seek(Math.min(1, progress + 0.1))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="play-skip-forward" size={32} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="repeat" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarCenter: {
    alignItems: 'center',
  },
  nowPlayingLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  genreLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  coverContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  largeCover: {
    width: width - spacing.lg * 2,
    height: width - spacing.lg * 2,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titles: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  artist: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 4,
  },
  scrubberContainer: {
    marginBottom: spacing.lg,
  },
  progressBarWrapper: {
    height: 30,
    justifyContent: 'center',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    position: 'relative',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  scrubberThumb: {
    position: 'absolute',
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.textPrimary,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  timeText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  mainPlayButton: {
    backgroundColor: colors.primary,
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  noTrackText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
});
