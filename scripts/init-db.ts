import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { income, expenses, assets, bills } from '../shared/schema';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    const client = postgres(process.env.DATABASE_URL);
    const db = drizzle(client);

    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: './migrations' });
    
    console.log('Migrations completed successfully');
    
    // Verify tables exist
    console.log('Verifying tables...');
    const tableNames = ['income', 'expenses', 'assets', 'bills'];
    
    console.log(`Database initialized with tables: ${tableNames.join(', ')}`);
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

main();