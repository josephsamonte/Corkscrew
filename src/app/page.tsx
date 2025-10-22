import Link from "next/link";
import type { Job } from "@/types/database";
import { getServerSupabaseClient } from "@/lib/supabase/server";

async function getFeaturedJobs(): Promise<Job[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(3);

  if (error || !data) {
    return [];
  }

  return data;
}

export default async function Home() {
  const jobs = await getFeaturedJobs();

  return (
    <div className="flex flex-col gap-16">
      <section className="grid gap-10 rounded-3xl bg-white px-10 py-16 shadow-sm sm:grid-cols-2">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-600">
            Hospitality staffing made simple
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-zinc-900">
            Book vetted bartenders, servers, and caterers for any event in minutes.
          </h1>
          <p className="text-lg text-zinc-600">
            Corkscrew connects event organizers with verified service professionals. Publish a job, browse available talent, and handle the entire booking flow in one place.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/auth/sign-up" className="btn-accent rounded-full px-6 py-3 text-sm font-medium shadow-sm transition">
              Get started
            </Link>
            <Link
              href="/jobs"
              className="rounded-full border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
            >
              Explore open roles
            </Link>
          </div>
        </div>
        <div className="space-y-6 rounded-2xl border border-zinc-100 bg-zinc-50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Why teams choose Corkscrew
          </h2>
          <ul className="grid gap-5 text-sm text-zinc-600">
            <li>
              <strong className="block text-zinc-900">Curated professionals</strong>
              Identity verification, background checks, and community reviews build trust before your event begins.
            </li>
            <li>
              <strong className="block text-zinc-900">Flexible booking</strong>
              Fine-tune availability, hourly rates, and special requirements to craft the perfect event crew.
            </li>
            <li>
              <strong className="block text-zinc-900">Messaging & logistics</strong>
              Coordinate details, confirm call times, and gather post-event feedback without leaving the platform.
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Featured opportunities
          </h2>
          <Link
            href="/jobs"
            className="text-sm font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
          >
            View all jobs
          </Link>
        </div>
        {jobs.length ? (
          <div className="grid gap-6 md:grid-cols-3">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="flex h-full flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {job.title}
                  </h3>
                  <p className="text-sm text-zinc-600 line-clamp-3">
                    {job.description}
                  </p>
                </div>
                <dl className="mt-6 grid grid-cols-2 gap-2 text-xs text-zinc-500">
                  <div>
                    <dt className="uppercase tracking-wide">Date</dt>
                    <dd className="font-medium text-zinc-800">
                      {new Date(job.event_date).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-wide">Rate</dt>
                    <dd className="font-medium text-zinc-800">
                      {job.rate ? `$${job.rate.toFixed(0)}/hr` : "Negotiable"}
                    </dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-wide">Location</dt>
                    <dd className="font-medium text-zinc-800">{job.location}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-wide">Status</dt>
                    <dd className="font-medium capitalize text-emerald-600">{job.status}</dd>
                  </div>
                </dl>
                <Link
                  href={`/jobs/${job.id}`}
                  className="mt-6 inline-flex items-center justify-center btn-accent rounded-full px-4 py-2 text-sm font-medium"
                >
                  View details
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-100 p-8 text-center text-sm text-zinc-600">
            No jobs yet. Once your Supabase project is connected, recent openings will appear here automatically.
          </div>
        )}
      </section>
    </div>
  );
}
