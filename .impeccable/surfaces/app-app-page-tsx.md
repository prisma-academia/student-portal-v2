---
version: 1
slug: "app-app-page-tsx"
primary_target: "app/(app)/page.tsx"
related_targets: ["components/app-shell.tsx","app/(auth)/auth/sign-in/page.tsx"]
---

# Student portal app shell + pages

Scope: the authenticated app (`app/(app)/*`) plus auth pages (`app/(auth)/*`). Mode: Operate.
Audience and job: students on mid- to low-end Android phones. They check what they owe and pay it, check results and CGPA, read memos and events, and download course forms and documents.
Constraints: multi-tenant. Brand color, logo and name come from env, so everything must work with any primary color. Data-light. No fabricated features (no course registration, hostel or timetable).
Memorable moment: the student's ID card. Their passport photo and reg number are the identity of the whole app.

## Direction contract
- **THESIS:** The portal is the student's ID card and statement of account. Identity and money lead, and every row ends in an action. It refuses the generic admin dashboard (sidebar, stat-tile grid, equal cards).
- **OWN-WORLD:**
  - Ground: warm off-white tinted ~3% toward the tenant primary.
  - Ink: one tinted near-black family.
  - The tenant primary is a committed field: the ID card, active nav and primary actions.
  - State colors: paid (green), due (amber), overdue or fail (red), always with text labels.
  - Type: Manrope for display and tabular numerals, Source Sans 3 for body.
  - Hairline rules and full-bleed list rows instead of boxed cards; only the ID card and the payments statement are filled surfaces; radius tighter inside, softer outside.
- **STORY:** The student sees who they are, what they owe and their standing, acts with one tap (pay, download, read), and leaves.
- **FIRST VIEWPORT (Home, 390px):**
  - Sticky top bar: logo; the mini ID chip (photo + reg no) on the right opens the profile menu.
  - The ID card in the primary color: photo, name, reg no, programme · level.
  - Statement line: "₦X outstanding across N fees" with the Pay action.
  - Standing row: CGPA, class, carry-overs → Academics.
  - Latest memo.
  - Bottom tab bar: Home, Payments, Academics, Updates, Resources.
- **FORM:** user-pinned direction ("calm & premium"; gradient mesh login; logo-ring loader). Concept roll skipped because a pinned direction beats the roll. seed:62ccabfcbe36a1c7 (roll run for the record; the user's pinned direction, "Calm & premium" + "Flowing gradient mesh", beats the roll per new-work).
- **Signature interaction:**
  - The ID card tilts subtly with a light sweep when pressed.
  - The nav active pill springs between tabs.
  - Login: a slow drifting gradient mesh in the tenant hue.
  - Global loader: the school logo inside a rotating conic ring.
- **FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
