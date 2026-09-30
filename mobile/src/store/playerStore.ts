import { create } from 'zustand';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer, AudioStatus } from 'expo-audio';
import { Track } from '../types';

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number; // 0 to 1
  currentTime: number; // in seconds
  duration: number; // in seconds
  soundObject: AudioPlayer | null;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';

  // Playback control actions
  play: (track?: Track, newQueue?: Track[]) => Promise<void>;
  pause: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seek: (progressPercent: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;

  // Queue & mode controls
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track) => void;
}

let isAudioModeConfigured = false;
let isSwitchingTrack = false;

async function configureAudio() {
  if (isAudioModeConfigured) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'mixWithOthers',
    });
    isAudioModeConfigured = true;
  } catch (err) {
    console.warn('[Audio Mode Notice]:', err);
  }
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  isLoading: false,
  progress: 0,
  currentTime: 0,
  duration: 0,
  soundObject: null,
  isShuffle: false,
  repeatMode: 'all',

  play: async (track?: Track, newQueue?: Track[]) => {
    const state = get();

    // 1. If a new queue is provided, update queue
    let activeQueue = state.queue;
    if (newQueue && newQueue.length > 0) {
      activeQueue = newQueue;
      set({ queue: newQueue });
    }

    // Determine target track
    let targetTrack = track;
    if (!targetTrack) {
      if (state.currentTrack) {
        targetTrack = state.currentTrack;
      } else if (activeQueue.length > 0) {
        targetTrack = activeQueue[0];
      }
    }

    if (!targetTrack) return;

    // Synchronize queue index
    let newIndex = activeQueue.findIndex((t) => t.id === targetTrack!.id);
    if (newIndex === -1) {
      activeQueue = [targetTrack, ...activeQueue];
      newIndex = 0;
      set({ queue: activeQueue, currentIndex: 0 });
    } else {
      set({ currentIndex: newIndex });
    }

    // 2. If no track was specified (e.g. play/pause toggled) and we already have a loaded player for current track
    if (!track && state.currentTrack && state.soundObject) {
      try {
        state.soundObject.play();
        set({ isPlaying: true });
        return;
      } catch (e) {
        console.warn('[Player Store] Resume error:', e);
      }
    }

    // 3. Changing track or loading audio
    const previousPlayer = state.soundObject;

    set({
      isLoading: true,
      currentTrack: targetTrack,
      progress: 0,
      currentTime: 0,
      duration: targetTrack.duration || 180,
    });

    // Cleanup previous sound object
    if (previousPlayer) {
      try {
        previousPlayer.pause();
        previousPlayer.remove();
      } catch (cleanupErr) {
        console.warn('[Player Cleanup Notice]:', cleanupErr);
      }
    }

    try {
      await configureAudio();

      console.log(`[Anaska Player] Loading track "${targetTrack.title}" by ${targetTrack.artist}`);
      
      const player = createAudioPlayer(targetTrack.audioUrl, {
        updateInterval: 250,
        keepAudioSessionActive: true,
      });

      if (get().repeatMode === 'one') {
        player.loop = true;
      }

      let lastPos = -1;
      let lastPlaying = false;
      let hasFinishedTriggered = false;

      player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
        if (status.isLoaded) {
          const trackDuration = status.duration > 0 ? status.duration : (targetTrack!.duration || 180);
          const pos = status.currentTime;
          const isPlayStateChanged = status.playing !== lastPlaying;
          const isTimeChanged = Math.abs(pos - lastPos) >= 0.5;

          if (isPlayStateChanged || isTimeChanged) {
            lastPos = pos;
            lastPlaying = status.playing;

            set({
              currentTime: pos,
              duration: trackDuration,
              progress: trackDuration > 0 ? Math.min(1, Math.max(0, pos / trackDuration)) : 0,
              isPlaying: status.playing,
              isLoading: false,
            });
          }

          if (status.didJustFinish && !hasFinishedTriggered) {
            hasFinishedTriggered = true;
            const currentMode = get().repeatMode;

            if (currentMode === 'one') {
              player.seekTo(0);
              player.play();
              hasFinishedTriggered = false;
            } else {
              setTimeout(() => {
                get().playNext();
              }, 150);
            }
          }
        }
      });

      player.play();

      set({
        soundObject: player,
        isPlaying: true,
        isLoading: false,
        duration: targetTrack.duration || 180,
      });
    } catch (err) {
      console.error('[Anaska Player] Error loading track:', err);
      set({ isLoading: false, isPlaying: false });
    }
  },

  pause: async () => {
    const { soundObject } = get();
    if (soundObject) {
      try {
        soundObject.pause();
      } catch (e) {
        console.warn('[Player Pause Error]:', e);
      }
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
      try {
        await soundObject.seekTo(positionSeconds);
        set({ progress: clamped, currentTime: positionSeconds });
      } catch (err) {
        console.warn('[Player Seek Error]:', err);
      }
    }
  },

  playNext: async () => {
    const { queue, currentIndex, isShuffle, repeatMode, play } = get();
    if (!queue || queue.length === 0) return;

    if (queue.length === 1) {
      if (repeatMode !== 'off') {
        await play(queue[0]);
      }
      return;
    }

    let nextIndex = currentIndex;

    if (isShuffle) {
      // Pick random track different from current
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (nextIndex === currentIndex && queue.length > 1);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          // Reached end of queue without repeat all
          const { pause } = get();
          await pause();
          set({ progress: 1, currentTime: get().duration });
          return;
        }
      }
    }

    const nextTrack = queue[nextIndex];
    if (nextTrack) {
      await play(nextTrack);
    }
  },

  playPrevious: async () => {
    const { queue, currentIndex, currentTime, repeatMode, play, seek } = get();

    // Standard audio UX: If played more than 3 seconds, restart current track
    if (currentTime > 3) {
      await seek(0);
      const { soundObject } = get();
      if (soundObject) soundObject.play();
      return;
    }

    if (!queue || queue.length === 0) {
      await seek(0);
      return;
    }

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        prevIndex = queue.length - 1;
      } else {
        prevIndex = 0;
      }
    }

    const prevTrack = queue[prevIndex];
    if (prevTrack) {
      await play(prevTrack);
    }
  },

  toggleShuffle: () => {
    set((state) => ({ isShuffle: !state.isShuffle }));
  },

  toggleRepeat: () => {
    set((state) => {
      const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
      const nextIdx = (modes.indexOf(state.repeatMode) + 1) % modes.length;
      const newMode = modes[nextIdx];

      if (state.soundObject) {
        state.soundObject.loop = (newMode === 'one');
      }

      return { repeatMode: newMode };
    });
  },

  setQueue: (tracks: Track[], startIndex = 0) => {
    const safeIndex = Math.max(0, Math.min(tracks.length - 1, startIndex));
    set({
      queue: tracks,
      currentIndex: safeIndex,
    });
    if (tracks[safeIndex]) {
      get().play(tracks[safeIndex]);
    }
  },

  addToQueue: (track: Track) => {
    set((state) => {
      const exists = state.queue.some((t) => t.id === track.id);
      if (exists) return state;
      return { queue: [...state.queue, track] };
    });
  },
}));
