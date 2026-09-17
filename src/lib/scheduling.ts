import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Database } from "@/types/database";

export type Lead = Database["public"]["Tables"]["leads"]["Row"];

export interface SchedulingConfig {
  daysBetween: number;
  dailyLimit: number;
  activeDays: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  warmupEnabled: boolean;
  warmupStart: number;
  warmupIncrement: number;
}

export function getDefaultConfig(): SchedulingConfig {
  return { 
    daysBetween: 3, 
    dailyLimit: 10, 
    activeDays: [1, 2, 3, 4, 5],
    warmupEnabled: false,
    warmupStart: 5,
    warmupIncrement: 2
  }; // Default: Mon, Tue, Wed, Thu, Fri
}

/**
 * Hook to safely access scheduling config with hydration awareness
 */
export function useSchedulingConfig() {
  const [config, setConfig] = useState<SchedulingConfig>(getDefaultConfig());
  
  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem("scheduling_config");
      if (saved) {
        try {
          setConfig(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse scheduling config", e);
        }
      }
    };

    load();
    window.addEventListener("scheduling_config_updated", load);
    return () => window.removeEventListener("scheduling_config_updated", load);
  }, []);

  return config;
}

/**
 * Helper class to track daily limits while scheduling items across days
 */
export class ScheduleTracker {
  private map: Map<string, number> = new Map();
  private config: SchedulingConfig;
  private startDate: string | null = null;

  constructor(config: SchedulingConfig, existingCounts?: Map<string, number>) {
    this.config = config;
    if (existingCounts) {
      this.map = new Map(existingCounts);
    }
  }

  setStartDate(date: Date) {
    this.startDate = format(date, "yyyy-MM-dd");
  }

  getLimitForDate(date: Date): number {
    if (!this.config.warmupEnabled || !this.startDate) return this.config.dailyLimit;
    
    // Calculate days since start
    const start = new Date(this.startDate);
    const diffTime = date.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return this.config.dailyLimit;
    
    const dynamicLimit = this.config.warmupStart + (diffDays * this.config.warmupIncrement);
    return Math.min(dynamicLimit, this.config.dailyLimit);
  }

  getNextAvailableDate(startDate: Date, minGapDays: number = 0): Date {
    const current = new Date(startDate);
    
    // 1. Handle the gap by counting only active days
    let gapsCounted = 0;
    while (gapsCounted < minGapDays) {
      current.setDate(current.getDate() + 1);
      if (this.config.activeDays.includes(current.getDay())) {
        gapsCounted++;
      }
    }

    // 2. Find the first available active day that is under the limit
    let safety = 0;
    while (safety < 365) { // Prevent infinite loops
      const dateStr = format(current, "yyyy-MM-dd");
      const count = this.map.get(dateStr) || 0;
      
      const activeDays = this.config.activeDays.map(Number);
      const isAllowedDay = activeDays.includes(current.getDay());
      const limit = this.getLimitForDate(current);
      
      if (isAllowedDay && count < limit) {
        this.map.set(dateStr, count + 1);
        return new Date(current);
      }
      current.setDate(current.getDate() + 1);
      safety++;
    }
    return current; // Fallback
  }

  addCount(dateStr: string) {
    this.map.set(dateStr, (this.map.get(dateStr) || 0) + 1);
  }

  getDailyCounts(): Map<string, number> {
    return new Map(this.map);
  }
}

/**
 * Helper to parse stage from ai_pitch
 */
export function getStage(pitch: string | null): "INTRO" | "FEATURES" | "CURTAIN_CALL" {
  if (!pitch) return "INTRO";
  try {
    if (pitch.startsWith("{")) {
      const data = JSON.parse(pitch);
      if (data.stage) return data.stage;
      const match = data.pitch?.match(/^\[(INTRO|FEATURES|CURTAIN_CALL)\]/);
      return (match ? match[1] : "INTRO") as any;
    }
  } catch {}
  const match = pitch.match(/^\[(INTRO|FEATURES|CURTAIN_CALL)\]/);
  return (match ? match[1] : "INTRO") as any;
}

/**
 * Checks how many unsent leads exist with scheduled_date < today
 */
export async function checkOverdueLeads(supabase: any): Promise<number> {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const { count, error } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .lt("scheduled_date", todayStr)
    .is("sent_at", null);

  if (error) {
    console.error("Error checking overdue leads:", error);
    return 0;
  }
  return count || 0;
}

export interface RebalanceResult {
  updated: number;
  overdueCount: number;
  success: boolean;
  error?: string;
}

/**
 * Rebalances the entire outreach pipeline:
 * - Collects any unsent leads from the past (regardless of whether it's 1 day or 2 months ago)
 * - Restarts the schedule anchor from today onwards
 * - Packs leads into active weekdays respecting dailyLimit
 * - Keeps sequence order (INTRO -> FEATURES -> CURTAIN_CALL) and maintains required gap between touches
 * - Locks already-sent emails to their historical sent date
 */
