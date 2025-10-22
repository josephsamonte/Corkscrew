import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });
  const { event, session } = await request.json();

  if (event === "SIGNED_IN" && session) {
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
  }

  if (event === "SIGNED_OUT") {
    await supabase.auth.signOut();
  }

  return NextResponse.json({ success: true });
}
