"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, PlusCircle, Sliders, Calendar, FileText, History, Map, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { ThemeToggle } from "./ThemeToggle";
import { SchedulingSettings } from "./SchedulingSettings";
import { useUser } from "@/hooks/useUser";

const mainNav = [
  { name: "Calendar", href: "/", icon: Calendar },
  { name: "Planner", href: "/planner", icon: Map },
  { name: "Import Leads", href: "/leads/import", icon: PlusCircle },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Archive", href: "/archive", icon: History },
];

const settingsNav = [
  { name: "Email Templates", href: "/settings/email-copy", icon: FileText },
];

function Logo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-40 bg-[var(--border)]/10 animate-pulse rounded" />;
  }

  const logo = resolvedTheme === "dark" ? "/HuddleCard_Logo_Dark.svg" : "/HuddleCard_Logo_Light.svg";

  return (
    <Link href="/" className="block group">
      <img 
        src={logo} 
        alt="HuddleCard Logo" 
        className="h-9 w-auto transition-transform duration-500 group-hover:scale-105" 
      />
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);
  const { user, founder, signOut } = useUser();

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-[var(--surface)] to-[var(--background)] border-r border-[var(--border)] relative overflow-hidden">
      {/* Decorative Gradient Glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 blur-[100px] pointer-events-none" />

      <div className="flex h-20 items-center px-6 relative z-10">
        <Logo />
      </div>

      <nav className="flex-1 px-4 py-4 space-y-5 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainNav.map((item) => {
            const isActive = item.href === "/" 
              ? pathname === "/" 
              : item.href === "/leads"
                ? pathname === "/leads"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all",
                  isActive
                    ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm border border-[var(--border)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]/50"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-4 w-4 flex-shrink-0 transition-colors",
                    isActive ? "text-[var(--accent)]" : "text-[var(--muted)] group-hover:text-[var(--foreground)]"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Settings Navigation */}
        <div className="space-y-1">
          <p className="px-3 mb-2 text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/50">Settings</p>
          {settingsNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all",
                  isActive
                    ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm border border-[var(--border)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]/50"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-4 w-4 flex-shrink-0 transition-colors",
                    isActive ? "text-[var(--accent)]" : "text-[var(--muted)] group-hover:text-[var(--foreground)]"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Status Card */}
      {user && (
        <div className="mx-4 mb-3 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div 
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: founder.accentHex }}
              />
              <div className="min-w-0">
                <p className="text-xs font-black truncate text-[var(--foreground)] leading-tight">{founder.name}</p>
                <p className="text-[9px] font-semibold text-[var(--muted)] truncate">{user.email}</p>
              </div>
            </div>
            <span className={cn(
              "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0",
              founder.badgeBg, founder.badgeBorder, founder.badgeText
            )}>
              {founder.id === "martin" ? "ET" : "SAST"}
            </span>
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className="p-4 mt-auto flex items-center justify-between border-t border-[var(--border)]">
        <div className="flex items-center space-x-1">
          <ThemeToggle />
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-[var(--background)] rounded-full text-[var(--muted)] hover:text-[var(--foreground)] transition-all border border-transparent hover:border-[var(--border)]"
            title="Scheduling Settings"
          >
            <Sliders className="h-4 w-4" />
          </button>
        </div>

        {user && (
          <button
            onClick={signOut}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
            title="Sign out of Outreach Console"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>

      {showSettings && <SchedulingSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
