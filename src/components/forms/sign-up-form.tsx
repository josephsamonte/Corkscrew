"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import type { RoleType } from "@/types/database";

const schema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
    role: z.enum(["hire", "work"], {
      required_error: "Select how you want to use Corkscrew",
    }),
    terms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof schema>;

export function SignUpForm() {
  const router = useRouter();
  const supabase = getBrowserSupabaseClient();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "hire",
      terms: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          role: values.role,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    const user = data.user;

    if (user) {
      const { error: upsertError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: values.fullName,
          role: values.role as RoleType,
        },
        { onConflict: "id" },
      );

      if (upsertError) {
        setError(upsertError.message);
        return;
      }
    }

    router.replace("/dashboard");
    router.refresh();
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-xs text-red-600">{errors.fullName.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-zinc-700">
            How will you use Corkscrew?
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-700 shadow-sm">
              <input
                type="radio"
                value="hire"
                className="h-4 w-4"
                {...register("role")}
              />
              I need to hire staff
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-700 shadow-sm">
              <input
                type="radio"
                value="work"
                className="h-4 w-4"
                {...register("role")}
              />
              I&apos;m looking for gigs
            </label>
          </div>
          {errors.role && (
            <p className="text-xs text-red-600">{errors.role.message}</p>
          )}
        </fieldset>
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          <input type="checkbox" className="h-4 w-4" {...register("terms")} />
          I agree to the platform terms and privacy policy.
        </label>
        {errors.terms && (
          <p className="text-xs text-red-600">{errors.terms.message}</p>
        )}
      </div>

      {error ? (
        <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-xs text-zinc-500">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="font-medium text-zinc-700 hover:text-zinc-900">
          Sign in
        </Link>
      </p>
    </form>
  );
}
