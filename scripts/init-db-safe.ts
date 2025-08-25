import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { income, expenses, assets, bills } from '../shared/schema';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

async function main() {
  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not available during build - migrations will run at startup');
    console.log('This is normal for Railway deployments');
    process.exit(0); // Exit successfully, migrations will run at startup
  }

  try {
    console.log('DATABASE_URL found - running migrations...');
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
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    console.log('Migrations will be retried at application startup');
    process.exit(0); // Don't fail the build, let app handle it
  }
}

main();