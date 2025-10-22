import { cookies } from "next/headers";
import Link from "next/link";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database, Job, Profile } from "@/types/database";

type JobsPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

async function fetchJobs({
  query,
  location,
  role,
  date,
}: {
  query?: string;
  location?: string;
  role?: string;
  date?: string;
}): Promise<Job[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  const supabase = createServerComponentClient<Database>({ cookies });
  let request = supabase
    .from("jobs")
    .select("*")
    .eq("status", "open")
    .order("event_date", { ascending: true });

  if (query) {
    request = request.ilike("title", `%${query}%`);
  }

  if (location) {
    request = request.ilike("location", `%${location}%`);
  }

  if (role) {
    request = request.ilike("description", `%${role}%`);
  }

  if (date) {
    request = request.gte("event_date", date);
  }

  const { data, error } = await request;
  if (error || !data) {
    return [];
  }

  return data;
}

async function fetchProfile(): Promise<Profile | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  return data ?? null;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const query = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const location =
    typeof searchParams.location === "string" ? searchParams.location : undefined;
  const role = typeof searchParams.role === "string" ? searchParams.role : undefined;
  const date = typeof searchParams.date === "string" ? searchParams.date : undefined;

  const [jobs, profile] = await Promise.all([
    fetchJobs({ query, location, role, date }),
    fetchProfile(),
  ]);

  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Marketplace
            </p>
            <h1 className="text-3xl font-semibold text-zinc-900">Find your next event gig</h1>
          </div>
          {profile?.role === "hire" ? (
            <Link
              href="/jobs/new"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Post a job
            </Link>
          ) : null}
        </div>
        <p className="text-sm text-zinc-600">
          Filter by location, skill, or date to quickly match with professionals ready to work.
        </p>
      </header>

      <form className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Keyword
          </label>
          <input
            name="q"
            defaultValue={query ?? ""}
            placeholder="Bartender, server, chef..."
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Location
          </label>
          <input
            name="location"
            defaultValue={location ?? ""}
            placeholder="City, neighborhood"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Skills & role
          </label>
          <input
            name="role"
            defaultValue={role ?? ""}
            placeholder="Mixologist, fine dining, setup..."
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Earliest date
          </label>
          <input
            type="date"
            name="date"
            defaultValue={date ?? ""}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </div>
        <div className="md:col-span-4 flex justify-end gap-3 text-sm">
          <Link
            href="/jobs"
            className="rounded-full border border-zinc-200 px-4 py-2 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
          >
            Reset
          </Link>
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-5 py-2 font-medium text-white hover:bg-zinc-800"
          >
            Apply filters
          </button>
        </div>
      </form>

      {supabaseConfigured ? (
        <div className="grid gap-6 md:grid-cols-2">
          {jobs.length ? (
            jobs.map((job) => (
              <article
                key={job.id}
                className="flex h-full flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <header className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {job.title}
                    </h2>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      {new Date(job.event_date).toLocaleDateString()} · {job.location}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">
                    {job.rate ? `$${job.rate.toFixed(0)}/hr` : "Negotiable"}
                  </span>
                </header>
                <p className="flex-1 text-sm text-zinc-600 line-clamp-3">
                  {job.description}
                </p>
                <Link
                  href={`/jobs/${job.id}`}
                  className="inline-flex w-fit items-center gap-2 text-sm font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
                >
                  View job details
                </Link>
              </article>
            ))
          ) : (
            <div className="md:col-span-2 rounded-2xl border border-dashed border-zinc-300 bg-zinc-100 p-10 text-center text-sm text-zinc-600">
              No jobs match your filters yet. Adjust criteria or check back soon.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-10 text-sm text-amber-900">
          Connect your Supabase project to load live job data. See <code>.env.local.example</code> for required variables.
        </div>
      )}
    </div>
  );
}
