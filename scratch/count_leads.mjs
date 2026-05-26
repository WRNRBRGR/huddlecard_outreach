import { createClient } from '@supabase/supabase-js';

const oldUrl = 'https://vmhwdhnialabfhnyubvd.supabase.co';
const oldKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaHdkaG5pYWxhYmZobnl1YnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNjI0NDgsImV4cCI6MjA5MjkzODQ0OH0.yAry5BEQR4xHKV_kIaXoZ6NoB6hCOVU2lCl2I_zPOKY';

const newUrl = 'https://ecnieukedumcksxypcgj.supabase.co';
const newKey = 'sb_publishable_gFfdr6Dg1Qxb16Y7SKG_9w_6rPklfpr';

console.log('Comparing Lead Counts...');

async function run() {
  const oldSupabase = createClient(oldUrl, oldKey);
  const newSupabase = createClient(newUrl, newKey);

  // Check Old
  const { count: oldCount, error: oldError } = await oldSupabase
    .from('leads')
    .select('*', { count: 'exact', head: true });
  
  if (oldError) {
    console.error('Error reading old database:', oldError.message);
  } else {
    console.log(`✅ OLD Database (${oldUrl}) leads count:`, oldCount);
  }

  // Check New
  const { count: newCount, error: newError } = await newSupabase
    .from('leads')
    .select('*', { count: 'exact', head: true });
  
  if (newError) {
    console.error('Error reading new database:', newError.message);
  } else {
    console.log(`✅ NEW Database (${newUrl}) leads count:`, newCount);
  }
}

run();
