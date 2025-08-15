import 'dotenv/config';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;

async function verifyDatabase() {
  const sql = postgres(connectionString, { max: 1 });

  try {
    console.log('🔍 Verifying database structure...\n');

    // Check users table
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`✅ Users table: ${users[0].count} users found`);

    // Check if user_id columns exist in all tables
    const tables = ['income', 'expenses', 'assets', 'bills'];
    
    for (const table of tables) {
      const columns = await sql`
        SELECT column_name, is_nullable, data_type 
        FROM information_schema.columns 
        WHERE table_name = ${table} AND column_name = 'user_id'
      `;
      
      if (columns.length > 0) {
        console.log(`✅ ${table} table: user_id column exists (${columns[0].is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'})`);
      } else {
        console.log(`❌ ${table} table: user_id column missing`);
      }
    }

    // Check foreign key constraints
    console.log('\n🔗 Foreign key constraints:');
    const constraints = await sql`
      SELECT 
        tc.table_name, 
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND kcu.column_name = 'user_id';
    `;

    constraints.forEach(constraint => {
      console.log(`✅ ${constraint.table_name}.${constraint.column_name} → ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
    });

    // Show sample user data
    console.log('\n👤 Sample user data:');
    const sampleUsers = await sql`SELECT id, email, name, email_notifications, sms_notifications FROM users LIMIT 3`;
    sampleUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Email: ${user.email_notifications}, SMS: ${user.sms_notifications}`);
    });

    console.log('\n🎉 Database verification completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Email: admin@spendtrack.com');
    console.log('   Password: admin123');
    console.log('\n🌐 Application URL: http://localhost:3000');

  } catch (error) {
    console.error('❌ Database verification failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

verifyDatabase().catch((error) => {
  console.error('Verification script failed:', error);
  process.exit(1);
});