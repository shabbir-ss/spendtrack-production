import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { bills } from '../shared/schema';
import { randomUUID } from 'crypto';

async function addTestBill() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    const client = postgres(process.env.DATABASE_URL);
    const db = drizzle(client);

    // Create a bill due tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Create a bill due today (overdue)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Create an overdue bill (yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const testBills = [
      {
        id: randomUUID(),
        name: 'Electricity Bill',
        description: 'Monthly electricity bill',
        category: 'electricity',
        amount: '150.00',
        dueDate: tomorrowStr,
        recurringType: 'monthly',
        status: 'pending',
        lastPaidDate: null,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Internet Bill',
        description: 'Monthly internet subscription',
        category: 'internet',
        amount: '75.00',
        dueDate: todayStr,
        recurringType: 'monthly',
        status: 'pending',
        lastPaidDate: null,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Water Bill',
        description: 'Monthly water bill - OVERDUE',
        category: 'water',
        amount: '45.00',
        dueDate: yesterdayStr,
        recurringType: 'monthly',
        status: 'pending',
        lastPaidDate: null,
        createdAt: new Date(),
      }
    ];

    console.log('Adding test bills...');
    for (const bill of testBills) {
      await db.insert(bills).values(bill);
      console.log(`Added: ${bill.name} - Due: ${bill.dueDate}`);
    }

    console.log('Test bills added successfully!');
    console.log('You should now see notifications in the header bell icon.');
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('Failed to add test bills:', error);
    process.exit(1);
  }
}

addTestBill();