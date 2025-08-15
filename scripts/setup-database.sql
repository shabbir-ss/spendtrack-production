-- SpendTrack Database Setup Script
-- This script creates the database, user, and initial schema for SpendTrack application

-- Create database (run this as postgres superuser)
-- Note: You may need to run this part separately if you don't have superuser privileges
CREATE DATABASE spendtrack;

-- Create user with password
CREATE USER spendtrack_user WITH ENCRYPTED PASSWORD 'spendtrack_password_2024';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE spendtrack TO spendtrack_user;

-- Connect to the spendtrack database
\c spendtrack;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO spendtrack_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO spendtrack_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO spendtrack_user;

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (these will be created by Drizzle migrations, but included here for reference)

-- Income table
CREATE TABLE IF NOT EXISTS income (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    purchase_price DECIMAL(10, 2) NOT NULL,
    current_value DECIMAL(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    recurring_type TEXT NOT NULL, -- monthly, quarterly, yearly, one-time
    status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, overdue
    last_paid_date DATE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_income_date ON income(date);
CREATE INDEX IF NOT EXISTS idx_income_category ON income(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_category ON bills(category);

-- Insert sample data (optional)
-- Uncomment the following lines if you want to start with sample data

/*
-- Sample income data
INSERT INTO income (amount, description, category, date) VALUES
    (5000.00, 'Monthly Salary', 'Salary', '2024-01-01'),
    (500.00, 'Freelance Project', 'Freelance', '2024-01-15'),
    (100.00, 'Investment Dividend', 'Investment', '2024-01-20');

-- Sample expense data
INSERT INTO expenses (amount, description, category, date) VALUES
    (1200.00, 'Monthly Rent', 'Housing', '2024-01-01'),
    (300.00, 'Groceries', 'Food', '2024-01-05'),
    (50.00, 'Gas', 'Transportation', '2024-01-10'),
    (80.00, 'Internet Bill', 'Utilities', '2024-01-15');

-- Sample asset data
INSERT INTO assets (name, description, category, purchase_price, current_value, purchase_date) VALUES
    ('MacBook Pro', '2023 MacBook Pro 16-inch', 'Electronics', 2500.00, 2200.00, '2023-06-15'),
    ('Toyota Camry', '2020 Toyota Camry', 'Vehicle', 25000.00, 22000.00, '2020-03-10'),
    ('Investment Portfolio', 'Stock and bond investments', 'Investment', 10000.00, 12500.00, '2023-01-01');

-- Sample bill data
INSERT INTO bills (name, description, category, amount, due_date, recurring_type, status) VALUES
    ('Rent', 'Monthly apartment rent', 'Housing', 1200.00, '2024-02-01', 'monthly', 'pending'),
    ('Electric Bill', 'Monthly electricity bill', 'Utilities', 120.00, '2024-02-15', 'monthly', 'pending'),
    ('Car Insurance', 'Semi-annual car insurance', 'Insurance', 600.00, '2024-03-01', 'quarterly', 'pending'),
    ('Netflix Subscription', 'Monthly streaming service', 'Entertainment', 15.99, '2024-02-10', 'monthly', 'paid');
*/

-- Grant final permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO spendtrack_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO spendtrack_user;

-- Display success message
SELECT 'SpendTrack database setup completed successfully!' as message;