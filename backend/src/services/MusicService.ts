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

export class MusicService {
  async getGenres(): Promise<GenreRecord[]> {
    const res = await pool.query<GenreRecord>(
      'SELECT id, name FROM genres ORDER BY name ASC'
    );
    return res.rows;
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

    const countQuery = `
      SELECT COUNT(*) as count 
      FROM tracks t 
      LEFT JOIN genres g ON t.genre_id = g.id 
      ${whereClause}
    `;
    const countRes = await pool.query(countQuery, values);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

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

    const res = await pool.query<TrackRecord>(queryStr, values);
    return { tracks: res.rows, total };
  }

  async getTrackById(id: string): Promise<TrackRecord | null> {
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
