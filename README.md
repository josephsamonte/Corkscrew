# Corkscrew Web MVP

A Next.js App Router project that powers the Corkscrew marketplace for connecting event organizers with hospitality professionals. The MVP covers authentication, profile management, job postings, applications, lightweight messaging, and review scaffolding backed by Supabase.

## Tech Stack

- [Next.js 16](https://nextjs.org) with the App Router
- [Supabase](https://supabase.com) for auth and PostgreSQL data
- Tailwind CSS (v4 preview) for styling
- React Hook Form + Zod for validated forms

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Provide Supabase credentials by copying the example env and filling in your project details:
   ```bash
   cp .env.local.example .env.local
   # edit .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

3. Apply the database schema inside your Supabase project:
   ```sql
   -- supabase/sql editor or CLI
   \i supabase/schema.sql
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000` to use the app. Protected routes (dashboard, jobs, messages, profile) require a signed-in user.

## Feature Overview

- **Landing & Marketplace**: Home page marketing content with featured job listings, filters for browsing `/jobs`, and detailed job pages with application flows.
- **Authentication**: Email/password sign-up and sign-in, role selection (“Hire” or “Work”), session management via Supabase helpers, and a global sign-out button.
- **Profiles**: Editable profile with bio, skills, certifications, rates, and availability placeholders. Profiles seed automatically on sign-up.
- **Job Management**: Clients can create jobs at `/jobs/new`, view summaries in the dashboard, and check applicant lists per job.
- **Applications**: Workers submit cover letters, track the status of their applications, and see recommended jobs on their dashboard view.
- **Messaging**: Centralized inbox showing job-related conversations with the ability to reply when participants exist.
- **Database Schema**: Supabase SQL script (`supabase/schema.sql`) defines enums, tables, indexes, and row-level security policies for all core entities.

## Running Tests & Linting

```bash
npm run lint
```

## Deployment Notes

- Set the same Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in your hosting environment (e.g., Vercel).
- Ensure RLS policies from `supabase/schema.sql` are applied before going live.
- Stripe payments and advanced messaging (real-time) are left for Phase 1.5+ per the PRD.

## Roadmap Suggestions

1. Integrate Supabase Storage for profile avatars and document uploads.
2. Add Stripe checkout flows for deposits and payouts.
3. Build real-time messaging with Supabase Realtime and presence indicators.
4. Layer in background verification workflows and subscription billing as noted in the PRD.
