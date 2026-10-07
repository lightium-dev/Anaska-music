import { Sequelize } from 'sequelize';
import { config } from '../config/env';
import { initializeModels, DatabaseModels } from './models';
import { getOrCreateMemoryDb } from './memoryDb';

let initialization: Promise<void> | null = null;
let sequelize: Sequelize | null = null;
let models: DatabaseModels | null = null;
let usingMemoryDb = false;

const isConnectionUnavailable = (error: unknown): boolean => {
  let current: unknown = error;

  while (current instanceof Error) {
    const code = (current as NodeJS.ErrnoException).code;
    if (['ECONNREFUSED', 'ETIMEDOUT', 'EHOSTUNREACH', 'ENOTFOUND'].includes(code || '')) {
      return true;
    }
    current =
      (current as Error & { parent?: unknown; original?: unknown }).parent ||
      (current as Error & { original?: unknown }).original;
  }

  return false;
};

async function connectMemoryDatabase(): Promise<void> {
  const { db } = await getOrCreateMemoryDb();
  sequelize = new Sequelize(config.database.url, {
    dialect: 'postgres',
    dialectModule: db.adapters.createPg(),
    logging: false,
    pool: { max: 10, idle: 30000, acquire: 3000 },
  });
  await sequelize.authenticate();
  usingMemoryDb = true;
}

async function connect(): Promise<void> {
  if (config.nodeEnv === 'test') {
    await connectMemoryDatabase();
  } else {
    const postgres = new Sequelize(config.database.url, {
      dialect: 'postgres',
      logging: false,
      pool: { max: 20, idle: 30000, acquire: 3000 },
      dialectOptions: { connectionTimeoutMillis: 3000 },
    });

    try {
      await postgres.authenticate();
      sequelize = postgres;
    } catch (error) {
      await postgres.close();
      if (!isConnectionUnavailable(error)) {
        throw error;
      }

      await connectMemoryDatabase();
      console.log('⚡ [Anaska DB] PostgreSQL unavailable; using the seeded in-memory database.');
    }
  }

  const connectedSequelize = sequelize;
  if (!connectedSequelize) {
    throw new Error('Database connection was not established');
  }
  models = initializeModels(connectedSequelize);
  await connectedSequelize.sync();
}

export async function initializeDatabase(): Promise<void> {
  if (!initialization) {
    initialization = connect().catch((error: unknown) => {
      initialization = null;
      throw error;
    });
  }
  await initialization;
}

export async function getModels(): Promise<DatabaseModels> {
  await initializeDatabase();
  if (!models) {
    throw new Error('Database models were not initialized');
  }
  return models;
}

export async function checkDbConnection(): Promise<boolean> {
  try {
    await initializeDatabase();
    await sequelize!.query('SELECT NOW() AS now_time');
    console.log(
      usingMemoryDb
        ? '✓ Database operational in [In-Memory Mode]'
        : '✓ PostgreSQL connected successfully'
    );
    return true;
  } catch (error) {
    console.error('✗ Database check failed:', error);
    return false;
  }
}

export const isMemoryMode = (): boolean => usingMemoryDb;

export async function closeDatabase(): Promise<void> {
  if (sequelize) {
    await sequelize.close();
    sequelize = null;
    models = null;
    initialization = null;
  }
}
