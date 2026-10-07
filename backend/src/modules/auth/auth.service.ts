import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op, UniqueConstraintError } from 'sequelize';
import { getModels } from '../../db';
import { config } from '../../config/env';

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
  private toUserRecord(user: {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
    genre_preferences: string[];
    created_at: Date;
  }): UserRecord {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      genre_preferences: user.genre_preferences || [],
      created_at: user.created_at,
    };
  }

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

    const refreshToken = jwt.sign({ id: user.id }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
    });

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
    const { User } = await getModels();
    const existing = await User.findOne({
      where: { [Op.or]: [{ email: data.email.toLowerCase() }, { username: data.username }] },
    });

    if (existing?.email === data.email.toLowerCase()) {
      const error: any = new Error('Email is already registered');
      error.statusCode = 409;
      throw error;
    }
    if (existing?.username === data.username) {
      const error: any = new Error('Username is already taken');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await this.hashPassword(data.password);
    const userId = crypto.randomUUID();
    let createdUser;
    try {
      createdUser = await User.create({
        id: userId,
        username: data.username,
        email: data.email.toLowerCase(),
        password_hash: passwordHash,
        genre_preferences: data.genrePreferences || [],
        avatar: null,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const conflict = new Error(
          error.fields && 'email' in error.fields
            ? 'Email is already registered'
            : 'Username is already taken'
        ) as Error & { statusCode: number };
        conflict.statusCode = 409;
        throw conflict;
      }
      throw error;
    }
    const user = this.toUserRecord(createdUser);
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
    const { User } = await getModels();
    const row = await User.findOne({
      where: {
        [Op.or]: [
          { email: credentials.login.toLowerCase() },
          { username: credentials.login.toLowerCase() },
        ],
      },
    });

    if (!row) {
      const error: any = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await this.comparePassword(credentials.password, row.password_hash);
    if (!isMatch) {
      const error: any = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const user = this.toUserRecord(row);

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
      const { User } = await getModels();
      const user = await User.findByPk(payload.id);

      if (!user) {
        const error: any = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      return this.generateTokens(user);
    } catch (err: any) {
      const error: any = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      throw error;
    }
  }

  async getUserById(id: string): Promise<UserRecord | null> {
    const { User } = await getModels();
    const user = await User.findByPk(id);
    return user ? this.toUserRecord(user) : null;
  }

  async updatePreferences(userId: string, genres: string[]): Promise<UserRecord> {
    const { User } = await getModels();
    const user = await User.findByPk(userId);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    await user.update({ genre_preferences: genres, updated_at: new Date() });
    return this.toUserRecord(user);
  }

  async updateProfile(
    userId: string,
    data: { username?: string; avatar?: string }
  ): Promise<UserRecord> {
    const { User } = await getModels();
    const user = await User.findByPk(userId);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    const updates: { username?: string; avatar?: string | null; updated_at?: Date } = {};
    if (data.username) updates.username = data.username;
    if (data.avatar !== undefined) updates.avatar = data.avatar;
    if (Object.keys(updates).length === 0) return this.toUserRecord(user);

    updates.updated_at = new Date();
    await user.update(updates);
    return this.toUserRecord(user);
  }
}

export const authService = new AuthService();
