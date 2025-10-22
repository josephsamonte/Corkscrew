"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

type SupabaseListenerProps = {
  serverAccessToken?: Session["access_token"];
};

export function SupabaseListener({
  serverAccessToken,
}: SupabaseListenerProps) {
  const router = useRouter();
  const supabase = getBrowserSupabaseClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== serverAccessToken) {
        router.refresh();
      }

      fetch("/auth/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, session }),
      }).catch(() => {
        // ignore network errors to keep UX smooth
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, serverAccessToken, router]);

  return null;
}
