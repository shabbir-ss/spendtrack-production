# SpendTrack

A personal finance management application built with a full-stack architecture using React and Express. The application allows users to track income, expenses, assets, and bills with comprehensive categorization and reporting capabilities.

## 🚀 Quick Start

**Application is ready to run!**

```bash
npm run dev:win
```

Then open http://localhost:3000

> **Note**: Currently running with in-memory storage. For persistent data, follow the database setup instructions below.

## Features

- Track income and expenses with categories
- Manage assets and their current values
- Track bills and recurring payments
- Dashboard with financial summaries and visualizations
- Responsive design with light and dark themes

## Tech Stack

- **Frontend**: React, TypeScript, TanStack Query, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tools**: Vite, ESBuild

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- PostgreSQL (v12 or higher)

### Database Setup

1. Install PostgreSQL on your system if not already installed

2. **Option A: Automated Setup (Windows)**

   Run the provided batch script:

   ```bash
   scripts\setup-db.bat
   ```

   This will create the database, user, and set up permissions automatically.

3. **Option B: Manual Setup**

   Create the database and user manually:

   ```sql
   CREATE DATABASE spendtrack;
   CREATE USER spendtrack_user WITH ENCRYPTED PASSWORD 'spendtrack_password_2024';
   GRANT ALL PRIVILEGES ON DATABASE spendtrack TO spendtrack_user;
   ```

   Then connect to the database and set up permissions:

   ```sql
   \c spendtrack;
   GRANT ALL ON SCHEMA public TO spendtrack_user;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

4. **Option C: Using SQL Script**

   Execute the provided SQL script as postgres superuser:

   ```bash
   psql -U postgres -f scripts/setup-database.sql
   ```

### Application Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy the environment example file and configure it:

```bash
cp .env.example .env
```

4. Edit the `.env` file and update the `DATABASE_URL` with your PostgreSQL connection details:

```
DATABASE_URL=postgres://spendtrack_user:your_password@localhost:5432/spendtrack
```

5. Set up the database schema:

```bash
npm run db:setup
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5000

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Database Migration

Generate migration files:

```bash
npm run db:generate
```

Apply migrations:

```bash
npm run db:migrate
```

## Project Structure

- `client/`: React frontend application
  - `src/`: Source code with components, pages, hooks, and utilities
- `server/`: Express.js backend with RESTful API endpoints
- `shared/`: Common code shared between client and server (schemas, types)
- `scripts/`: Utility scripts for database setup and other tasks

## API Endpoints

- `/api/income` - CRUD operations for income entries
- `/api/expenses` - CRUD operations for expense entries
- `/api/assets` - CRUD operations for asset entries
- `/api/bills` - CRUD operations for bill entries
- `/api/summary` - Get financial summary statistics

## Troubleshooting

### Database Connection Issues

1. **Connection refused**: Make sure PostgreSQL is running

   ```bash
   # Windows (if installed as service)
   net start postgresql-x64-14

   # Or check if PostgreSQL is running
   pg_ctl status
   ```

2. **Authentication failed**: Verify your credentials in the `.env` file match the database user

3. **Database does not exist**: Run the database setup scripts first

4. **Permission denied**: Make sure the user has proper permissions on the database

### Application Issues

1. **Port already in use**: Change the PORT in `.env` file or stop the process using port 5000

2. **Module not found**: Run `npm install` to install dependencies

3. **Build errors**: Make sure you have the correct Node.js version (v16+)

### Development Tips

- Use `npm run dev` for development with hot reload
- Check the browser console for frontend errors
- Check the terminal for backend errors
- The application runs on http://localhost:5000 by default

## Database Scripts

- `scripts/setup-database.sql` - Complete database setup with sample data
- `scripts/create-db.sql` - Simple database and user creation
- `scripts/setup-db.bat` - Windows batch script for automated setup
- `scripts/init-db.ts` - Node.js script for running migrations

## License

MIT
