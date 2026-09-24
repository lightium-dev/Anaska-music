import { apiRequest } from './api';
import { Genre, Track } from '../types';

export const musicService = {
  async getGenres(): Promise<Genre[]> {
    const res = await apiRequest<{ success: boolean; data: Genre[] }>('/api/music/genres');
    return res.data;
  },

  async getTracks(params?: { genreId?: string; search?: string }): Promise<Track[]> {
    const searchParams = new URLSearchParams();
    if (params?.genreId) searchParams.append('genreId', params.genreId);
    if (params?.search) searchParams.append('search', params.search);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await apiRequest<{ success: boolean; data: any[] }>(`/api/music/tracks${query}`);

    return res.data.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      genreId: t.genre_id || t.genreId,
      audioUrl: t.audio_url || t.audioUrl,
      coverUrl: t.cover_url || t.coverUrl,
      duration: t.duration,
    }));
  },

  async getTrackById(id: string): Promise<Track> {
    const res = await apiRequest<{ success: boolean; data: any }>(`/api/music/tracks/${id}`);
    const t = res.data;
    return {
      id: t.id,
      title: t.title,
      artist: t.artist,
      genreId: t.genre_id || t.genreId,
      audioUrl: t.audio_url || t.audioUrl,
      coverUrl: t.cover_url || t.coverUrl,
      duration: t.duration,
    };
  },
};
