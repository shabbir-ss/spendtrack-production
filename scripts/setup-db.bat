@echo off
echo Setting up SpendTrack Database...
echo.

echo Step 1: Creating database and user...
echo Please enter your PostgreSQL superuser password when prompted.
psql -U postgres -f scripts\create-db.sql

echo.
echo Step 2: Setting up schema permissions...
echo Please enter the spendtrack_user password: spendtrack_password_2024
psql -U spendtrack_user -d spendtrack -c "GRANT ALL ON SCHEMA public TO spendtrack_user; CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

echo.
echo Database setup completed!
echo.
echo Next steps:
echo 1. Copy .env.example to .env
echo 2. Update DATABASE_URL in .env file
echo 3. Run: npm run db:setup
echo 4. Run: npm run dev
pause