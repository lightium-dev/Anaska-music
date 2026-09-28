import { create } from 'zustand';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer, AudioStatus } from 'expo-audio';
import { Track } from '../types';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number; // 0 to 1
  currentTime: number; // in seconds
  duration: number; // in seconds
  soundObject: AudioPlayer | null;
  isLoading: boolean;
  play: (track?: Track) => Promise<void>;
  pause: () => Promise<void>;
  seek: (progressPercent: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  currentTime: 0,
  duration: 0,
  soundObject: null,
  isLoading: false,

  play: async (track?: Track) => {
    const state = get();
    const targetTrack = track || state.currentTrack;

    if (!targetTrack) return;

    // If changing track
    if (track && (!state.currentTrack || state.currentTrack.id !== track.id)) {
      if (state.soundObject) {
        state.soundObject.remove();
      }

      set({ isLoading: true, currentTrack: track, progress: 0, currentTime: 0 });

      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'mixWithOthers',
        });

        const player = createAudioPlayer(targetTrack.audioUrl, { updateInterval: 250 });

        player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
          if (status.isLoaded) {
            const dur = status.duration > 0 ? status.duration : targetTrack.duration;
            const pos = status.currentTime;
            set({
              currentTime: pos,
              duration: dur,
              progress: dur > 0 ? pos / dur : 0,
              isPlaying: status.playing,
            });

            if (status.didJustFinish) {
              set({ isPlaying: false, progress: 1 });
            }
          }
        });

        player.play();

        set({
          soundObject: player,
          isPlaying: true,
          isLoading: false,
          duration: targetTrack.duration,
        });
      } catch (err) {
        console.error('Error loading audio:', err);
        set({ isLoading: false, isPlaying: false });
      }
    } else if (state.soundObject) {
      state.soundObject.play();
      set({ isPlaying: true });
    }
  },

  pause: async () => {
    const { soundObject } = get();
    if (soundObject) {
      soundObject.pause();
      set({ isPlaying: false });
    }
  },

  togglePlayPause: async () => {
    const { isPlaying, play, pause } = get();
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  },

  seek: async (progressPercent: number) => {
    const { soundObject, duration } = get();
    const clamped = Math.max(0, Math.min(1, progressPercent));
    if (soundObject && duration > 0) {
      const positionSeconds = clamped * duration;
      await soundObject.seekTo(positionSeconds);
      set({ progress: clamped, currentTime: positionSeconds });
    }
  },
}));
