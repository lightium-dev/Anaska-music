import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { checkDbConnection } from './db';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Middlewares
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check & Root Endpoints
app.get('/health', async (_req: Request, res: Response) => {
  const dbStatus = await checkDbConnection();
  res.status(dbStatus ? 200 : 503).json({
    status: dbStatus ? 'ok' : 'degraded',
    service: 'anaska-backend',
    database: dbStatus ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Anaska Music API with DJ Muse AI',
    version: '1.0.0',
    docs: '/api/docs',
  });
});

// Centralized error handling
app.use(errorHandler);

const server = app.listen(config.port, async () => {
  console.log(`🚀 Anaska backend running on http://localhost:${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  await checkDbConnection();
});

export default app;
