export default function SetupPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-3xl border border-amber-200 bg-amber-50 p-10 text-sm text-amber-900">
      <h1 className="text-2xl font-semibold text-amber-900">
        Supabase configuration required
      </h1>
      <p>
        Add your Supabase project URL and anon key to a{" "}
        <code className="rounded bg-amber-100 px-1 py-0.5">
          .env.local
        </code>{" "}
        file to unlock authentication, data, and messaging features.
      </p>
      <ol className="list-decimal space-y-2 pl-5">
        <li>
          Copy <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> from the Supabase dashboard.
        </li>
        <li>
          Create <code>.env.local</code> at the project root by duplicating the
          provided <code>.env.local.example</code>.
        </li>
        <li>
          Restart the Next.js dev server so the new environment variables take
          effect.
        </li>
      </ol>
      <p>
        Need schema instructions? Check <code>supabase/schema.sql</code> for the
        MVP database structure defined for Corkscrew.
      </p>
    </div>
  );
}
