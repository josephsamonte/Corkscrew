import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Session } from "@supabase/supabase-js";
import { SignOutButton } from "@/components/forms/sign-out-button";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { SupabaseListener } from "@/components/listeners/supabase-listener";
import type { Database } from "@/types/database";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Corkscrew | Event Staffing Marketplace",
  description:
    "Connect event organizers with vetted hospitality professionals through Corkscrew's staffing marketplace.",
};

async function getInitialSession(): Promise<Session | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

function Nav({ session }: { session: Session | null }) {
  const isAuthenticated = Boolean(session);
  return (
    <header className="border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-zinc-900">
          Corkscrew
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium text-zinc-700">
          <Link href="/jobs" className="hover:text-zinc-900">
            Browse Jobs
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="hover:text-zinc-900">
                Dashboard
              </Link>
              <Link href="/messages" className="hover:text-zinc-900">
                Messages
              </Link>
              <Link
                href="/profile"
                className="rounded-full border border-zinc-200 px-3 py-1 hover:border-zinc-300 hover:text-zinc-900"
              >
                Profile
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/auth/sign-in" className="hover:text-zinc-900">
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className="rounded-full bg-zinc-900 px-4 py-1.5 text-white hover:bg-zinc-800"
              >
                Join now
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const session = supabaseConfigured ? await getInitialSession() : null;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-zinc-50 font-sans text-zinc-900 antialiased`}
      >
        {supabaseConfigured ? (
          <SupabaseProvider initialSession={session}>
            <SupabaseListener
              serverAccessToken={session?.access_token ?? undefined}
            />
            <Nav session={session} />
            <main className="mx-auto min-h-[calc(100vh-64px)] w-full max-w-6xl px-6 py-10">
              {children}
            </main>
          </SupabaseProvider>
        ) : (
          <>
            <Nav session={null} />
            <main className="mx-auto min-h-[calc(100vh-64px)] w-full max-w-6xl px-6 py-10">
              {children}
            </main>
          </>
        )}
      </body>
    </html>
  );
}
