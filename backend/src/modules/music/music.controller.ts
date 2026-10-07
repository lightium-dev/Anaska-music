import { Request, Response, NextFunction } from 'express';
import { musicService } from './music.service';

export const getGenres = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const genres = await musicService.getGenres();
    res.json({
      success: true,
      data: genres,
    });
  } catch (err) {
    next(err);
  }
};

export const getTracks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const genreId = req.query.genreId as string | undefined;
    const search = (req.query.search as string) || (req.query.q as string) || undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const result = await musicService.getTracks({ genreId, search, limit, offset });
    res.json({
      success: true,
      data: result.tracks,
      pagination: {
        total: result.total,
        limit,
        offset,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getTrackById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const track = await musicService.getTrackById(req.params.id);
    if (!track) {
      res.status(404).json({ success: false, error: { message: 'Track not found' } });
      return;
    }
    res.json({
      success: true,
      data: track,
    });
  } catch (err) {
    next(err);
  }
};

export const streamTrack = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await musicService.streamTrack(req.params.id);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
