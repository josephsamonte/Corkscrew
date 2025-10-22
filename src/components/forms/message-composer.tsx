"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

const schema = z.object({
  content: z
    .string()
    .min(1, "Type a message")
    .max(1000, "Keep messages under 1,000 characters"),
});

type ComposerValues = z.infer<typeof schema>;

type MessageComposerProps = {
  jobId: string;
  recipientId: string | null;
};

export function MessageComposer({ jobId, recipientId }: MessageComposerProps) {
  const supabase = getBrowserSupabaseClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ComposerValues>({
    resolver: zodResolver(schema),
    defaultValues: { content: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);

    if (!recipientId) {
      setError("Select a participant to message.");
      return;
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      setError("Sign in to send messages.");
      return;
    }

    const { error: insertError } = await supabase.from("messages").insert({
      job_id: jobId,
      sender_id: session.user.id,
      recipient_id: recipientId,
      content: values.content,
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    reset();
    router.refresh();
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-start gap-3 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div className="flex-1 space-y-1">
        <textarea
          rows={3}
          className="w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
          placeholder="Share updates, clarify details, or coordinate arrival times."
          {...register("content")}
        />
        {errors.content ? (
          <p className="text-xs text-red-600">{errors.content.message}</p>
        ) : null}
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
      <button
        type="submit"
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        disabled={isSubmitting || !recipientId}
      >
        {isSubmitting ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
