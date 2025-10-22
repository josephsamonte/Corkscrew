import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { SignUpForm } from "@/components/forms/sign-up-form";
import type { Database } from "@/types/database";

export default async function SignUpPage() {
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
        <h1 className="text-2xl font-semibold text-zinc-900">Create your account</h1>
        <p className="text-sm text-zinc-600">
          Choose your role, book talent, and get paid for gigs in one place.
        </p>
      </div>
      <SignUpForm />
    </div>
  );
}
