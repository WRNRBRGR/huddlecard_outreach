"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, Mail, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please verify your credentials.");
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data.session) {
        // Redirect to target or dashboard
        router.push(returnTo);
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const setFounderPreset = (founderEmail: string) => {
    setEmail(founderEmail);
    setError(null);
  };

  const logo = mounted && resolvedTheme === "dark" ? "/HuddleCard_Logo_Dark.svg" : "/HuddleCard_Logo_Light.svg";

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#b8e44f]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Controls */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-3">
            {mounted ? (
              <img
                src={logo}
                alt="HuddleCard"
                className="h-10 w-auto mx-auto drop-shadow-md"
              />
            ) : (
              <div className="h-10 w-44 bg-[var(--border)]/20 animate-pulse rounded-lg mx-auto" />
            )}
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[10px] font-black uppercase tracking-widest text-[var(--accent)] mb-2">
            <ShieldCheck className="h-3 w-3" />
            <span>Internal Outreach Console</span>
          </div>
          <p className="text-xs text-[var(--muted)] font-medium">
            Authorized founder access only. Enter your credentials to continue.
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel border-[var(--border)] shadow-2xl p-8 space-y-6 relative">
          {/* Quick Founder Selection */}
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">
              Quick Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFounderPreset("werner@huddlecard.com")}
                className={cn(
                  "flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border text-xs font-bold transition-all",
                  email.toLowerCase().includes("werner")
                    ? "bg-[#6d40e3]/15 border-[#6d40e3] text-[var(--foreground)] ring-1 ring-[#6d40e3]/40 shadow-sm"
                    : "bg-[var(--background)]/60 border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <div className="w-2 h-2 rounded-full bg-[#6d40e3]" />
                <span>Werner</span>
              </button>

              <button
                type="button"
                onClick={() => setFounderPreset("martin@huddlecard.com")}
                className={cn(
                  "flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border text-xs font-bold transition-all",
                  email.toLowerCase().includes("martin")
                    ? "bg-[#b8e44f]/15 border-[#b8e44f] text-[var(--foreground)] ring-1 ring-[#b8e44f]/40 shadow-sm"
                    : "bg-[var(--background)]/60 border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <div className="w-2 h-2 rounded-full bg-[#b8e44f]" />
                <span>Martin</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-red-950/25 border border-red-500/30 text-red-300 text-xs animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                <input
                  type="email"
                  required
                  placeholder="founder@huddlecard.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full pl-10 text-sm"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full pl-10 pr-10 text-sm"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2 py-3 mt-6 text-xs font-black uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footnote */}
          <div className="pt-2 border-t border-[var(--border)] text-center">
            <p className="text-[10px] text-[var(--muted)]">
              Accounts and passwords are created in the{" "}
              <a
                href="https://supabase.com/dashboard/project/ecnieukedumcksxypcgj/auth/users"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline font-bold"
              >
                Supabase Auth Dashboard
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
