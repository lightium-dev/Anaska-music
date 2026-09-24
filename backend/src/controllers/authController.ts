import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/AuthService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

const signupSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  genrePreferences: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

const updatePreferencesSchema = z.object({
  genres: z.array(z.string()),
});

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = signupSchema.parse(req.body);
    const result = await authService.signup(validated);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: err.errors },
      });
      return;
    }
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = loginSchema.parse(req.body);
    const result = await authService.login(validated);
    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: err.errors },
      });
      return;
    }
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = refreshTokenSchema.parse(req.body);
    const tokens = await authService.refreshToken(validated.refreshToken);
    res.json({
      success: true,
      data: tokens,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: err.errors },
      });
      return;
    }
    next(err);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }
    const user = await authService.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, error: { message: 'User not found' } });
      return;
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updatePreferences = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }
    const validated = updatePreferencesSchema.parse(req.body);
    const user = await authService.updatePreferences(req.user.id, validated.genres);
    res.json({ success: true, data: user });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: err.errors },
      });
      return;
    }
    next(err);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
