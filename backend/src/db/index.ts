import { Pool as PgPool, QueryResult, QueryResultRow } from 'pg';
import { config } from '../config/env';
import { getOrCreateMemoryDb } from './memoryDb';

export const realPgPool = new PgPool({
  connectionString: config.database.url,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

realPgPool.on('error', (err) => {
  // Only log if not a connection refusal during fallback
  if ((err as any).code !== 'ECONNREFUSED') {
    console.error('PostgreSQL idle client error:', err);
  }
});

let isUsingMemoryDb = false;
let memoryPoolPromise: Promise<any> | null = null;
let dbCheckDone = false;

async function getActivePool(): Promise<any> {
  if (dbCheckDone) {
    if (isUsingMemoryDb) {
      if (!memoryPoolPromise) memoryPoolPromise = getOrCreateMemoryDb().then((r) => r.pool);
      return memoryPoolPromise;
    }
    return realPgPool;
  }

  // First time check
  try {
    const client = await realPgPool.connect();
    client.release();
    dbCheckDone = true;
    isUsingMemoryDb = false;
    return realPgPool;
  } catch (err: any) {
    dbCheckDone = true;
    isUsingMemoryDb = true;
    console.log(
      '⚡ [Anaska DB] PostgreSQL container not detected on localhost:5432.'
    );
    console.log(
      '📦 [Anaska DB] Auto-activated In-Memory Database with pre-seeded tracks & DJ Muse knowledge!'
    );
    memoryPoolPromise = getOrCreateMemoryDb().then((r) => r.pool);
    return memoryPoolPromise;
  }
}

export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  const activePool = await getActivePool();
  return activePool.query(text, params);
};

// Proxy pool export to maintain complete backward compatibility with all imports
export const pool = {
  query: async <T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
    const activePool = await getActivePool();
    return activePool.query(text, params);
  },
  on: (event: any, listener: (...args: any[]) => void) => {
    realPgPool.on(event, listener);
    return pool;
  },
  end: async () => {
    if (!isUsingMemoryDb) {
      await realPgPool.end();
    }
  },
};

export const checkDbConnection = async (): Promise<boolean> => {
  try {
    const p = await getActivePool();
    const res = await p.query('SELECT NOW() as now_time');
    const time = res.rows[0]?.now_time || new Date().toISOString();
    if (isUsingMemoryDb) {
      console.log('✓ Database operational in [In-Memory Mode] at:', time);
    } else {
      console.log('✓ PostgreSQL connected successfully at:', time);
    }
    return true;
  } catch (error) {
    console.error('✗ Database check failed:', error);
    return false;
  }
};

export const isMemoryMode = (): boolean => isUsingMemoryDb;
