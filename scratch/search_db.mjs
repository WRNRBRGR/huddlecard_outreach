import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecnieukedumcksxypcgj.supabase.co';
const supabaseAnonKey = 'sb_publishable_gFfdr6Dg1Qxb16Y7SKG_9w_6rPklfpr';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Searching database for Trickery or Louis...');
  
  // 1. Search leads
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('*');
  
  if (leadsError) {
    console.error('Error fetching leads:', leadsError.message);
  } else {
    console.log(`Fetched ${leads.length} leads.`);
    const matches = leads.filter(l => 
      JSON.stringify(l).toLowerCase().includes('trickery') ||
      JSON.stringify(l).toLowerCase().includes('louis')
    );
    if (matches.length > 0) {
      console.log('Found matching leads:', JSON.stringify(matches, null, 2));
    } else {
      console.log('No matching leads found.');
    }
  }

  // 2. Search showreels
  const { data: showreels, error: reelsError } = await supabase
    .from('showreels')
    .select('*');
  
  if (reelsError) {
    console.error('Error fetching showreels:', reelsError.message);
  } else {
    console.log(`Fetched ${showreels.length} showreels.`);
    const matches = showreels.filter(r => 
      JSON.stringify(r).toLowerCase().includes('trickery') ||
      JSON.stringify(r).toLowerCase().includes('louis')
    );
    if (matches.length > 0) {
      console.log('Found matching showreels:', JSON.stringify(matches, null, 2));
    } else {
      console.log('No matching showreels found.');
    }
  }
}

run();
