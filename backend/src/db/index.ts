import { Pool, QueryResult, QueryResultRow } from 'pg';
import { config } from '../config/env';

export const pool = new Pool({
  connectionString: config.database.url,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (config.nodeEnv === 'development') {
    console.log('[DB Query]', { text, duration: `${duration}ms`, rows: res.rowCount });
  }
  return res;
};

export const checkDbConnection = async (): Promise<boolean> => {
  try {
    const res = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✓ PostgreSQL connected successfully at:', res.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('✗ PostgreSQL connection failed:', error);
    return false;
  }
};
