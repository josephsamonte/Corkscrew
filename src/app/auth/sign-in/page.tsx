import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { SignInForm } from "@/components/forms/sign-in-form";
import type { Database } from "@/types/database";

export default async function SignInPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/setup");
  }

  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-zinc-900">Welcome back</h1>
        <p className="text-sm text-zinc-600">
          Sign in to manage gigs, review applicants, and keep events running smoothly.
        </p>
      </div>
      <SignInForm />
    </div>
  );
}
