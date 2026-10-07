import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { aiAssistantService } from './chat.service';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';

const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().optional().nullable(),
});

const guestUserId = '00000000-0000-4000-8000-000000000001';

export const streamChat = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || guestUserId;

    const { message, sessionId: providedSessionId } = chatMessageSchema.parse(req.body);

    let session;
    if (providedSessionId && providedSessionId !== 'local' && providedSessionId !== 'temp') {
      session = { id: providedSessionId, user_id: userId, started_at: new Date() };
    } else {
      session = await aiAssistantService.getOrCreateSession(userId);
    }

    await aiAssistantService.streamResponse(session.id, message, res);
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

export const getHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || guestUserId;

    const session = await aiAssistantService.getOrCreateSession(userId);
    const messages = await aiAssistantService.getSessionMessages(session.id);

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        messages,
      },
    });
  } catch (err) {
    next(err);
  }
};
