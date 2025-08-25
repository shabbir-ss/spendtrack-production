import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

export async function runStartupMigrations() {
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not available - skipping migrations');
    return false;
  }

  try {
    console.log('Running startup database migrations...');
    
    const client = postgres(process.env.DATABASE_URL);
    const db = drizzle(client);

    console.log('Connected to database, running migrations...');
    await migrate(db, { migrationsFolder: './migrations' });
    
    console.log('✅ Database migrations completed successfully');
    
    await client.end();
    return true;
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    // Don't throw error - let app continue with fallback storage
    return false;
  }
}

// If called directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  runStartupMigrations()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}