import { MusicService } from '../../src/modules/music/music.service';
import { getModels } from '../../src/db';

jest.mock('../../src/db', () => ({
  getModels: jest.fn(),
}));

describe('MusicService Unit Tests', () => {
  const musicService = new MusicService();
  const mockGetModels = getModels as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getGenres returns list of genres', async () => {
    const mockGenres = [
      { id: 'synthwave', name: 'Synthwave & Retrowave' },
      { id: 'lofi', name: 'Lo-Fi Chill & Beats' },
    ];
    const findAll = jest.fn().mockResolvedValue(
      mockGenres.map((genre) => ({
        get: () => genre,
      }))
    );
    mockGetModels.mockResolvedValueOnce({ Genre: { findAll } });

    const genres = await musicService.getGenres();
    expect(genres).toEqual(mockGenres);
    expect(findAll).toHaveBeenCalledWith({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });
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
    const findByPk = jest.fn().mockResolvedValue({ get: () => mockTrack });
    mockGetModels.mockResolvedValueOnce({ Track: { findByPk } });

    const track = await musicService.getTrackById('track-1');
    expect(track).toEqual(mockTrack);
    expect(findByPk).toHaveBeenCalledWith('track-1');
  });
});
