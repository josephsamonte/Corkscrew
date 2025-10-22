"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInValues = z.infer<typeof schema>;

export function SignInForm() {
  const router = useRouter();
  const supabase = getBrowserSupabaseClient();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="space-y-4">
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
            autoComplete="current-password"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>
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
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-xs text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link href="/auth/sign-up" className="font-medium text-zinc-700 hover:text-zinc-900">
          Create one
        </Link>
      </p>
    </form>
  );
}
