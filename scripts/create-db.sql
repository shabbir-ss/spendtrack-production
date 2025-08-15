-- Simple database creation script
-- Run this as postgres superuser first

CREATE DATABASE spendtrack;
CREATE USER spendtrack_user WITH ENCRYPTED PASSWORD 'spendtrack_password_2024';
GRANT ALL PRIVILEGES ON DATABASE spendtrack TO spendtrack_user;

-- Connect to spendtrack database and run:
-- \c spendtrack;
-- GRANT ALL ON SCHEMA public TO spendtrack_user;
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";