import { MusicService } from '../../src/services/MusicService';
import { pool } from '../../src/db';

jest.mock('../../src/db', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('MusicService Unit Tests', () => {
  const musicService = new MusicService();
  const mockPoolQuery = pool.query as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getGenres returns list of genres', async () => {
    const mockGenres = [
      { id: 'synthwave', name: 'Synthwave & Retrowave' },
      { id: 'lofi', name: 'Lo-Fi Chill & Beats' },
    ];
    mockPoolQuery.mockResolvedValueOnce({ rows: mockGenres });

    const genres = await musicService.getGenres();
    expect(genres).toEqual(mockGenres);
    expect(mockPoolQuery).toHaveBeenCalledWith(
      'SELECT id, name FROM genres ORDER BY name ASC'
    );
  });

  test('getTrackById returns track or null', async () => {
    const mockTrack = {
      id: 'track-1',
      title: 'Neon Horizon',
      artist: 'Cyberpulse',
      genre_id: 'synthwave',
      audio_url: 'https://example.com/audio.mp3',
      cover_url: 'https://example.com/cover.jpg',
      duration: 195,
      created_at: new Date(),
    };
    mockPoolQuery.mockResolvedValueOnce({ rows: [mockTrack] });

    const track = await musicService.getTrackById('track-1');
    expect(track).toEqual(mockTrack);
  });
});
