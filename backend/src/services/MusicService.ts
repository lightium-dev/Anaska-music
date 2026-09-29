import { pool } from '../db';

export interface GenreRecord {
  id: string;
  name: string;
}

export interface TrackRecord {
  id: string;
  title: string;
  artist: string;
  genre_id: string;
  audio_url: string;
  cover_url: string;
  duration: number;
  created_at: Date;
}

const genreToSearchQuery: Record<string, string> = {
  synthwave: 'synthwave kavinsky retro electro',
  lofi: 'lofi chill beats relax',
  electronic: 'electronic dance daft punk deadmau5',
  ambient: 'ambient brian eno sleep focus',
  rock: 'rock nirvana arctic monkeys queen linkin park',
  metal: 'heavy metal metallica slipknot iron maiden',
  hiphop: 'hip hop rap kendrick lamar travis scott',
};

// In-memory cache for live external music searches
const musicCache = new Map<string, { data: TrackRecord[]; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export class MusicService {
  async getGenres(): Promise<GenreRecord[]> {
    const res = await pool.query<GenreRecord>(
      'SELECT id, name FROM genres ORDER BY name ASC'
    );
    return res.rows;
  }

  /**
   * Search real world tracks from Deezer (over 90 million real artist songs) and iTunes
   */
  async searchExternalTracks(query: string, genreId?: string, limit: number = 20): Promise<TrackRecord[]> {
    const cacheKey = `ext_${query.toLowerCase().trim()}_${genreId || 'all'}`;
    const cached = musicCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const tracks: TrackRecord[] = [];

    // 1. Search Deezer (High quality preview MP3 + 500x500 album art)
    try {
      const deezerRes = await fetch(
        `https://api.deezer.com/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`,
        { signal: AbortSignal.timeout(4500) }
      );

      if (deezerRes.ok) {
        const json: any = await deezerRes.json();
        if (Array.isArray(json.data)) {
          for (const t of json.data) {
            if (t.preview) {
              tracks.push({
                id: `deezer-${t.id}`,
                title: t.title_short || t.title,
                artist: t.artist?.name || 'Real Artist',
                genre_id: genreId || this.detectGenre(t.title, t.artist?.name),
                audio_url: t.preview,
                cover_url:
                  t.album?.cover_big ||
                  t.album?.cover_medium ||
                  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
                duration: t.duration || 180,
                created_at: new Date(),
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('[MusicService] Deezer search error, trying iTunes:', (e as Error).message);
    }

    // 2. If Deezer returned fewer than 4 tracks, complement with iTunes Search API
    if (tracks.length < 4) {
      try {
        const itunesRes = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query.trim())}&entity=song&limit=${limit}`,
          { signal: AbortSignal.timeout(4500) }
        );

        if (itunesRes.ok) {
          const json: any = await itunesRes.json();
          if (Array.isArray(json.results)) {
            for (const t of json.results) {
              if (t.previewUrl && !tracks.some((ex) => ex.title.toLowerCase() === t.trackName?.toLowerCase())) {
                tracks.push({
                  id: `itunes-${t.trackId}`,
                  title: t.trackName,
                  artist: t.artistName,
                  genre_id: genreId || this.detectGenre(t.trackName, t.artistName),
                  audio_url: t.previewUrl,
                  cover_url:
                    t.artworkUrl100?.replace('100x100bb', '600x600bb') ||
                    t.artworkUrl100 ||
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
                  duration: Math.round((t.trackTimeMillis || 180000) / 1000),
                  created_at: new Date(),
                });
              }
            }
          }
        }
      } catch (e) {
        console.warn('[MusicService] iTunes search error:', (e as Error).message);
      }
    }

    musicCache.set(cacheKey, { data: tracks, timestamp: Date.now() });
    return tracks;
  }

  private detectGenre(title?: string, artist?: string): string {
    const text = `${title || ''} ${artist || ''}`.toLowerCase();
    if (text.includes('metal') || text.includes('metallica') || text.includes('slipknot') || text.includes('iron maiden') || text.includes('rammstein')) return 'metal';
    if (text.includes('rock') || text.includes('nirvana') || text.includes('arctic monkeys') || text.includes('queen') || text.includes('ac/dc') || text.includes('linkin park')) return 'rock';
    if (text.includes('synth') || text.includes('kavinsky') || text.includes('midnight') || text.includes('retro') || text.includes('gunship')) return 'synthwave';
    if (text.includes('lofi') || text.includes('lo-fi') || text.includes('chill') || text.includes('study')) return 'lofi';
    if (text.includes('ambient') || text.includes('sleep') || text.includes('drone') || text.includes('meditation')) return 'ambient';
    if (text.includes('rap') || text.includes('hip hop') || text.includes('kendrick') || text.includes('drake') || text.includes('travis')) return 'hiphop';
    return 'electronic';
  }

  async getTracks(filter?: {
    genreId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ tracks: TrackRecord[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (filter?.genreId) {
      conditions.push(`t.genre_id = $${idx++}`);
      values.push(filter.genreId);
    }

    if (filter?.search) {
      conditions.push(
        `(LOWER(t.title) LIKE $${idx} OR LOWER(t.artist) LIKE $${idx} OR LOWER(g.name) LIKE $${idx})`
      );
      values.push(`%${filter.search.toLowerCase()}%`);
      idx++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const limit = filter?.limit || 50;
    const offset = filter?.offset || 0;
    values.push(limit);
    values.push(offset);

    const queryStr = `
      SELECT t.id, t.title, t.artist, t.genre_id, t.audio_url, t.cover_url, t.duration, t.created_at
      FROM tracks t
      LEFT JOIN genres g ON t.genre_id = g.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    let tracks: TrackRecord[] = [];
    try {
      const res = await pool.query<TrackRecord>(queryStr, values);
      tracks = res.rows;
    } catch (e) {
      console.warn('[MusicService] DB Query error:', e);
    }

    // If searching, search real world artists from Deezer & iTunes!
    if (filter?.search && filter.search.trim().length > 1) {
      const realWorldTracks = await this.searchExternalTracks(filter.search, filter.genreId, 25);
      
      const existingKeys = new Set(tracks.map((t) => `${t.title.toLowerCase()}::${t.artist.toLowerCase()}`));
      const newUnique = realWorldTracks.filter(
        (t) => !existingKeys.has(`${t.title.toLowerCase()}::${t.artist.toLowerCase()}`)
      );
      tracks = [...tracks, ...newUnique];
    } else if (filter?.genreId && tracks.length < 10) {
      // If genre has few tracks, enrich with real tracks from that genre
      const genreQuery = genreToSearchQuery[filter.genreId] || filter.genreId;
      const genreTracks = await this.searchExternalTracks(genreQuery, filter.genreId, 15);
      
      const existingKeys = new Set(tracks.map((t) => `${t.title.toLowerCase()}::${t.artist.toLowerCase()}`));
      const newUnique = genreTracks.filter(
        (t) => !existingKeys.has(`${t.title.toLowerCase()}::${t.artist.toLowerCase()}`)
      );
      tracks = [...tracks, ...newUnique];
    }

    return { tracks, total: tracks.length };
  }

  async getTrackById(id: string): Promise<TrackRecord | null> {
    // 1. Deezer real track lookup
    if (id.startsWith('deezer-')) {
      const deezerId = id.replace('deezer-', '');
      try {
        const res = await fetch(`https://api.deezer.com/track/${deezerId}`, {
          signal: AbortSignal.timeout(4000),
        });
        if (res.ok) {
          const t: any = await res.json();
          if (t && t.preview) {
            return {
              id,
              title: t.title_short || t.title,
              artist: t.artist?.name || 'Artist',
              genre_id: 'electronic',
              audio_url: t.preview,
              cover_url: t.album?.cover_big || t.album?.cover_medium,
              duration: t.duration || 180,
              created_at: new Date(),
            };
          }
        }
      } catch (e) {
        console.warn('[MusicService] Failed to lookup Deezer track:', e);
      }
    }

    // 2. iTunes real track lookup
    if (id.startsWith('itunes-')) {
      const itunesId = id.replace('itunes-', '');
      try {
        const res = await fetch(`https://itunes.apple.com/lookup?id=${itunesId}`, {
          signal: AbortSignal.timeout(4000),
        });
        if (res.ok) {
          const json: any = await res.json();
          const t = json.results?.[0];
          if (t && t.previewUrl) {
            return {
              id,
              title: t.trackName,
              artist: t.artistName,
              genre_id: 'electronic',
              audio_url: t.previewUrl,
              cover_url: t.artworkUrl100?.replace('100x100bb', '600x600bb') || t.artworkUrl100,
              duration: Math.round((t.trackTimeMillis || 180000) / 1000),
              created_at: new Date(),
            };
          }
        }
      } catch (e) {
        console.warn('[MusicService] Failed to lookup iTunes track:', e);
      }
    }

    // 3. PostgreSQL database lookup
    const res = await pool.query<TrackRecord>(
      'SELECT id, title, artist, genre_id, audio_url, cover_url, duration, created_at FROM tracks WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  }

  async streamTrack(id: string): Promise<{ audioUrl: string; track: TrackRecord }> {
    const track = await this.getTrackById(id);
    if (!track) {
      const error: any = new Error('Track not found');
      error.statusCode = 404;
      throw error;
    }
    return {
      audioUrl: track.audio_url,
      track,
    };
  }
}

export const musicService = new MusicService();
