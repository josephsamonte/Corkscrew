import { cookies } from "next/headers";
import {
  createRouteHandlerClient,
  createServerComponentClient,
  createServerActionClient,
  createMiddlewareClient,
} from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const getServerSupabaseClient = () =>
  createServerComponentClient<Database>({ cookies });

export const getRouteHandlerSupabaseClient =
  () => createRouteHandlerClient<Database>({ cookies });

export const getServerActionSupabaseClient = () =>
  createServerActionClient<Database>({ cookies });

export const getMiddlewareSupabaseClient = (params: {
  req: NextRequest;
  res: NextResponse;
}): SupabaseClient<Database> =>
  createMiddlewareClient<Database>(params);

export const createMiddlewareSupabaseResponse = () => NextResponse.next();
