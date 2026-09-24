import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'anaska_user',
    password: process.env.DB_PASSWORD || 'anaska_secret',
    name: process.env.DB_NAME || 'anaska_db',
    url: process.env.DATABASE_URL || 'postgresql://anaska_user:anaska_secret@localhost:5432/anaska_db',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'anaska_jwt_access_secret_super_secure_key_2026',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'anaska_jwt_refresh_secret_super_secure_key_2026',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
