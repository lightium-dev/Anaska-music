import { Router } from 'express';
import { getGenres, getTracks, getTrackById, streamTrack } from './music.controller';

const router = Router();

router.get('/genres', getGenres);
router.get('/tracks', getTracks);
router.get('/tracks/:id', getTrackById);
router.get('/tracks/:id/stream', streamTrack);

export default router;
