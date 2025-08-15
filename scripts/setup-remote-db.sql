-- Setup script for remote PostgreSQL database
-- Run this on the remote database to enable required extensions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Alternative UUID extension if the above doesn't work
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Verify extensions are installed
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- Test UUID generation
SELECT gen_random_uuid() as test_uuid;