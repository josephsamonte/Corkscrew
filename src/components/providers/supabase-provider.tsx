"use client";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import type { Session } from "@supabase/supabase-js";
import type { PropsWithChildren } from "react";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";

type SupabaseProviderProps = PropsWithChildren<{
  initialSession: Session | null;
}>;

export function SupabaseProvider({
  children,
  initialSession,
}: SupabaseProviderProps) {
  const [supabaseClient] = useState(() =>
    createClientComponentClient<Database>(),
  );

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={initialSession}
    >
      {children}
    </SessionContextProvider>
  );
}
