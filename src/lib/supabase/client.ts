"use client";

import { useMemo } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let client: SupabaseClient<Database> | null = null;

export const getBrowserSupabaseClient = () => {
  if (!client) {
    client = createClientComponentClient<Database>();
  }
  return client;
};

export const useSupabaseClient = (): SupabaseClient<Database> =>
  useMemo(() => getBrowserSupabaseClient(), []);
