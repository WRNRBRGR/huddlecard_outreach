"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { format, addDays, startOfDay, startOfWeek } from "date-fns";
import { Loader2, RefreshCw, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSchedulingConfig, checkOverdueLeads, rebalanceOutreachSchedule } from "@/lib/scheduling";

interface DayStats {
  total: number;
  sent: number;
  unsent: number;
}

export default function Dashboard() {
  const [dayStats, setDayStats] = useState<Record<string, DayStats>>({});
  const [loading, setLoading] = useState(true);
  const [rebalancing, setRebalancing] = useState(false);
  const [rolloverNotice, setRolloverNotice] = useState<string | null>(null);

  const config = useSchedulingConfig();
  const limit = config.dailyLimit;
  const today = format(new Date(), "yyyy-MM-dd");

  const fetchCounts = useCallback(async () => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const dateStr = format(start, "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("leads")
      .select("scheduled_date, sent_at")
      .gte("scheduled_date", dateStr);

    if (error) {
      console.error("Error fetching lead counts:", error);
      return;
    }

    const map: Record<string, DayStats> = {};
    data?.forEach((lead) => {
      const d = lead.scheduled_date;
      if (!map[d]) {
        map[d] = { total: 0, sent: 0, unsent: 0 };
      }
      map[d].total++;
      if (lead.sent_at) {
        map[d].sent++;
      } else {
        map[d].unsent++;
      }
    });

    setDayStats(map);
    setLoading(false);
  }, []);

  // Check for overdue leads and automatically rebalance on load
  const checkAndAutoRebalance = useCallback(async () => {
    try {
      const overdue = await checkOverdueLeads(supabase);
      if (overdue > 0) {
        setRebalancing(true);
        const res = await rebalanceOutreachSchedule(supabase, config);
        if (res.success && res.overdueCount > 0) {
          setRolloverNotice(
            `Auto-Paced: Rolled over ${res.overdueCount} overdue email${res.overdueCount > 1 ? "s" : ""} into your active queue.`
          );
          setTimeout(() => setRolloverNotice(null), 6000);
        }
        setRebalancing(false);
      }
    } catch (e) {
      console.error("Auto-rebalance error:", e);
      setRebalancing(false);
    }
    await fetchCounts();
  }, [config, fetchCounts]);

  useEffect(() => {
    checkAndAutoRebalance();

    const handleRebalanced = () => {
      fetchCounts();
    };

    window.addEventListener("outreach_schedule_rebalanced", handleRebalanced);
    return () => {
      window.removeEventListener("outreach_schedule_rebalanced", handleRebalanced);
    };
  }, [checkAndAutoRebalance, fetchCounts]);

  const handleManualRebalance = async () => {
    setRebalancing(true);
    setRolloverNotice(null);
    try {
      const res = await rebalanceOutreachSchedule(supabase, config);
      if (res.success) {
        if (res.updated > 0) {
          setRolloverNotice(
            `Schedule optimized! Recalibrated ${res.updated} email${res.updated > 1 ? "s" : ""} across your active days.`
          );
        } else {
          setRolloverNotice("Your pipeline is already fully optimized and up to date.");
        }
        setTimeout(() => setRolloverNotice(null), 5000);
      }
      await fetchCounts();
    } catch (e) {
      console.error("Manual rebalance error:", e);
    } finally {
      setRebalancing(false);
    }
  };

  // Align to Monday of current week and show 35 days (5 full weeks)
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 35 }, (_, i) => addDays(startOfDay(startDate), i));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Dynamic Rollover Notification Toast */}
      {rolloverNotice && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl border bg-indigo-950/90 text-indigo-200 border-indigo-500/40 shadow-2xl backdrop-blur-sm animate-in slide-in-from-right-4 fade-in duration-300">
          <Sparkles className="h-4 w-4 text-[var(--accent)] shrink-0 animate-pulse" />
          <span className="text-xs font-bold">{rolloverNotice}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Outreach Calendar</h1>
          <p className="mt-2 text-[var(--muted)]">Next 30 days of studio outreach pacing.</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Manual Rebalance / Rollover Button */}
          <button
            onClick={handleManualRebalance}
            disabled={rebalancing}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--foreground)]/[0.05] border border-[var(--border)] text-xs font-bold transition-all disabled:opacity-50 shadow-sm hover:border-[var(--accent)]/40"
            title="Recalculate pipeline and roll over any missed emails starting from today"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-[var(--accent)]", rebalancing && "animate-spin")} />
            <span>{rebalancing ? "Optimizing..." : "Optimize Schedule"}</span>
          </button>

          {/* Legend */}
          <div className="hidden sm:flex items-center space-x-4 bg-[var(--surface)] px-4 py-2 rounded-lg border border-[var(--border)]">
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[var(--border)]"></span>
              <span className="text-[var(--muted)]">Empty</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-40"></span>
              <span className="text-[var(--muted)]">Partial</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
              <span className="text-[var(--muted)]">Full ({limit})</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[var(--muted)]/20"></span>
              <span className="text-[var(--muted)]">Off</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Headers for 7-column layout */}
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="hidden lg:flex items-center justify-center pb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]/50">{d}</span>
            </div>
          ))}

          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const stats = dayStats[dateStr] || { total: 0, sent: 0, unsent: 0 };
            const count = stats.total;
            const isToday = dateStr === today;
            const isPast = dateStr < today;
            const isFull = count >= limit;
            const dayOfWeek = day.getDay(); // 0 = Sun, 6 = Sat
            const isActiveDay = config.activeDays.includes(dayOfWeek);

            // Can click if it's today or in the future with leads, OR past days with records
            const canClick = count > 0;
            const Component = canClick ? Link : ("div" as any);

            return (
              <Component
                href={canClick ? `/dashboard/${dateStr}` : undefined}
                key={dateStr}
                className={cn(
                  "glass-panel group relative flex flex-col items-center justify-center h-28 transition-all",
                  // Clickable vs Non-clickable
                  canClick
                    ? "hover:border-[var(--accent)]/40 cursor-pointer shadow-lg hover:shadow-[var(--accent)]/5"
                    : "cursor-default",
                  // Past days
                  isPast && "opacity-40 grayscale-[40%]",
                  // Inactive / off days
                  !isPast && !isActiveDay && "opacity-40 border-dashed",
                  // Active days with leads
                  !isPast && isActiveDay && count > 0 && "border-[var(--muted)]/30",
                  // Active days without leads
                  !isPast && isActiveDay && count === 0 && "border-[var(--border)]",
                  // Full days
                  !isPast && isFull && "border-[var(--accent)]/50 bg-[var(--accent)]/[0.03]",
                  // Today
                  isToday && "ring-2 ring-[var(--accent)]/60 bg-[var(--accent)]/[0.04]"
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest mb-1",
                    isToday ? "text-[var(--accent)]" : "text-[var(--muted)]"
                  )}
                >
                  {format(day, "EEE")}
                </span>
                <span className="text-xl font-black">{format(day, "d")}</span>

                {!isActiveDay && !isPast && count === 0 ? (
                  <span className="text-[8px] font-bold text-[var(--muted)]/50 mt-2 uppercase tracking-widest">
                    Off
                  </span>
                ) : (
                  <div className="mt-3 flex items-center space-x-1.5">
                    <div className="h-1 w-10 bg-[var(--border)] rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-1000",
                          isPast && stats.sent === stats.total && stats.total > 0
                            ? "bg-green-500"
                            : isFull
                            ? "bg-[var(--accent)]"
                            : "bg-[var(--accent)]/40"
                        )}
                        style={{ width: `${Math.min(100, (count / limit) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[8px] font-bold text-[var(--muted)]">
                      {isPast ? `${stats.sent}/${count}` : `${count}/${limit}`}
                    </span>
                  </div>
                )}

                {/* Status Indicators */}
                {isToday && (
                  <div className="absolute top-2 right-2">
                    <div className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse shadow-sm" />
                  </div>
                )}

                {/* Overdue indicator for past days if unsent items remain */}
                {isPast && stats.unsent > 0 && (
                  <div className="absolute top-2 right-2" title={`${stats.unsent} unsent (overdue)`}>
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                  </div>
                )}
              </Component>
            );
          })}
        </div>
      )}
    </div>
  );
}
