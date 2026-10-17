# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Students of the institutions running Prisma Academia: nursing, midwifery and health-technology colleges in Nigeria (e.g. Abnaibi College of Nursing Sciences, Al-Maarif CNM/HST). Most of them use mid- to low-end Android phones on mobile data. Desktop use is occasional, at a cyber café or a school lab. They open the portal to handle money, check academic standing, and stay on top of school notices, usually in short sessions while away from campus.

## Product Purpose
This is the student's self-service window into the school's records. They pay fees through Paystack, download receipts, check published results (GPA, CGPA, carry-overs), download result slips, the transcript and course forms, read memos and calendar events, open shared documents, and keep their personal and contact details current. Success means a student can see what they owe, what's new and how they're doing within seconds of signing in, and finish a payment or download without help from the bursary or ICT office.

## Positioning
The portal is tied directly to the school's live academic and bursary records (the Prisma Academia API). Fee status, results and documents are the school's real records, not a separate system the student has to reconcile.

## Operating Context
- Sign-in uses the reg number (e.g. `BM/01/037`) or school email plus a password. First-time students go through a setup flow (new password, date of birth, required passport photo).
- Payment: fee → Paystack checkout → return to `/payment/status?status=&reference=` → verify. Receipts are PDFs.
- Results are published by the school per sitting (session and semester). Grading schemes are per programme.
- Course forms and result slips are addressed by level (100/200/300) and semester.
- PDFs are generated server-side (Template Studio).

## Capabilities and Constraints
- **Multi-tenant:** one codebase is deployed per school. Branding comes from just three env vars (school name, logo, primary colour) plus the API URL; everything else derives from them, so the design must look right with any school's primary colour.
- **Top jobs, one tap from Home:** pay outstanding fees, check results and CGPA, read memos and events. Course forms and documents are secondary.
- **Not supported by the API (don't fabricate):**
  - online course registration
  - hostel booking
  - clearance
  - timetable
  - ID card
  - partial payments
  - a separate payment-history endpoint (history is the `userPayment` on each fee)
- **Stack:** Next.js 16 App Router (client-rendered pages behind an auth guard), Tailwind v4, shadcn/radix, tanstack-query, zustand.
- **Performance budget:** data-light, fast on low-end Android, no heavy assets on first load.

## Brand Commitments
- The school's name, logo and primary color come from env. The portal never hardcodes one school's identity.
- The student's passport photo and reg number are their identity in the school's records, and are shown throughout the app.

## Evidence on Hand
- Real data comes from the live API: fees, results summary, memos, events, documents, and the student profile with photo.
- There are no testimonials, statistics or marketing claims, and none should be invented.

## Product Principles
1. **Money and standing first.** What the student owes and how they are doing academically lead every entry point.
2. **Every screen ends in an action.** Pay, download, read, or update. No dead ends, and no data without a next step.
3. **Built for the phone in a student's hand.** Thumb-reachable navigation, legible type, and graceful behavior on slow networks.
4. **Trustworthy like a bank statement.** Amounts, statuses and dates are exact, consistent and never ambiguous.
5. **Any school's colors.** The design holds up under any tenant's brand color and logo.

## Accessibility & Inclusion
- Minimum readable text size on small screens, and touch targets of at least 44px.
- Respect reduced motion.
- Status must never be conveyed by color alone (paid/unpaid, pass/fail).
