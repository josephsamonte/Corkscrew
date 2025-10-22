import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ApplyToJobForm } from "@/components/forms/apply-to-job-form";
import type { Job, JobApplication, Profile } from "@/types/database";
import { getServerSupabaseClient } from "@/lib/supabase/server";

type JobPageProps = {
  params: { id: string };
};

type JobDetail = Job & {
  clientProfile: Profile | null;
  applications: JobApplication[];
  viewerProfile: Profile | null;
  hasApplied: boolean;
};

async function loadJobDetail(jobId: string): Promise<JobDetail> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase is not configured");
  }

  const supabase = await getServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error || !job) {
    notFound();
  }

  const [{ data: clientProfile }, { data: viewerProfile }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", job.client_id).single(),
    session
      ? supabase.from("profiles").select("*").eq("id", session.user.id).single()
      : Promise.resolve({ data: null } as { data: Profile | null }),
  ]);

  let applications: JobApplication[] = [];
  let hasApplied = false;

  if (session) {
    const { data: existingApplications } = await supabase
      .from("job_applications")
      .select("*")
      .eq("job_id", jobId);

    applications = existingApplications ?? [];
    hasApplied = Boolean(
      applications.find((application) => application.worker_id === session.user.id),
    );
  }

  return {
    ...job,
    clientProfile: clientProfile ?? null,
    applications,
    viewerProfile: viewerProfile ?? null,
    hasApplied,
  };
}

export default async function JobDetailPage({ params }: JobPageProps) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/setup");
  }

  const detail = await loadJobDetail(params.id);
  const isOwner = detail.viewerProfile?.id === detail.client_id;

  return (
    <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
      <section className="space-y-6">
        <div className="space-y-3 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Event opportunity</p>
          <h1 className="text-3xl font-semibold text-zinc-900">{detail.title}</h1>
          <p className="text-sm text-zinc-600">{detail.description}</p>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Date</dt>
              <dd className="text-sm font-medium text-zinc-900">
                {new Date(detail.event_date).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Location</dt>
              <dd className="text-sm font-medium text-zinc-900">{detail.location}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Compensation</dt>
              <dd className="text-sm font-medium text-zinc-900">
                {detail.rate ? `$${detail.rate.toFixed(0)}/hr` : "Negotiable"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Status</dt>
              <dd className="text-sm font-medium capitalize text-emerald-600">
                {detail.status}
              </dd>
            </div>
          </dl>
        </div>

        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">About the host</h2>
          {detail.clientProfile ? (
            <div className="mt-4 space-y-2 text-sm text-zinc-600">
              <p className="font-medium text-zinc-900">
                {detail.clientProfile.full_name ?? "Client"}
              </p>
              {detail.clientProfile.bio ? <p>{detail.clientProfile.bio}</p> : null}
              {detail.clientProfile.location ? (
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Based in {detail.clientProfile.location}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-600">
              Host details will appear once profiles are configured.
            </p>
          )}
        </section>

        {isOwner ? (
          <section className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">Applications</h2>
              <Link
                href={`/messages?jobId=${detail.id}`}
                className="text-sm font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
              >
                Open conversations
              </Link>
            </div>
            {detail.applications.length ? (
              <ul className="space-y-3">
                {detail.applications.map((application) => (
                  <li
                    key={application.id}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-zinc-900">
                        Applicant ID: {application.worker_id.slice(0, 8)}
                      </p>
                      <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium uppercase text-zinc-700">
                        {application.status}
                      </span>
                    </div>
                    {application.cover_letter ? (
                      <p className="mt-2 text-sm text-zinc-600">
                        {application.cover_letter}
                      </p>
                    ) : null}
                    <p className="mt-2 text-[11px] uppercase tracking-wide text-zinc-400">
                      Applied on {new Date(application.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-600">
                No applications yet. Share this role with your network to get traction.
              </p>
            )}
          </section>
        ) : null}
      </section>

      <aside className="space-y-6">
        {detail.viewerProfile && detail.viewerProfile.role === "work" ? (
          <ApplyToJobForm jobId={detail.id} hasApplied={detail.hasApplied} />
        ) : (
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-sm text-zinc-600 shadow-sm">
            {detail.viewerProfile ? (
              <p>
                Switch to your worker account to apply for this role or contact the host directly through Messages.
              </p>
            ) : (
              <p>
                Sign up or sign in to apply for this opportunity and receive updates from the host.
              </p>
            )}
            <Link
              href={detail.viewerProfile ? "/messages" : "/auth/sign-in"}
              className="btn-accent mt-4 inline-flex rounded-full px-4 py-2 text-sm font-medium"
            >
              {detail.viewerProfile ? "Go to messages" : "Sign in"}
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
