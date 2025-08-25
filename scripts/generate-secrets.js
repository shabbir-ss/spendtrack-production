#!/usr/bin/env node

import crypto from 'crypto';

console.log('🔐 SpendTrack Deployment Secrets Generator\n');

console.log('Copy these values to your deployment environment variables:\n');

console.log('SESSION_SECRET=' + crypto.randomBytes(32).toString('hex'));
console.log('JWT_SECRET=' + crypto.randomBytes(32).toString('hex'));

console.log('\n✅ These secrets are cryptographically secure and ready for production use.');
console.log('⚠️  Keep these secrets safe and never commit them to version control!');