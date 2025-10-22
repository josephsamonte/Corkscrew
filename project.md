# Corkscrew – Product Requirements Document (PRD)

## Overview

**Corkscrew** is an online marketplace that connects individuals and businesses hosting events (weddings, parties, corporate events, etc.) with skilled service industry professionals such as bartenders, servers, and caterers. The platform will simplify the process of finding, booking, and managing event staff while also providing job opportunities for service workers looking for flexible or part-time gigs.

## Objectives

- Create a seamless web platform for connecting event organizers with service professionals.
- Enable verified professionals to list their skills, availability, and rates.
- Allow clients to post event needs and quickly hire reliable staff.
- Build trust through reviews, verification, and secure payment processing.
- Launch a minimum viable product (MVP) within 3–4 months for early testing among local service industry professionals.

---

## Target Audience

### Primary Users

1. **Event Organizers / Clients**

   - Individuals planning weddings, private parties, or corporate events.
   - Small businesses (venues, catering companies, planners) needing temporary or freelance staff.

2. **Service Professionals**
   - Bartenders, servers, caterers, chefs, dishwashers, setup crew, etc.
   - Workers looking for flexible gigs or extra income.

### Secondary Users

- Event coordinators or agencies seeking to fill last-minute staffing needs.
- Venues with seasonal hiring demands.

---

## Core Features

### Phase 1 (MVP)

- **User Authentication**

  - Sign up/log in with email or Google.
  - Separate account types: “Hire” and “Work.”

- **Professional Profiles**

  - Name, photo, bio, experience, certifications.
  - Skills/tags (e.g., mixology, fine dining service, catering prep).
  - Hourly rate and availability calendar.

- **Job Listings**

  - Clients can create postings with date, time, location, and role requirements.
  - Workers can browse and apply.

- **Matching & Search**

  - Search/filter by location, role, rate, date.
  - Smart suggestions based on availability and ratings.

- **Booking & Messaging**

  - In-platform messaging for details and coordination.
  - Booking request/acceptance flow.

- **Reviews & Ratings**

  - Post-job reviews for both clients and workers.

- **Payments (Phase 1.5)**
  - Secure payments (Stripe integration).
  - Optional deposit or escrow model.

---

### Phase 2 (Growth Features)

- **Advanced Matching Algorithm**

  - Auto-suggestions based on experience, location, and job history.

- **Instant Booking for Verified Pros**

  - Allow immediate booking of top-rated, pre-verified professionals.

- **Subscription Plans**

  - For frequent event organizers or agencies.
  - For professionals (boosted visibility, featured listings).

- **Background Checks & Verification**

  - Optional identity or certification verification via a third-party service.

- **Notifications & Reminders**
  - Email/SMS reminders for upcoming jobs and new matches.

---

## Non-Functional Requirements

- **Performance:** Pages load in <2 seconds; scalable backend.
- **Security:** Encrypted communication (HTTPS, JWT authentication).
- **Data Privacy:** Compliance with GDPR and CCPA.
- **Reliability:** 99.5% uptime target.
- **Usability:** Simple, mobile-friendly interface for both workers and clients.

---

## Tech Stack (Proposed)

| Layer               | Technologies                      |
| ------------------- | --------------------------------- |
| **Frontend**        | React (Next.js), Tailwind CSS     |
| **Backend**         | Node.js (Express) or NestJS       |
| **Database**        | PostgreSQL / Supabase             |
| **Authentication**  | Firebase Auth or Auth0            |
| **Payments**        | Stripe                            |
| **Hosting**         | Vercel / AWS                      |
| **Messaging**       | Firebase Realtime DB or Socket.io |
| **Version Control** | GitHub                            |

---

## Success Metrics

- **MVP launch** with at least 100 local users (50 workers, 50 clients).
- **Job completion rate:** 80% of posted jobs successfully filled.
- **User retention:** 40% of users returning monthly.
- **Average rating:** ≥4.5 stars across professionals.

---

## Timeline

| Phase     | Description                           | Duration |
| --------- | ------------------------------------- | -------- |
| Phase 0   | Market research, branding, and design | 2 weeks  |
| Phase 1   | MVP development (core features)       | 8 weeks  |
| Phase 1.5 | Payment integration + messaging       | 3 weeks  |
| Phase 2   | Matching algorithm + subscriptions    | 6 weeks  |
| **Total** | **~19 weeks (~4.5 months)**           |          |

---

## Future Vision

Corkscrew aims to become the go-to staffing marketplace for the service industry — a trusted, flexible platform where event organizers can find reliable help instantly, and workers can easily discover well-paid, enjoyable gigs.

Future plans include:

- Native iOS and Android apps.
- AI-driven recommendations and scheduling.
- Partnerships with venues, wedding planners, and hospitality groups.

---

## Notes

- Founder background: Software engineer with extensive service industry experience.
- Target initial testing market: Local community of service professionals (friends, former colleagues).
- Branding: “Corkscrew” represents hospitality, sophistication, and connection.

---
