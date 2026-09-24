import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { config } from '../config/env';

export interface UserPayload {
  id: string;
  email: string;
  username: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  genre_preferences: string[];
  created_at: Date;
}

export class AuthService {
  async hashPassword(pw: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(pw, saltRounds);
  }

  async comparePassword(pw: string, hash: string): Promise<boolean> {
    return bcrypt.compare(pw, hash);
  }

  generateTokens(user: UserPayload): AuthTokens {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.accessExpiresIn,
    };
  }

  verifyAccessToken(token: string): UserPayload {
    return jwt.verify(token, config.jwt.accessSecret) as UserPayload;
  }

  verifyRefreshToken(token: string): { id: string } {
    return jwt.verify(token, config.jwt.refreshSecret) as { id: string };
  }

  async signup(data: {
    username: string;
    email: string;
    password: string;
    genrePreferences?: string[];
  }): Promise<{ user: UserRecord; tokens: AuthTokens }> {
    const existing = await pool.query(
      'SELECT id, username, email FROM users WHERE email = $1 OR username = $2',
      [data.email.toLowerCase(), data.username]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      const match = existing.rows[0];
      if (match.email === data.email.toLowerCase()) {
        const error: any = new Error('Email is already registered');
        error.statusCode = 409;
        throw error;
      }
      if (match.username === data.username) {
        const error: any = new Error('Username is already taken');
        error.statusCode = 409;
        throw error;
      }
    }

    const passwordHash = await this.hashPassword(data.password);
    const result = await pool.query<UserRecord>(
      `INSERT INTO users (username, email, password_hash, genre_preferences)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, avatar, genre_preferences, created_at`,
      [
        data.username,
        data.email.toLowerCase(),
        passwordHash,
        data.genrePreferences || [],
      ]
    );

    const user = result.rows[0];
    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    return { user, tokens };
  }

  async login(credentials: {
    login: string; // username or email
    password: string;
  }): Promise<{ user: UserRecord; tokens: AuthTokens }> {
    const result = await pool.query(
      `SELECT id, username, email, password_hash, avatar, genre_preferences, created_at
       FROM users
       WHERE email = $1 OR username = $1`,
      [credentials.login.toLowerCase()]
    );

    if (!result.rowCount || result.rowCount === 0) {
      const error: any = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const row = result.rows[0];
    const isMatch = await this.comparePassword(credentials.password, row.password_hash);
    if (!isMatch) {
      const error: any = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const user: UserRecord = {
      id: row.id,
      username: row.username,
      email: row.email,
      avatar: row.avatar,
      genre_preferences: row.genre_preferences || [],
      created_at: row.created_at,
    };

    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    return { user, tokens };
  }

  async refreshToken(token: string): Promise<AuthTokens> {
    try {
      const payload = this.verifyRefreshToken(token);
      const userRes = await pool.query(
        'SELECT id, username, email FROM users WHERE id = $1',
        [payload.id]
      );

      if (!userRes.rowCount || userRes.rowCount === 0) {
        const error: any = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      const user = userRes.rows[0];
      return this.generateTokens(user);
    } catch (err: any) {
      const error: any = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      throw error;
    }
  }

  async getUserById(id: string): Promise<UserRecord | null> {
    const res = await pool.query<UserRecord>(
      `SELECT id, username, email, avatar, genre_preferences, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async updatePreferences(
    userId: string,
    genres: string[]
  ): Promise<UserRecord> {
    const res = await pool.query<UserRecord>(
      `UPDATE users
       SET genre_preferences = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, username, email, avatar, genre_preferences, created_at`,
      [genres, userId]
    );
    if (!res.rowCount) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return res.rows[0];
  }

  async updateProfile(
    userId: string,
    data: { username?: string; avatar?: string }
  ): Promise<UserRecord> {
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.username) {
      updates.push(`username = $${idx++}`);
      values.push(data.username);
    }
    if (data.avatar !== undefined) {
      updates.push(`avatar = $${idx++}`);
      values.push(data.avatar);
    }

    if (updates.length === 0) {
      const user = await this.getUserById(userId);
      if (!user) throw new Error('User not found');
      return user;
    }

    values.push(userId);
    const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, username, email, avatar, genre_preferences, created_at`;
    const res = await pool.query<UserRecord>(sql, values);
    return res.rows[0];
  }
}

export const authService = new AuthService();
