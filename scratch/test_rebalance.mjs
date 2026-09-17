import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecnieukedumcksxypcgj.supabase.co';
const supabaseAnonKey = 'sb_publishable_gFfdr6Dg1Qxb16Y7SKG_9w_6rPklfpr';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing Pipeline Overdue Detection...');
  const todayStr = new Date().toISOString().split('T')[0];
  console.log('Today:', todayStr);

  const { data: leads, error } = await supabase.from('leads').select('*');
  if (error) {
    console.error('Error fetching leads:', error.message);
    return;
  }

  console.log(`Total leads in DB: ${leads.length}`);
  const overdue = leads.filter(l => !l.sent_at && l.scheduled_date < todayStr);
  const sent = leads.filter(l => l.sent_at);
  const pendingFuture = leads.filter(l => !l.sent_at && l.scheduled_date >= todayStr);

  console.log(`- Already sent: ${sent.length}`);
  console.log(`- Pending (today or future): ${pendingFuture.length}`);
  console.log(`- Overdue (unsent before today): ${overdue.length}`);

  if (overdue.length > 0) {
    console.log('Overdue leads found:', overdue.map(l => ({ name: l.name, scheduled_date: l.scheduled_date })));
  } else {
    console.log('No overdue leads in database currently.');
  }
}

test();
