import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { usePlayerStore } from '../store/playerStore';
import { colors, spacing, borderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

interface PlayerScreenProps {
  navigation: any;
}

export const PlayerScreen: React.FC<PlayerScreenProps> = ({ navigation }) => {
  const {
    currentTrack,
    queue,
    currentIndex,
    isPlaying,
    progress,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    togglePlayPause,
    seek,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
  } = usePlayerStore();

  const [isLiked, setIsLiked] = useState(false);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const remainingTime = Math.max(0, duration - currentTime);

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
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          style={styles.iconButton}
        >
          <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.nowPlayingLabel}>
            {queue.length > 0
              ? `FLOW QUEUE ${currentIndex >= 0 ? currentIndex + 1 : 1} OF ${queue.length}`
              : 'NOW PLAYING'}
          </Text>
          <Text style={styles.genreLabel}>
            {currentTrack.genreId ? currentTrack.genreId.toUpperCase() : 'AI MASTER'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
            navigation.navigate('ChatTab');
          }}
          style={styles.iconButton}
        >
          <Ionicons name="sparkles" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Cover Art Container */}
      <View style={styles.coverSection}>
        <View style={styles.coverWrapper}>
          <Image source={{ uri: currentTrack.coverUrl }} style={styles.coverImage} />

          {/* Floating Spec Badge */}
          <View style={styles.specBadge}>
            <Ionicons name="flash" size={10} color={colors.primary} />
            <Text style={styles.specBadgeText}>320KBPS • MASTER</Text>
          </View>
        </View>

        {/* Audio Visualizer Micro-Bars */}
        <View style={styles.visualizerRow}>
          {[4, 12, 18, 14, 22, 16, 8, 20, 24, 12, 18, 10, 16, 22, 10, 5].map(
            (barHeight, idx) => (
              <View
                key={idx}
                style={[
                  styles.visualizerBar,
                  {
                    height: isPlaying ? barHeight : 3,
                    backgroundColor: idx % 2 === 0 ? colors.primary : '#3b82f6',
                  },
                ]}
              />
            )
          )}
        </View>
      </View>

      {/* Track Metadata & Favorite */}
      <View style={styles.trackInfoRow}>
        <View style={styles.trackTitleCol}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {currentTrack.artist} • Glacial Session
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsLiked(!isLiked)}
          style={[styles.likeButton, isLiked && styles.likeButtonActive]}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={isLiked ? colors.primary : '#888888'}
          />
        </TouchableOpacity>
      </View>

      {/* Interactive Scrubber */}
      <View style={styles.scrubberContainer}>
        <TouchableOpacity
          style={styles.scrubberTouch}
          activeOpacity={1}
          onPress={handleSeekPress}
        >
          <View style={styles.scrubberTrackBg}>
            <View
              style={[
                styles.scrubberFill,
                { width: `${Math.min(100, Math.max(0, progress * 100))}%` },
              ]}
            />
          </View>

          {/* Scrubber Knob */}
          <View
            style={[
              styles.scrubberKnob,
              { left: `${Math.min(98, Math.max(0, progress * 100))}%` },
            ]}
          />
        </TouchableOpacity>

        {/* Timecodes */}
        <View style={styles.timecodeRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <View style={styles.audioFormatBadge}>
            <MaterialCommunityIcons name="waveform" size={11} color={colors.primary} />
            <Text style={styles.formatText}>Spatial Audio</Text>
          </View>
          <Text style={styles.timeText}>-{formatTime(remainingTime)}</Text>
        </View>
      </View>

      {/* Main Transport Controls */}
      <View style={styles.transportRow}>
        {/* Shuffle */}
        <TouchableOpacity
          style={styles.transportBtn}
          onPress={toggleShuffle}
          activeOpacity={0.7}
        >
          <Ionicons
            name="shuffle"
            size={20}
            color={isShuffle ? colors.primary : '#888888'}
          />
        </TouchableOpacity>

        {/* Previous */}
        <TouchableOpacity
          style={styles.secondaryTransportBtn}
          onPress={playPrevious}
          activeOpacity={0.7}
        >
          <Ionicons name="play-skip-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Master Play/Pause Button */}
        <TouchableOpacity
          style={styles.masterPlayBtn}
          onPress={togglePlayPause}
          activeOpacity={0.9}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={28}
            color="#FFFFFF"
            style={{ marginLeft: isPlaying ? 0 : 2 }}
          />
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity
          style={styles.secondaryTransportBtn}
          onPress={playNext}
          activeOpacity={0.7}
        >
          <Ionicons name="play-skip-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Repeat */}
        <TouchableOpacity style={styles.transportBtn} onPress={toggleRepeat} activeOpacity={0.7}>
          <Ionicons
            name={repeatMode === 'one' ? 'repeat-outline' : 'repeat'}
            size={20}
            color={repeatMode !== 'off' ? colors.primary : '#888888'}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Utility Deck */}
      <View style={styles.bottomDeck}>
        {/* Connected Device Card */}
        <View style={styles.deviceBanner}>
          <View style={styles.deviceLeft}>
            <View style={styles.deviceIconCircle}>
              <Ionicons name="headset-outline" size={15} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.deviceStatus}>CONNECTED DEVICE</Text>
              <Text style={styles.deviceName}>Anaska Spatial Buds Pro</Text>
            </View>
          </View>
          <View style={styles.activePill}>
            <Text style={styles.activePillText}>ACTIVE</Text>
          </View>
        </View>

        {/* Quick Action: Ask DJ Muse */}
        <TouchableOpacity
          style={styles.askMuseBtn}
          onPress={() => {
            navigation.goBack();
            navigation.navigate('ChatTab');
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="sparkles" size={16} color={colors.primary} />
          <Text style={styles.askMuseBtnText}>Ask DJ Muse to Adapt Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTrackText: {
    color: '#888888',
    fontSize: 15,
    marginBottom: spacing.md,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.primary,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
  },
  topBarCenter: {
    alignItems: 'center',
  },
  nowPlayingLabel: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  genreLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  coverSection: {
    alignItems: 'center',
    marginVertical: 6,
  },
  coverWrapper: {
    width: width - spacing.lg * 2.8,
    height: width - spacing.lg * 2.8,
    maxWidth: 300,
    maxHeight: 300,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#262626',
    overflow: 'hidden',
    backgroundColor: '#111111',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  specBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#262626',
  },
  specBadgeText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  visualizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 24,
    marginTop: 16,
  },
  visualizerBar: {
    width: 3,
    borderRadius: 1.5,
  },
  trackInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  trackTitleCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  trackArtist: {
    color: '#888888',
    fontSize: 13,
    marginTop: 3,
  },
  likeButton: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.sm,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeButtonActive: {
    borderColor: colors.primary,
  },
  scrubberContainer: {
    marginVertical: 4,
  },
  scrubberTouch: {
    height: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  scrubberTrackBg: {
    height: 3,
    backgroundColor: '#181818',
    borderRadius: 1.5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#262626',
  },
  scrubberFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
  scrubberKnob: {
    position: 'absolute',
    top: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.primary,
    marginLeft: -6,
  },
  timecodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '600',
  },
  audioFormatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  formatText: {
    color: '#888888',
    fontSize: 10,
    fontWeight: '600',
  },
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginVertical: 8,
  },
  transportBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryTransportBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterPlayBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomDeck: {
    gap: 8,
  },
  deviceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: borderRadius.sm,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#262626',
  },
  deviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deviceIconCircle: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.xs,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceStatus: {
    color: '#888888',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  deviceName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  activePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderWidth: 1,
    borderColor: '#262626',
  },
  activePillText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '700',
  },
  askMuseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: borderRadius.sm,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#262626',
  },
  askMuseBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});
