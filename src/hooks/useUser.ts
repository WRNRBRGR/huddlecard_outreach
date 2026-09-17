"use client";

import { useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export interface FounderProfile {
  id: "werner" | "martin" | "other";
  name: string;
  partnerColor: "indigo" | "rose";
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  accentHex: string;
}

export function detectFounder(email: string | undefined): FounderProfile {
  const normalized = (email || "").toLowerCase();

  if (normalized.includes("martin")) {
    return {
      id: "martin",
      name: "Martin",
      partnerColor: "rose",
      badgeBg: "bg-[#b8e44f]/15",
      badgeBorder: "border-[#b8e44f]/40",
      badgeText: "text-[#88b02e] dark:text-[#b8e44f]",
      accentHex: "#b8e44f",
    };
  }

  // Default to Werner
  return {
    id: "werner",
    name: "Werner Burger",
    partnerColor: "indigo",
    badgeBg: "bg-[#6d40e3]/15",
    badgeBorder: "border-[#6d40e3]/40",
    badgeText: "text-[#6d40e3] dark:text-[#a379f7]",
    accentHex: "#6d40e3",
  };
}

export function useUser() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
  }, [router]);

  const founder = detectFounder(user?.email);

  return {
    user,
    loading,
    founder,
    partnerColor: founder.partnerColor,
    signOut,
  };
}
