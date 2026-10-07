import { AuthService } from '../../src/modules/auth/auth.service';

describe('AuthService Unit Tests', () => {
  const authService = new AuthService();

  test('hashPassword generates valid bcrypt hash and matches password', async () => {
    const password = 'mySecretPassword123';
    const hash = await authService.hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);

    const isMatch = await authService.comparePassword(password, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await authService.comparePassword('wrongPass', hash);
    expect(isWrongMatch).toBe(false);
  });

  test('generateTokens returns access and refresh tokens that can be verified', () => {
    const payload = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@anaska.com',
      username: 'testuser',
    };

    const tokens = authService.generateTokens(payload);
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();

    const decoded = authService.verifyAccessToken(tokens.accessToken);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.username).toBe(payload.username);

    const refreshDecoded = authService.verifyRefreshToken(tokens.refreshToken);
    expect(refreshDecoded.id).toBe(payload.id);
  });
});
