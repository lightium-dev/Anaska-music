import { create } from 'zustand';
import { Audio } from 'expo-av';
import { Track } from '../types';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number; // 0 to 1
  currentTime: number; // in seconds
  duration: number; // in seconds
  soundObject: Audio.Sound | null;
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
        await state.soundObject.unloadAsync();
      }

      set({ isLoading: true, currentTrack: track, progress: 0, currentTime: 0 });

      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: targetTrack.audioUrl },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              const dur = status.durationMillis ? status.durationMillis / 1000 : targetTrack.duration;
              const pos = status.positionMillis / 1000;
              set({
                currentTime: pos,
                duration: dur,
                progress: dur > 0 ? pos / dur : 0,
                isPlaying: status.isPlaying,
              });

              if (status.didJustFinish) {
                set({ isPlaying: false, progress: 1 });
              }
            }
          }
        );

        set({ soundObject: sound, isPlaying: true, isLoading: false, duration: targetTrack.duration });
      } catch (err) {
        console.error('Error loading audio:', err);
        set({ isLoading: false, isPlaying: false });
      }
    } else if (state.soundObject) {
      await state.soundObject.playAsync();
      set({ isPlaying: true });
    }
  },

  pause: async () => {
    const { soundObject } = get();
    if (soundObject) {
      await soundObject.pauseAsync();
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
      const positionMillis = clamped * duration * 1000;
      await soundObject.setPositionAsync(positionMillis);
      set({ progress: clamped, currentTime: clamped * duration });
    }
  },
}));
