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
import { LinearGradient } from 'expo-linear-gradient';
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
    isLoading,
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
      {/* Background Aura */}
      <View style={styles.topAura} />
      <View style={styles.bottomAura} />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          style={styles.iconButton}
        >
          <Ionicons name="chevron-down" size={26} color={colors.textFrost} />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.nowPlayingLabel}>
            {queue.length > 0
              ? `FLOW QUEUE ${currentIndex >= 0 ? currentIndex + 1 : 1} OF ${queue.length}`
              : 'NOW PLAYING FROM AI FLOW'}
          </Text>
          <Text style={styles.genreLabel}>
            {currentTrack.genreId ? currentTrack.genreId.toUpperCase() : 'SUBLIMINAL'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
            navigation.navigate('ChatTab');
          }}
          style={styles.iconButton}
        >
          <Ionicons name="sparkles" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Holographic Cover Art Container */}
      <View style={styles.coverSection}>
        <View style={styles.coverRingWrapper}>
          <Image source={{ uri: currentTrack.coverUrl }} style={styles.coverImage} />

          {/* Floating Hi-Fi Spec Badge */}
          <View style={styles.specBadge}>
            <Ionicons name="snow" size={12} color={colors.primary} />
            <Text style={styles.specBadgeText}>24-BIT / 96KHZ LOSSLESS</Text>
          </View>
        </View>

        {/* Live Audio Visualizer Micro-Bars */}
        <View style={styles.visualizerRow}>
          {[4, 12, 20, 16, 26, 18, 8, 22, 28, 14, 24, 10, 18, 26, 12, 6].map(
            (barHeight, idx) => (
              <View
                key={idx}
                style={[
                  styles.visualizerBar,
                  {
                    height: isPlaying ? barHeight : 4,
                    backgroundColor: idx % 2 === 0 ? colors.primary : colors.secondary,
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
            size={24}
            color={isLiked ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Interactive Scrubber Component */}
      <View style={styles.scrubberContainer}>
        <TouchableOpacity
          style={styles.scrubberTouch}
          activeOpacity={1}
          onPress={handleSeekPress}
        >
          <View style={styles.scrubberTrackBg}>
            <LinearGradient
              colors={['#0284C7', '#38BDF8', '#00F2FE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.scrubberFill,
                { width: `${Math.min(100, Math.max(0, progress * 100))}%` },
              ]}
            />
          </View>

          {/* Ice Crystal Glowing Knob */}
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
            <MaterialCommunityIcons name="waveform" size={12} color={colors.primary} />
            <Text style={styles.formatText}>Spatial Audio</Text>
          </View>
          <Text style={styles.timeText}>-{formatTime(remainingTime)}</Text>
        </View>
      </View>

      {/* Main Playback Transport Controls */}
      <View style={styles.transportRow}>
        {/* Shuffle */}
        <TouchableOpacity
          style={styles.transportBtn}
          onPress={toggleShuffle}
          activeOpacity={0.7}
        >
          <Ionicons
            name="shuffle"
            size={22}
            color={isShuffle ? colors.primary : colors.textSecondary}
          />
          {isShuffle && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* Previous */}
        <TouchableOpacity
          style={styles.secondaryTransportBtn}
          onPress={playPrevious}
          activeOpacity={0.7}
        >
          <Ionicons name="play-skip-back" size={24} color={colors.textFrost} />
        </TouchableOpacity>

        {/* Master Central Circular Play/Pause Orb */}
        <TouchableOpacity
          style={styles.masterOrbOuter}
          onPress={togglePlayPause}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#0284C7', '#00F2FE', '#F0F9FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.masterOrbGradient}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={36}
              color="#070B14"
              style={{ marginLeft: isPlaying ? 0 : 3 }}
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity
          style={styles.secondaryTransportBtn}
          onPress={playNext}
          activeOpacity={0.7}
        >
          <Ionicons name="play-skip-forward" size={24} color={colors.textFrost} />
        </TouchableOpacity>

        {/* Repeat */}
        <TouchableOpacity style={styles.transportBtn} onPress={toggleRepeat} activeOpacity={0.7}>
          <Ionicons
            name={repeatMode === 'one' ? 'repeat-outline' : 'repeat'}
            size={22}
            color={repeatMode !== 'off' ? colors.primary : colors.textSecondary}
          />
          {repeatMode !== 'off' && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </View>

      {/* Bottom Utility Deck */}
      <View style={styles.bottomDeck}>
        {/* Device Banner */}
        <View style={styles.deviceBanner}>
          <View style={styles.deviceLeft}>
            <View style={styles.deviceIconCircle}>
              <Ionicons name="headset-outline" size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.deviceStatus}>CONNECTED DEVICE</Text>
              <Text style={styles.deviceName}>Anaska Spatial Buds Pro</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.deviceSwitchBtn} activeOpacity={0.7}>
            <Text style={styles.deviceSwitchText}>Switch</Text>
            <Ionicons name="chevron-down" size={12} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions: Lyrics Live & Ask DJ Muse */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.75}>
            <Ionicons name="musical-notes-outline" size={18} color={colors.primary} />
            <Text style={styles.quickActionText}>Lyrics Live</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, styles.quickActionMuse]}
            onPress={() => {
              navigation.goBack();
              navigation.navigate('ChatTab');
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={18} color={colors.primary} />
            <Text style={styles.quickActionMuseText}>Ask DJ Muse</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topAura: {
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
  },
  bottomAura: {
    position: 'absolute',
    bottom: -60,
    alignSelf: 'center',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
  },
  noTrackText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
  },
  backButtonText: {
    color: '#002022',
    fontWeight: '700',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14, 24, 42, 0.6)',
  },
  topBarCenter: {
    alignItems: 'center',
  },
  nowPlayingLabel: {
    color: colors.secondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  genreLabel: {
    color: colors.textFrost,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  coverSection: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  coverRingWrapper: {
    width: width - spacing.lg * 2.8,
    height: width - spacing.lg * 2.8,
    maxWidth: 320,
    maxHeight: 320,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 242, 254, 0.35)',
    overflow: 'hidden',
    backgroundColor: '#0E1829',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  specBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(7, 11, 20, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.4)',
  },
  specBadgeText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  visualizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 30,
    marginTop: spacing.md,
  },
  visualizerBar: {
    width: 3,
    borderRadius: 1.5,
  },
  trackInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: spacing.xs,
  },
  trackTitleCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  trackTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  trackArtist: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  likeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(14, 24, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeButtonActive: {
    borderColor: 'rgba(0, 242, 254, 0.5)',
  },
  scrubberContainer: {
    marginVertical: spacing.sm,
  },
  scrubberTouch: {
    height: 24,
    justifyContent: 'center',
    position: 'relative',
  },
  scrubberTrackBg: {
    height: 4,
    backgroundColor: '#0F172A',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    overflow: 'hidden',
  },
  scrubberFill: {
    height: '100%',
    borderRadius: 2,
  },
  scrubberKnob: {
    position: 'absolute',
    top: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F0F9FF',
    borderWidth: 2,
    borderColor: colors.primary,
    marginLeft: -7,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 8,
  },
  timecodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  audioFormatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  formatText: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginVertical: spacing.xs,
  },
  transportBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  secondaryTransportBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterOrbOuter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(186, 230, 253, 0.5)',
  },
  masterOrbGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomDeck: {
    gap: 10,
  },
  deviceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(11, 19, 43, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  deviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deviceIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceStatus: {
    color: colors.secondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  deviceName: {
    color: colors.textFrost,
    fontSize: 12,
    fontWeight: '600',
  },
  deviceSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  deviceSwitchText: {
    color: '#BAE6FD',
    fontSize: 11,
    fontWeight: '600',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(11, 19, 43, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  quickActionText: {
    color: colors.textFrost,
    fontSize: 13,
    fontWeight: '600',
  },
  quickActionMuse: {
    borderColor: 'rgba(0, 242, 254, 0.4)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  quickActionMuseText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
