import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecnieukedumcksxypcgj.supabase.co';
const supabaseAnonKey = 'sb_publishable_gFfdr6Dg1Qxb16Y7SKG_9w_6rPklfpr';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Scheduling Config
const config = {
  daysBetween: 3,
  dailyLimit: 10,
  activeDays: [1, 2, 3, 4, 5],
  warmupEnabled: false,
  warmupStart: 5,
  warmupIncrement: 2
};

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

class ScheduleTracker {
  constructor(cfg) {
    this.config = cfg;
    this.map = new Map();
  }

  getNextAvailableDate(startDate, minGapDays = 0) {
    const current = new Date(startDate);
    let gapsCounted = 0;
    while (gapsCounted < minGapDays) {
      current.setDate(current.getDate() + 1);
      if (this.config.activeDays.includes(current.getDay())) {
        gapsCounted++;
      }
    }

    let safety = 0;
    while (safety < 365) {
      const dateStr = formatDate(current);
      const count = this.map.get(dateStr) || 0;
      const isAllowedDay = this.config.activeDays.includes(current.getDay());
      const limit = this.config.dailyLimit;

      if (isAllowedDay && count < limit) {
        this.map.set(dateStr, count + 1);
        return new Date(current);
      }
      current.setDate(current.getDate() + 1);
      safety++;
    }
    return current;
  }
}

function getStage(pitch) {
  if (!pitch) return "INTRO";
  try {
    if (pitch.startsWith("{")) {
      const data = JSON.parse(pitch);
      if (data.stage) return data.stage;
      const match = data.pitch?.match(/^\[(INTRO|FEATURES|CURTAIN_CALL)\]/);
      return match ? match[1] : "INTRO";
    }
  } catch {}
  const match = pitch.match(/^\[(INTRO|FEATURES|CURTAIN_CALL)\]/);
  return match ? match[1] : "INTRO";
}

async function run() {
  console.log('Simulating pipeline rebalance on active database...');
  const { data: allLeads, error } = await supabase.from('leads').select('*').order('scheduled_date', { ascending: true });
  if (error) {
    console.error('Error fetching leads:', error.message);
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDate(today);

  const tracker = new ScheduleTracker(config);
  const groups = {};
  allLeads.forEach(l => {
    if (!groups[l.email]) groups[l.email] = [];
    groups[l.email].push(l);
  });

  const stageOrder = ["INTRO", "FEATURES", "CURTAIN_CALL"];
  const sortedGroups = Object.values(groups).sort((aLeads, bLeads) => {
    const aEarliest = Math.min(...aLeads.map(l => new Date(l.scheduled_date).getTime()));
    const bEarliest = Math.min(...bLeads.map(l => new Date(l.scheduled_date).getTime()));
    return aEarliest - bEarliest;
  });

  const updates = [];
  sortedGroups.forEach(personLeads => {
    personLeads.sort((a, b) => 
      stageOrder.indexOf(getStage(a.ai_pitch)) - stageOrder.indexOf(getStage(b.ai_pitch))
    );

    let lastDate = null;
    personLeads.forEach(lead => {
      if (lead.sent_at) {
        const sentDate = new Date(lead.sent_at.substring(0, 10));
        lastDate = isNaN(sentDate.getTime()) ? new Date(lead.scheduled_date) : sentDate;
      } else {
        const minGap = lastDate ? config.daysBetween : 0;
        const anchor = lastDate || today;
        const searchStart = anchor < today ? today : anchor;

        const newDate = tracker.getNextAvailableDate(searchStart, minGap);
        const newDateStr = formatDate(newDate);

        if (lead.scheduled_date !== newDateStr) {
          updates.push({ id: lead.id, old: lead.scheduled_date, new: newDateStr });
        }
        lastDate = newDate;
      }
    });
  });

  console.log(`Calculated ${updates.length} updates for ${allLeads.length} leads.`);
  console.log('Sample updates (first 5):', updates.slice(0, 5));

  // Count scheduled items per day
  const dailyCounts = {};
  for (const [date, count] of tracker.map.entries()) {
    dailyCounts[date] = count;
  }
  console.log('New Daily Distribution (starts from today):', Object.entries(dailyCounts).slice(0, 10));
}

run();
