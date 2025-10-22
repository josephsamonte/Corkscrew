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

export const getServerSupabaseClient = async () => {
  const cookieStore = await cookies();
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
};

export const getRouteHandlerSupabaseClient = async () => {
  const cookieStore = await cookies();
  return createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });
};

export const getServerActionSupabaseClient = async () => {
  const cookieStore = await cookies();
  return createServerActionClient<Database>({
    cookies: () => cookieStore,
  });
};

export const getMiddlewareSupabaseClient = (params: {
  req: NextRequest;
  res: NextResponse;
}): SupabaseClient<Database> =>
  createMiddlewareClient<Database>(params);

export const createMiddlewareSupabaseResponse = () => NextResponse.next();
