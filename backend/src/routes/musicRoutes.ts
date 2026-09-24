import { Router } from 'express';
import {
  getGenres,
  getTracks,
  getTrackById,
  streamTrack,
} from '../controllers/musicController';

const router = Router();

router.get('/genres', getGenres);
router.get('/tracks', getTracks);
router.get('/tracks/:id', getTrackById);
router.get('/tracks/:id/stream', streamTrack);

export default router;
