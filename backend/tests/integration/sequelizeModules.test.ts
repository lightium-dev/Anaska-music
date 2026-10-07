import { closeDatabase, initializeDatabase } from '../../src/db';
import { aiAssistantService } from '../../src/modules/chat/chat.service';
import { authService } from '../../src/modules/auth/auth.service';
import { musicService } from '../../src/modules/music/music.service';

describe('Sequelize feature modules', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  test('auth module persists users and preferences through Sequelize', async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const signup = await authService.signup({
      username: `user-${suffix}`,
      email: `${suffix}@example.test`,
      password: 'password123',
      genrePreferences: ['jazz'],
    });

    expect(signup.user.genre_preferences).toEqual(['jazz']);
    const login = await authService.login({
      login: signup.user.email,
      password: 'password123',
    });
    expect(login.user.id).toBe(signup.user.id);
    await expect(authService.updatePreferences(signup.user.id, ['rock'])).resolves.toMatchObject({
      genre_preferences: ['rock'],
    });
  });

  test('music module reads seeded genres and tracks through Sequelize', async () => {
    await expect(musicService.getGenres()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'jazz' })])
    );
    await expect(musicService.getTrackById('track-jazz-1')).resolves.toMatchObject({
      id: 'track-jazz-1',
      genre_id: 'jazz',
    });
  });

  test('chat module stores and retrieves session messages through Sequelize', async () => {
    const session = await aiAssistantService.getOrCreateSession(
      '00000000-0000-4000-8000-000000000001'
    );
    const saved = await aiAssistantService.saveMessage(session.id, 'user', 'jazz recommendations');
    const history = await aiAssistantService.getSessionMessages(session.id);

    expect(history).toContainEqual(expect.objectContaining({ id: saved.id, role: 'user' }));
  });

  test('chat module curates local tracks with the in-memory PostgreSQL adapter', async () => {
    const fetch = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false } as Response);
    try {
      const playlist = await aiAssistantService.detectMusicIntentAndCurate('play jazz');
      expect(playlist?.tracks.length).toBeGreaterThan(0);
    } finally {
      fetch.mockRestore();
    }
  });
});
