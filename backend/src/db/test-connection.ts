import { checkDbConnection, pool } from './index';

async function main() {
  console.log('Testing PostgreSQL database connection...');
  const success = await checkDbConnection();
  await pool.end();
  if (!success) {
    process.exit(1);
  }
  process.exit(0);
}

main();
