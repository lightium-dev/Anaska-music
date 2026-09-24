import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface UserState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  updateGenres: (genres: string[]) => void;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isOnboarded: false,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      isOnboarded: !!(user && user.genrePreferences && user.genrePreferences.length > 0),
    });
  },

  setTokens: async (accessToken, refreshToken) => {
    set({ accessToken, refreshToken, isAuthenticated: !!accessToken });
    if (accessToken && refreshToken) {
      await AsyncStorage.multiSet([
        ['@anaska_access_token', accessToken],
        ['@anaska_refresh_token', refreshToken],
      ]);
    } else {
      await AsyncStorage.multiRemove(['@anaska_access_token', '@anaska_refresh_token', '@anaska_user']);
    }
  },

  updateGenres: async (genres) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, genrePreferences: genres };
      set({ user: updated, isOnboarded: genres.length > 0 });
      await AsyncStorage.setItem('@anaska_user', JSON.stringify(updated));
    }
  },

  logout: async () => {
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isOnboarded: false,
    });
    await AsyncStorage.multiRemove([
      '@anaska_access_token',
      '@anaska_refresh_token',
      '@anaska_user',
    ]);
  },

  loadStoredAuth: async () => {
    try {
      const [[, token], [, refresh], [, storedUser]] = await AsyncStorage.multiGet([
        '@anaska_access_token',
        '@anaska_refresh_token',
        '@anaska_user',
      ]);

      if (token) {
        const parsedUser: User | null = storedUser ? JSON.parse(storedUser) : null;
        set({
          accessToken: token,
          refreshToken: refresh,
          user: parsedUser,
          isAuthenticated: true,
          isOnboarded: !!(parsedUser && parsedUser.genrePreferences && parsedUser.genrePreferences.length > 0),
        });
      }
    } catch (e) {
      console.error('Failed to load stored auth:', e);
    }
  },
}));
