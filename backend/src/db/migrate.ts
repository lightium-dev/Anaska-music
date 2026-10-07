import { closeDatabase, initializeDatabase } from './index';

export async function runMigrations() {
  console.log('Running Sequelize model synchronization...');
  await initializeDatabase();
  console.log('✓ Database schema synchronized successfully.');
}

if (require.main === module) {
  runMigrations()
    .catch((error: unknown) => {
      console.error('✗ Migration failed:', error);
      process.exitCode = 1;
    })
    .finally(closeDatabase);
}
