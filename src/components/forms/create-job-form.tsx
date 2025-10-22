"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

const schema = z.object({
  title: z.string().min(4, "Add an event title"),
  description: z.string().min(40, "Describe the role in at least 40 characters"),
  eventDate: z.string().min(1, "Select the event date"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().min(2, "Provide the event location"),
  rate: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : null))
    .refine((value) => value === null || value >= 0, {
      message: "Rate must be positive",
    }),
});

type CreateJobValues = z.infer<typeof schema>;

export function CreateJobForm() {
  const supabase = getBrowserSupabaseClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<CreateJobValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      eventDate: "",
      startTime: "",
      endTime: "",
      location: "",
      rate: null,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      setError("You need to be signed in to create a job.");
      return;
    }

    const { error: insertError, data } = await supabase
      .from("jobs")
      .insert({
        client_id: session.user.id,
        title: values.title,
        description: values.description,
        event_date: values.eventDate,
        start_time: values.startTime || null,
        end_time: values.endTime || null,
        location: values.location,
        rate: typeof values.rate === "number" ? values.rate : null,
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.replace(`/jobs/${data?.id ?? ""}`);
    router.refresh();
  });

  return (
    <form className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium text-zinc-700" htmlFor="title">
            Event title
          </label>
          <input
            id="title"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            placeholder="Wedding reception bartender"
            {...register("title")}
          />
          {errors.title ? <p className="text-xs text-red-600">{errors.title.message}</p> : null}
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium text-zinc-700" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            rows={6}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            placeholder="Outline responsibilities, attire, required experience, and guest count."
            {...register("description")}
          />
          {errors.description ? (
            <p className="text-xs text-red-600">{errors.description.message}</p>
          ) : null}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="eventDate">
            Event date
          </label>
          <input
            id="eventDate"
            type="date"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            {...register("eventDate")}
          />
          {errors.eventDate ? (
            <p className="text-xs text-red-600">{errors.eventDate.message}</p>
          ) : null}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            placeholder="Downtown Austin, TX"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            {...register("location")}
          />
          {errors.location ? (
            <p className="text-xs text-red-600">{errors.location.message}</p>
          ) : null}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="startTime">
            Start time
          </label>
          <input
            id="startTime"
            type="time"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            {...register("startTime")}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="endTime">
            End time
          </label>
          <input
            id="endTime"
            type="time"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            {...register("endTime")}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="rate">
            Hourly rate (optional)
          </label>
          <input
            id="rate"
            type="number"
            min="0"
            step="5"
            placeholder="25"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            {...register("rate")}
          />
          {errors.rate ? <p className="text-xs text-red-600">{errors.rate.message}</p> : null}
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300 hover:text-zinc-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Publishing..." : "Publish job"}
        </button>
      </div>
    </form>
  );
}
