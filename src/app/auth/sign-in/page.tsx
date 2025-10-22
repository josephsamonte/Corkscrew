import { redirect } from "next/navigation";
import { SignInForm } from "@/components/forms/sign-in-form";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function SignInPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/setup");
  }

  const supabase = await getServerSupabaseClient();
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
