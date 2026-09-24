import { Request, Response, NextFunction } from 'express';
import { authService, UserPayload } from '../services/AuthService';

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { message: 'Authentication required. Missing Bearer token.' },
    });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = authService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired access token.' },
    });
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      req.user = authService.verifyAccessToken(token);
    } catch {
      // Ignored for optional
    }
  }
  next();
};
