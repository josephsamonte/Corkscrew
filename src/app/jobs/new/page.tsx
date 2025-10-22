import { redirect } from "next/navigation";
import { CreateJobForm } from "@/components/forms/create-job-form";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function NewJobPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/setup");
  }

  const supabase = await getServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (error || profile?.role !== "hire") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-zinc-900">Create a new event job</h1>
        <p className="text-sm text-zinc-600">
          Share the details professionals need to evaluate your opportunity.
        </p>
      </header>
      <CreateJobForm />
    </div>
  );
}
