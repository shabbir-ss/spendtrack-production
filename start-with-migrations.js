#!/usr/bin/env node

// Production startup script that runs migrations before starting the server
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
    if (!process.env.DATABASE_URL) {
        console.log('⚠️  DATABASE_URL not available - starting server without migrations');
        console.log('   Server will use in-memory storage until database is connected');
        return false;
    }

    try {
        console.log('🔄 Running database migrations...');

        const client = postgres(process.env.DATABASE_URL);
        const db = drizzle(client);

        await migrate(db, { migrationsFolder: join(__dirname, 'migrations') });

        console.log('✅ Database migrations completed successfully');

        await client.end();
        return true;
    } catch (error) {
        console.error('❌ Database migration failed:', error);
        console.log('⚠️  Starting server anyway - will use fallback storage');
        return false;
    }
}

async function startServer() {
    console.log('🚀 Starting SpendTrack server...');

    // Start the main server
    const serverProcess = spawn('node', [join(__dirname, 'dist', 'index.js')], {
        stdio: 'inherit',
        env: process.env
    });

    serverProcess.on('error', (error) => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });

    serverProcess.on('exit', (code) => {
        console.log(`Server process exited with code ${code}`);
        process.exit(code);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
        console.log('Received SIGTERM, shutting down gracefully...');
        serverProcess.kill('SIGTERM');
    });

    process.on('SIGINT', () => {
        console.log('Received SIGINT, shutting down gracefully...');
        serverProcess.kill('SIGINT');
    });
}

async function main() {
    console.log('🎯 SpendTrack Production Startup');
    console.log('================================');

    // Run migrations first
    await runMigrations();

    // Then start the server
    await startServer();
}

main().catch((error) => {
    console.error('Startup failed:', error);
    process.exit(1);
});