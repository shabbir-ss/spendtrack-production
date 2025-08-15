import 'dotenv/config';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const connectionString = process.env.DATABASE_URL!;

async function createDefaultUser() {
  const sql = postgres(connectionString, { max: 1 });

  try {
    console.log('Creating default user with proper password hash...');

    // Hash the password properly
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();

    // Insert or update the default user
    await sql`
      INSERT INTO users (id, email, mobile, name, password, email_notifications, sms_notifications)
      VALUES (${userId}, 'admin@spendtrack.com', '+91-9999999999', 'Admin User', ${hashedPassword}, true, true)
      ON CONFLICT (email) 
      DO UPDATE SET 
        password = ${hashedPassword},
        mobile = '+91-9999999999',
        name = 'Admin User';
    `;

    console.log('Default user created/updated successfully!');
    console.log('Email: admin@spendtrack.com');
    console.log('Password: admin123');
    console.log('');
    console.log('You can now login with these credentials or register a new account.');

  } catch (error) {
    console.error('Failed to create default user:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

createDefaultUser().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});