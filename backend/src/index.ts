import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { checkDbConnection } from './db';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import musicRoutes from './modules/music/music.routes';
import chatRoutes from './modules/chat/chat.routes';
import swaggerSpec from './docs/swagger.json';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
    endpoints: {
      auth: '/api/auth',
      music: '/api/music',
      chat: '/api/chat',
      health: '/health',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/chat', chatRoutes);

// Centralized error handling
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, async () => {
    console.log(`🚀 Anaska backend running on http://localhost:${config.port}`);
    console.log(`📚 Swagger documentation at http://localhost:${config.port}/api/docs`);
    console.log(`📡 Environment: ${config.nodeEnv}`);
    await checkDbConnection();
  });
}

export default app;
