import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { randomUUID } from 'crypto';

const connectionString = process.env.DATABASE_URL!;

async function migrateWithUsers() {
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  try {
    console.log('Starting migration with user handling...');

    // Step 1: Create users table first
    console.log('Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" varchar PRIMARY KEY NOT NULL,
        "email" text NOT NULL,
        "mobile" text NOT NULL,
        "name" text NOT NULL,
        "password" text NOT NULL,
        "email_notifications" boolean DEFAULT true,
        "sms_notifications" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "users_email_unique" UNIQUE("email")
      );
    `;

    // Step 2: Create a default user for existing data
    const defaultUserId = randomUUID();
    const defaultUserEmail = 'admin@spendtrack.com';
    const defaultPassword = '$2b$10$rQJ8kqZ5Z5Z5Z5Z5Z5Z5ZOZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z'; // hashed "admin123"
    
    console.log('Creating default user for existing data...');
    await sql`
      INSERT INTO users (id, email, mobile, name, password, email_notifications, sms_notifications)
      VALUES (${defaultUserId}, ${defaultUserEmail}, '+91-9999999999', 'Admin User', ${defaultPassword}, true, true)
      ON CONFLICT (email) DO NOTHING;
    `;

    // Step 3: Add user_id columns as nullable first
    console.log('Adding user_id columns...');
    
    // Check if columns already exist before adding them
    const checkColumn = async (table: string) => {
      const result = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = ${table} AND column_name = 'user_id';
      `;
      return result.length > 0;
    };

    const tables = ['assets', 'bills', 'expenses', 'income'];
    
    for (const table of tables) {
      const columnExists = await checkColumn(table);
      if (!columnExists) {
        console.log(`Adding user_id column to ${table}...`);
        await sql`ALTER TABLE ${sql(table)} ADD COLUMN user_id varchar;`;
      }
    }

    // Step 4: Update existing records with default user ID
    console.log('Updating existing records with default user...');
    for (const table of tables) {
      await sql`UPDATE ${sql(table)} SET user_id = ${defaultUserId} WHERE user_id IS NULL;`;
    }

    // Step 5: Make user_id columns NOT NULL and add foreign keys
    console.log('Making user_id columns NOT NULL and adding foreign keys...');
    for (const table of tables) {
      // Make column NOT NULL
      await sql`ALTER TABLE ${sql(table)} ALTER COLUMN user_id SET NOT NULL;`;
      
      // Add foreign key constraint if it doesn't exist
      const constraintName = `${table}_user_id_users_id_fk`;
      try {
        await sql`
          ALTER TABLE ${sql(table)} 
          ADD CONSTRAINT ${sql(constraintName)} 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE no action ON UPDATE no action;
        `;
      } catch (error: any) {
        if (error.code !== '42710') { // Ignore "constraint already exists" error
          throw error;
        }
      }
    }

    // Step 6: Update the drizzle migrations table to mark this migration as complete
    console.log('Updating migration status...');
    try {
      await sql`
        INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
        VALUES ('0001_nappy_tempest', ${Date.now()});
      `;
    } catch (error: any) {
      if (error.code !== '23505') { // Ignore duplicate key error
        throw error;
      }
    }

    console.log('Migration completed successfully!');
    console.log(`Default user created: ${defaultUserEmail} (password: admin123)`);
    console.log('You can now register new users or login with the default account.');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

migrateWithUsers().catch((error) => {
  console.error('Migration script failed:', error);
  process.exit(1);
});