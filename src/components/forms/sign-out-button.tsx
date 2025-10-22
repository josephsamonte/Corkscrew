"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = getBrowserSupabaseClient();

  const handleClick = () => {
    startTransition(async () => {
      await supabase.auth.signOut();
      router.replace("/");
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full border border-zinc-200 px-3 py-1 text-sm font-medium text-zinc-700 transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:bg-zinc-100"
      disabled={pending}
    >
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}
