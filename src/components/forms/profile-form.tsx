"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

const schema = z.object({
  full_name: z.string().min(2, "Enter your name"),
  role: z.enum(["hire", "work"]),
  bio: z.string().max(600, "Keep it under 600 characters").optional(),
  skills: z.string().optional(),
  hourly_rate: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : null))
    .refine((value) => value === null || value >= 0, {
      message: "Rate must be positive",
    }),
  location: z.string().optional(),
  experience_years: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : null))
    .refine((value) => value === null || value >= 0, {
      message: "Experience must be positive",
    }),
  certifications: z.string().optional(),
});

type ProfileValues = z.infer<typeof schema>;

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const supabase = getBrowserSupabaseClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile?.full_name ?? "",
      role: profile?.role ?? "hire",
      bio: profile?.bio ?? "",
      skills: profile?.skills?.join(", ") ?? "",
      hourly_rate: profile?.hourly_rate?.toString() ?? "",
      location: profile?.location ?? "",
      experience_years: profile?.experience_years?.toString() ?? "",
      certifications: profile?.certifications?.join(", ") ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setSuccess(null);
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      setError("You must be signed in to update your profile.");
      return;
    }

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert({
        id: session.user.id,
        full_name: values.full_name,
        role: values.role,
        bio: values.bio ? values.bio : null,
        skills: values.skills
          ? values.skills.split(",").map((skill) => skill.trim()).filter(Boolean)
          : null,
        hourly_rate:
          typeof values.hourly_rate === "number" ? values.hourly_rate : null,
        location: values.location ? values.location : null,
        experience_years:
          typeof values.experience_years === "number"
            ? values.experience_years
            : null,
        certifications: values.certifications
          ? values.certifications
              .split(",")
              .map((cert) => cert.trim())
              .filter(Boolean)
          : null,
      });

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    setSuccess("Profile updated successfully.");
    router.refresh();
  });

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-6 rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="full_name">
            Full name
          </label>
          <input
            id="full_name"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            {...register("full_name")}
          />
          {errors.full_name ? (
            <p className="text-xs text-red-600">{errors.full_name.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium text-zinc-700">Account type</span>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
              <input type="radio" value="hire" {...register("role")} /> Hire talent
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
              <input type="radio" value="work" {...register("role")} /> Find gigs
            </label>
          </div>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium text-zinc-700" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            rows={5}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            placeholder="Share your experience, signature events, or preferred venues."
            {...register("bio")}
          />
          {errors.bio ? <p className="text-xs text-red-600">{errors.bio.message}</p> : null}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="skills">
            Skills (comma separated)
          </label>
          <input
            id="skills"
            placeholder="Mixology, fine dining, setup"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            {...register("skills")}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="hourly_rate">
            Preferred hourly rate
          </label>
          <input
            id="hourly_rate"
            type="number"
            min="0"
            step="5"
            placeholder="30"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            {...register("hourly_rate")}
          />
          {errors.hourly_rate ? (
            <p className="text-xs text-red-600">{errors.hourly_rate.message}</p>
          ) : null}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            placeholder="Austin, TX"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            {...register("location")}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="experience_years">
            Years of experience
          </label>
          <input
            id="experience_years"
            type="number"
            min="0"
            step="1"
            placeholder="5"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            {...register("experience_years")}
          />
          {errors.experience_years ? (
            <p className="text-xs text-red-600">{errors.experience_years.message}</p>
          ) : null}
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium text-zinc-700" htmlFor="certifications">
            Certifications (comma separated)
          </label>
          <input
            id="certifications"
            placeholder="TABC, ServSafe"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            {...register("certifications")}
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {success}
        </p>
      ) : null}

      <div className="flex justify-end gap-3">
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
          {isSubmitting ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}
