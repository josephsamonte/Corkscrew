"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

const schema = z.object({
  coverLetter: z
    .string()
    .min(20, "Share a few details about your experience (20+ characters)")
    .max(1200, "Keep it under 1,200 characters"),
});

type ApplyValues = z.infer<typeof schema>;

type ApplyToJobFormProps = {
  jobId: string;
  hasApplied: boolean;
};

export function ApplyToJobForm({ jobId, hasApplied }: ApplyToJobFormProps) {
  const supabase = getBrowserSupabaseClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ApplyValues>({
    resolver: zodResolver(schema),
    defaultValues: { coverLetter: "" },
  });

  if (hasApplied || submitted) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900 shadow-sm">
        <h2 className="text-lg font-semibold text-emerald-900">Application sent</h2>
        <p className="mt-2">
          Great! The host has received your application. Keep an eye on your messages for follow-ups.
        </p>
      </div>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      setError("You need to be signed in to apply. Please sign in and try again.");
      return;
    }

    const { error: insertError } = await supabase.from("job_applications").insert({
      job_id: jobId,
      worker_id: session.user.id,
      cover_letter: values.coverLetter,
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    reset();
    setSubmitted(true);
    router.refresh();
  });

  return (
    <form
      className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm"
      onSubmit={onSubmit}
    >
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-zinc-900">Apply to this job</h2>
        <p className="text-sm text-zinc-600">
          Share relevant experience, certifications, or past events you&apos;ve supported.
        </p>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-zinc-700" htmlFor="coverLetter">
          Cover letter
        </label>
        <textarea
          id="coverLetter"
          rows={6}
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
          placeholder="Describe why you&apos;re a great fit for this event."
          {...register("coverLetter")}
        />
        {errors.coverLetter ? (
          <p className="text-xs text-red-600">{errors.coverLetter.message}</p>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn-accent w-full rounded-full px-4 py-2 text-sm font-medium disabled:cursor-not-allowed"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit application"}
      </button>
    </form>
  );
}
