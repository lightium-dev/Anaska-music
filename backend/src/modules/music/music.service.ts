import { col, fn, Op, where } from 'sequelize';
import { getModels } from '../../db';

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

const genreToAudiusTag: Record<string, string> = {
  synthwave: 'Electronic',
  lofi: 'Lo-Fi',
  electronic: 'Electronic',
  ambient: 'Ambient',
  rock: 'Rock',
  metal: 'Metal',
  hiphop: 'Hip-Hop/Rap',
  jazz: 'Jazz',
  blues: 'Blues',
};

// In-memory cache for live external music searches
const musicCache = new Map<string, { data: TrackRecord[]; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export class MusicService {
  async getGenres(): Promise<GenreRecord[]> {
    const { Genre } = await getModels();
    const genres = await Genre.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] });
    return genres.map((genre) => genre.get({ plain: true }));
  }

  /**
   * Search full-length tracks (3 to 6+ minutes) from Audius protocol
   */
  async searchFullLengthTracks(
    query: string,
    genreId?: string,
    limit: number = 20
  ): Promise<TrackRecord[]> {
    const cacheKey = `full_${query.toLowerCase().trim()}_${genreId || 'all'}`;
    const cached = musicCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const tracks: TrackRecord[] = [];

    // 1. Fetch full-length audio from Audius Protocol (No 30s limits!)
    try {
      const audiusRes = await fetch(
        `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(
          query.trim()
        )}&app_name=ANASKA&limit=${limit}`,
        { signal: AbortSignal.timeout(4500) }
      );

      if (audiusRes.ok) {
        const json: any = await audiusRes.json();
        if (Array.isArray(json.data)) {
          for (const t of json.data) {
            // Filter to tracks at least 120 seconds long (2+ minutes full length)
            if (t.duration && t.duration >= 120) {
              tracks.push({
                id: `audius-${t.id}`,
                title: t.title,
                artist: t.user?.name || 'Artist',
                genre_id: genreId || this.detectGenre(t.title, t.user?.name),
                audio_url: `https://discoveryprovider.audius.co/v1/tracks/${t.id}/stream?app_name=ANASKA`,
                cover_url:
                  t.artwork?.['480x480'] ||
                  t.artwork?.['150x150'] ||
                  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
                duration: t.duration,
                created_at: new Date(),
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('[MusicService] Audius search error:', (e as Error).message);
    }

    // 2. Fetch full-length trending tracks for genre if results are sparse
    if (tracks.length < 5 && genreId) {
      const tag = genreToAudiusTag[genreId] || 'Electronic';
      try {
        const trendingRes = await fetch(
          `https://discoveryprovider.audius.co/v1/tracks/trending?genre=${encodeURIComponent(
            tag
          )}&limit=15&app_name=ANASKA`,
          { signal: AbortSignal.timeout(4500) }
        );

        if (trendingRes.ok) {
          const json: any = await trendingRes.json();
          if (Array.isArray(json.data)) {
            for (const t of json.data) {
              if (
                t.duration &&
                t.duration >= 120 &&
                !tracks.some((ex) => ex.id === `audius-${t.id}`)
              ) {
                tracks.push({
                  id: `audius-${t.id}`,
                  title: t.title,
                  artist: t.user?.name || 'Artist',
                  genre_id: genreId,
                  audio_url: `https://discoveryprovider.audius.co/v1/tracks/${t.id}/stream?app_name=ANASKA`,
                  cover_url:
                    t.artwork?.['480x480'] ||
                    t.artwork?.['150x150'] ||
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
                  duration: t.duration,
                  created_at: new Date(),
                });
              }
            }
          }
        }
      } catch (error) {
        console.warn('[MusicService] Audius trending search error:', (error as Error).message);
      }
    }

    musicCache.set(cacheKey, { data: tracks, timestamp: Date.now() });
    return tracks;
  }

  private detectGenre(title?: string, artist?: string): string {
    const text = `${title || ''} ${artist || ''}`.toLowerCase();
    if (
      text.includes('metal') ||
      text.includes('metallica') ||
      text.includes('slipknot') ||
      text.includes('iron maiden') ||
      text.includes('black sabbath') ||
      text.includes('megadeth') ||
      text.includes('industrial') ||
      text.includes('judas priest')
    )
      return 'metal';
    if (
      text.includes('rock') ||
      text.includes('nirvana') ||
      text.includes('led zeppelin') ||
      text.includes('pink floyd') ||
      text.includes('queen') ||
      text.includes('ac/dc') ||
      text.includes('guns n') ||
      text.includes('hendrix') ||
      text.includes('indie')
    )
      return 'rock';
    if (
      text.includes('jazz') ||
      text.includes('miles davis') ||
      text.includes('coltrane') ||
      text.includes('brubeck') ||
      text.includes('hancock') ||
      text.includes('chet baker') ||
      text.includes('bebop') ||
      text.includes('swing')
    )
      return 'jazz';
    if (
      text.includes('blues') ||
      text.includes('bleu') ||
      text.includes('b.b. king') ||
      text.includes('bb king') ||
      text.includes('stevie ray') ||
      text.includes('muddy waters') ||
      text.includes('gary moore') ||
      text.includes('clapton')
    )
      return 'blues';
    if (
      text.includes('synth') ||
      text.includes('kavinsky') ||
      text.includes('weeknd') ||
      text.includes('midnight') ||
      text.includes('retro')
    )
      return 'synthwave';
    if (
      text.includes('lofi') ||
      text.includes('lo-fi') ||
      text.includes('chill') ||
      text.includes('study')
    )
      return 'lofi';
    if (
      text.includes('ambient') ||
      text.includes('sleep') ||
      text.includes('drone') ||
      text.includes('meditation')
    )
      return 'ambient';
    if (
      text.includes('rap') ||
      text.includes('hip hop') ||
      text.includes('trap') ||
      text.includes('r&b') ||
      text.includes('kendrick')
    )
      return 'hiphop';
    return 'electronic';
  }

  async getTracks(filter?: {
    genreId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ tracks: TrackRecord[]; total: number }> {
    const limit = filter?.limit || 50;
    const offset = filter?.offset || 0;
    const { Genre, Track } = await getModels();
    const filters = [];
    if (filter?.genreId) filters.push({ genre_id: filter.genreId });
    if (filter?.search) {
      const searchTerm = `%${filter.search.toLowerCase()}%`;
      filters.push({
        [Op.or]: [
          where(fn('LOWER', col('Track.title')), { [Op.like]: searchTerm }),
          where(fn('LOWER', col('Track.artist')), { [Op.like]: searchTerm }),
          where(fn('LOWER', col('genre.name')), { [Op.like]: searchTerm }),
        ],
      });
    }
    const result = await Track.findAndCountAll({
      where: filters.length ? { [Op.and]: filters } : undefined,
      include: [{ model: Genre, as: 'genre', attributes: [], required: false }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });
    let tracks = result.rows.map((track) => track.get({ plain: true }) as TrackRecord);

    // Search live full-length catalog
    if (filter?.search && filter.search.trim().length > 1) {
      const fullLengthTracks = await this.searchFullLengthTracks(filter.search, filter.genreId, 25);

      const existingKeys = new Set(
        tracks.map((t) => `${t.title.toLowerCase()}::${t.artist.toLowerCase()}`)
      );
      const newUnique = fullLengthTracks.filter(
        (t) => !existingKeys.has(`${t.title.toLowerCase()}::${t.artist.toLowerCase()}`)
      );
      tracks = [...tracks, ...newUnique];
    } else if (filter?.genreId && tracks.length < 10) {
      const genreQuery = genreToAudiusTag[filter.genreId] || filter.genreId;
      const fullLengthGenre = await this.searchFullLengthTracks(genreQuery, filter.genreId, 15);

      const existingKeys = new Set(
        tracks.map((t) => `${t.title.toLowerCase()}::${t.artist.toLowerCase()}`)
      );
      const newUnique = fullLengthGenre.filter(
        (t) => !existingKeys.has(`${t.title.toLowerCase()}::${t.artist.toLowerCase()}`)
      );
      tracks = [...tracks, ...newUnique];
    }

    return { tracks, total: tracks.length };
  }

  async getTrackById(id: string): Promise<TrackRecord | null> {
    if (id.startsWith('audius-')) {
      const audiusId = id.replace('audius-', '');
      try {
        const res = await fetch(
          `https://discoveryprovider.audius.co/v1/tracks/${audiusId}?app_name=ANASKA`,
          {
            signal: AbortSignal.timeout(4000),
          }
        );
        if (res.ok) {
          const json: any = await res.json();
          const t = json.data;
          if (t) {
            return {
              id,
              title: t.title,
              artist: t.user?.name || 'Artist',
              genre_id: 'electronic',
              audio_url: `https://discoveryprovider.audius.co/v1/tracks/${audiusId}/stream?app_name=ANASKA`,
              cover_url:
                t.artwork?.['480x480'] ||
                t.artwork?.['150x150'] ||
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
              duration: t.duration || 240,
              created_at: new Date(),
            };
          }
        }
      } catch (e) {
        console.warn('[MusicService] Failed to lookup Audius track:', e);
      }
    }

    const { Track } = await getModels();
    const track = await Track.findByPk(id);
    return track ? (track.get({ plain: true }) as TrackRecord) : null;
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
