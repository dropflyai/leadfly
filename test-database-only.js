#!/usr/bin/env node

/**
 * Simple database connectivity test
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🗄️ Testing Database Connection');
console.log('==============================');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_KEY ? `${SUPABASE_KEY.substring(0, 20)}...` : 'NOT SET');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Environment variables not set properly');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testDatabase() {
  try {
    // Simple connectivity test
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database error:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

testDatabase().then(success => {
  process.exit(success ? 0 : 1);
});