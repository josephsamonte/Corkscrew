import { redirect } from "next/navigation";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Job, JobApplication, Profile } from "@/types/database";
import { getServerSupabaseClient } from "@/lib/supabase/server";

type DashboardData = {
  profile: Profile;
  jobs: Job[];
  applications: JobApplication[];
};

async function loadDashboardData(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<DashboardData> {

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error(profileError?.message ?? "Profile not found");
  }

  if (profile.role === "hire") {
    const { data: jobs } = await supabase
      .from("jobs")
      .select("*")
      .eq("client_id", userId)
      .order("created_at", { ascending: false });

    const { data: applications } = await supabase
      .from("job_applications")
      .select("*")
      .in(
        "job_id",
        jobs && jobs.length ? jobs.map((job) => job.id) : ["00000000-0000-0000-0000-000000000000"],
      );

    return {
      profile,
      jobs: jobs ?? [],
      applications: applications ?? [],
    };
  }

  const { data: applications } = await supabase
    .from("job_applications")
    .select("*")
    .eq("worker_id", userId)
    .order("created_at", { ascending: false });

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "open")
    .order("event_date", { ascending: true })
    .limit(10);

  return {
    profile,
    jobs: jobs ?? [],
    applications: applications ?? [],
  };
}

export default async function DashboardPage() {
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

  const data = await loadDashboardData(supabase, session.user.id);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Dashboard Overview
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900">
          Welcome back, {data.profile.full_name ?? "there"}
        </h1>
        <p className="text-sm text-zinc-600">
          Track upcoming events, manage your presence, and stay on top of communication.
        </p>
      </header>

      {data.profile.role === "hire" ? (
        <HireDashboard jobs={data.jobs} applications={data.applications} />
      ) : (
        <WorkDashboard jobs={data.jobs} applications={data.applications} />
      )}
    </div>
  );
}

function HireDashboard({
  jobs,
  applications,
}: {
  jobs: Job[];
  applications: JobApplication[];
}) {
  const openJobs = jobs.filter((job) => job.status === "open");

  return (
    <div className="space-y-10">
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Open roles
          </p>
          <p className="mt-3 text-3xl font-semibold text-zinc-900">
            {openJobs.length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Applications received
          </p>
          <p className="mt-3 text-3xl font-semibold text-zinc-900">
            {applications.length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Events posted
          </p>
          <p className="mt-3 text-3xl font-semibold text-zinc-900">
            {jobs.length}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Recent job posts</h2>
          <Link href="/jobs/new" className="btn-accent rounded-full px-4 py-2 text-sm font-medium">
            Create job
          </Link>
        </div>
        <div className="grid gap-4">
          {jobs.length ? (
            jobs.map((job) => (
              <article
                key={job.id}
                className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900">
                      {job.title}
                    </h3>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      {new Date(job.event_date).toLocaleDateString()} · {job.location}
                    </p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium capitalize text-zinc-700">
                    {job.status}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 line-clamp-2">
                  {job.description}
                </p>
                <Link
                  href={`/jobs/${job.id}`}
                  className="text-sm font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
                >
                  View details & applicants
                </Link>
              </article>
            ))
          ) : (
            <EmptyState message="Post your first event to start receiving applications." />
          )}
        </div>
      </section>
    </div>
  );
}

function WorkDashboard({
  jobs,
  applications,
}: {
  jobs: Job[];
  applications: JobApplication[];
}) {
  return (
    <div className="space-y-10">
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Total applications
          </p>
          <p className="mt-3 text-3xl font-semibold text-zinc-900">
            {applications.length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Upcoming gigs
          </p>
          <p className="mt-3 text-3xl font-semibold text-zinc-900">
            {applications.filter((application) => application.status === "accepted").length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Open roles nearby
          </p>
          <p className="mt-3 text-3xl font-semibold text-zinc-900">
            {jobs.length}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Recommended gigs</h2>
          <Link
            href="/jobs"
            className="text-sm font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
          >
            Browse all jobs
          </Link>
        </div>
        <div className="grid gap-4">
          {jobs.length ? (
            jobs.map((job) => (
              <article
                key={job.id}
                className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900">
                      {job.title}
                    </h3>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      {new Date(job.event_date).toLocaleDateString()} · {job.location}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">
                    {job.rate ? `$${job.rate.toFixed(0)}/hr` : "Negotiable"}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 line-clamp-2">
                  {job.description}
                </p>
                <Link
                  href={`/jobs/${job.id}`}
                  className="text-sm font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
                >
                  View details
                </Link>
              </article>
            ))
          ) : (
            <EmptyState message="No open roles yet. Update your profile to unlock better matches." />
          )}
        </div>
      </section>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-100 p-8 text-center text-sm text-zinc-600">
      {message}
    </div>
  );
}