export async function rebalanceOutreachSchedule(
  supabase: any,
  config: SchedulingConfig
): Promise<RebalanceResult> {
  try {
    // 1. Fetch all leads from the database
    const { data: rawLeads, error: fetchError } = await supabase
      .from("leads")
      .select("*")
      .order("scheduled_date", { ascending: true });

    if (fetchError) throw fetchError;
    const allLeads = (rawLeads || []) as Lead[];
    if (allLeads.length === 0) {
      return { updated: 0, overdueCount: 0, success: true };
    }

    // 2. Identify today (00:00:00 local time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = format(today, "yyyy-MM-dd");

    // Count how many unsent leads are overdue
    const overdueLeads = allLeads.filter((l: Lead) => !l.sent_at && l.scheduled_date < todayStr);
    const overdueCount = overdueLeads.length;

    // 3. Initialize Schedule Tracker
    const tracker = new ScheduleTracker(config);
    tracker.setStartDate(today);

    // Register slots already consumed by leads that were sent today or in the future
    allLeads.filter((l: Lead) => l.sent_at).forEach((l: Lead) => {
      if (l.scheduled_date >= todayStr) {
        tracker.addCount(l.scheduled_date);
      }
    });

    // 4. Group all leads by person (email) to maintain sequence integrity
    const groups: Record<string, Lead[]> = {};
    allLeads.forEach((l: Lead) => {
      if (!groups[l.email]) groups[l.email] = [];
      groups[l.email].push(l);
    });

    // Sort contacts by their earliest touch date so in-progress sequences are paced first
    const stageOrder = ["INTRO", "FEATURES", "CURTAIN_CALL"];
    const sortedGroups: Lead[][] = Object.values(groups).sort((aLeads: Lead[], bLeads: Lead[]) => {
      const aEarliest = Math.min(...aLeads.map((l: Lead) => new Date(l.scheduled_date).getTime()));
      const bEarliest = Math.min(...bLeads.map((l: Lead) => new Date(l.scheduled_date).getTime()));
      return aEarliest - bEarliest;
    });

    const updates: { id: string; scheduled_date: string }[] = [];

    // 5. Reschedule each contact sequence
    sortedGroups.forEach((personLeads: Lead[]) => {
      // Sort touches in sequence order (INTRO -> FEATURES -> CURTAIN_CALL)
      personLeads.sort((a: Lead, b: Lead) => 
        stageOrder.indexOf(getStage(a.ai_pitch)) - stageOrder.indexOf(getStage(b.ai_pitch))
      );

      let lastDate: Date | null = null;

      personLeads.forEach((lead: Lead) => {
        if (lead.sent_at) {
          // Already sent: anchor remains locked to historical sent date
          const sentDate = new Date(lead.sent_at.substring(0, 10));
          lastDate = isNaN(sentDate.getTime()) ? new Date(lead.scheduled_date) : sentDate;
        } else {
          // Unsent touch:
          // If a previous touch exists, we must space at least `daysBetween` active days after it
          const minGap = lastDate ? config.daysBetween : 0;
          const anchor = lastDate || today;

          // Never schedule in the past
          const searchStart = anchor < today ? today : anchor;

          const newDate = tracker.getNextAvailableDate(searchStart, minGap);
          const newDateStr = format(newDate, "yyyy-MM-dd");

          if (lead.scheduled_date !== newDateStr) {
            updates.push({ id: lead.id, scheduled_date: newDateStr });
          }

          lastDate = newDate;
        }
      });
    });

    // 6. Batch update modified dates in Supabase
    if (updates.length > 0) {
      const chunkSize = 25;
      for (let i = 0; i < updates.length; i += chunkSize) {
        const chunk = updates.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map(u => 
            supabase.from("leads").update({ scheduled_date: u.scheduled_date }).eq("id", u.id)
          )
        );
      }
    }

    // 7. Notify listeners across the application
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("outreach_schedule_rebalanced", {
        detail: { updated: updates.length, overdueCount }
      }));
    }

    return { updated: updates.length, overdueCount, success: true };
  } catch (error: any) {
    console.error("Rebalance schedule failed:", error);
    return { updated: 0, overdueCount: 0, success: false, error: error?.message || "Failed to rebalance schedule" };
  }
}

/**
 * Calculates the next valid mailing date based on active days.
 */
export function getNextValidDate(startDate: Date, activeDays: number[]): Date {
  const date = new Date(startDate);
  let attempts = 0;
  
  while (!activeDays.includes(date.getDay()) && attempts < 14) {
    date.setDate(date.getDate() + 1);
    attempts++;
  }
  
  return date;
}

/**
 * Adds an offset to a date and then finds the next valid date.
 */
export function getOffsetValidDate(startDate: Date, days: number, activeDays: number[]): Date {
  const current = new Date(startDate);
  let gapsCounted = 0;
  
  while (gapsCounted < days) {
    current.setDate(current.getDate() + 1);
    if (activeDays.includes(current.getDay())) {
      gapsCounted++;
    }
  }
  
  return getNextValidDate(current, activeDays);
}
