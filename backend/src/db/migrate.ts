import fs from 'fs';
import path from 'path';
import { realPgPool } from './index';

export async function runMigrations() {
  console.log('Running database migrations...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    const client = await realPgPool.connect();
    try {
      await client.query(sql);
      console.log('✓ PostgreSQL database schema created/verified successfully!');
    } finally {
      client.release();
    }
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
      console.log('------------------------------------------------------------');
      console.log('ℹ️  PostgreSQL container is not currently running on localhost:5432.');
      console.log('ℹ️  To use persistent PostgreSQL: start Docker Desktop, then run:');
      console.log('     docker compose up -d');
      console.log('ℹ️  Good news: The Anaska backend has an integrated In-Memory');
      console.log('     database engine with all tables & seeds pre-loaded!');
      console.log('     You can immediately run: npm run dev');
      console.log('------------------------------------------------------------');
      return;
    }
    console.error('✗ Migration failed:', error);
    throw error;
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => realPgPool.end())
    .catch(() => process.exit(1));
}
