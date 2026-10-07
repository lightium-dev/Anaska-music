import { checkDbConnection, closeDatabase } from './index';

async function main() {
  console.log('Testing database connection...');
  const success = await checkDbConnection();
  await closeDatabase();
  if (!success) {
    process.exit(1);
  }
  process.exit(0);
}

main();
