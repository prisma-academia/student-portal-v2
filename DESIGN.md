---
name: Student Portal
description: The student's ID card and statement of account, in their school's colour.
colors:
  primary: "#b42318"
  primary-foreground: "#ffffff"
  primary-soft: "color-mix(in oklch, var(--primary) 10%, var(--card))"
  primary-ink: "color-mix(in oklch, var(--primary) 78%, oklch(0.2 0.02 40))"
  id-card-field: "color-mix(in oklch, var(--primary) 86%, black)"
  ring: "color-mix(in oklch, var(--primary) 70%, transparent)"
  paper: "color-mix(in srgb, var(--primary) 1.5%, #faf7f2)"
  card: "oklch(1 0.002 75)"
  ink: "oklch(0.22 0.012 40)"
  ink-muted: "oklch(0.47 0.014 45)"
  secondary: "color-mix(in srgb, var(--primary) 3%, #f0ece6)"
  muted: "color-mix(in srgb, var(--primary) 2%, #f0ece6)"
  hairline: "oklch(0.9 0.008 70)"
  input-stroke: "oklch(0.88 0.01 70)"
  success: "oklch(0.52 0.12 155)"
  success-soft: "oklch(0.95 0.04 155)"
  warning: "oklch(0.6 0.13 70)"
  warning-soft: "oklch(0.96 0.05 85)"
  danger: "oklch(0.55 0.2 27)"
  danger-soft: "oklch(0.95 0.035 25)"
  night-paper: "color-mix(in oklch, var(--primary) 4%, oklch(0.17 0.008 40))"
  night-card: "color-mix(in oklch, var(--primary) 4%, oklch(0.215 0.009 40))"
  night-ink: "oklch(0.95 0.006 75)"
  night-ink-muted: "oklch(0.72 0.012 60)"
  night-primary-soft: "color-mix(in oklch, var(--primary) 22%, var(--card))"
  night-primary-ink: "color-mix(in oklch, var(--primary) 45%, oklch(0.95 0.01 75))"
  night-hairline: "oklch(1 0 0 / 9%)"
typography:
  display:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  metric:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontFeature: "\"tnum\" 1"
  headline:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "\"Source Sans 3\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: "\"Source Sans 3\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "\"Source Sans 3\", ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.33
  numeral:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.01em"
    fontFeature: "\"tnum\" 1"
rounded:
  sm: "7px"
  md: "10.5px"
  lg: "14px"
  xl: "18.9px"
  statement: "20px"
  id-card: "24px"
  auth-card: "28px"
  avatar: "30%"
  logo: "28%"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "28px"
  4xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "color-mix(in oklch, var(--primary) 88%, black)"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.muted}"
  button-ghost-hover:
    backgroundColor: "{colors.muted}"
  quick-action-chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "44px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
    height: "44px"
  nav-pill-active:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-ink}"
    rounded: "{rounded.full}"
    padding: "0 14px"
    height: "40px"
  tab-bar-pill-active:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-ink}"
    rounded: "{rounded.full}"
    width: "56px"
    height: "32px"
  segmented-track:
    backgroundColor: "{colors.muted}"
    rounded: "{rounded.full}"
    padding: "4px"
    height: "44px"
  status-pill-success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 10px 0 6px"
    height: "24px"
  status-pill-warning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "color-mix(in oklch, var(--warning) 75%, black)"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 10px 0 6px"
    height: "24px"
  status-pill-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 10px 0 6px"
    height: "24px"
  count-badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
    height: "18px"
  id-card:
    backgroundColor: "{colors.id-card-field}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.id-card}"
    padding: "16px"
  statement-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.statement}"
    padding: "20px"
  statement-row:
    textColor: "{colors.ink}"
    padding: "14px 16px"
  date-tile:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-ink}"
    rounded: "{rounded.md}"
    size: "48px"
  sheet:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.id-card}"
  auth-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.auth-card}"
    padding: "24px"
---

# Design System: Student Portal

## Overview

**Creative North Star: "The ID Card and the Statement"**

The portal is a student's identity document and their account statement, issued by their own school. One object carries identity: the ID card, a filled field of the school's colour with a faint guilloche like security print, the passport photo framed in white, the reg number set in tabular numerals. Everything else is a statement: warm paper, a tinted near-black ink, hairline-ruled rows that run to the screen edge, each row ending in an action (pay, download, read). The system is calm and premium rather than busy; it refuses the admin dashboard of sidebars, stat-tile grids and equal cards.

Because one codebase ships to many schools, the colour system is relational, not fixed. Each school's `NEXT_PUBLIC_PRIMARY_COLOR` is written onto `<html>` as `--primary`, with `--primary-foreground` picked for contrast (white, or near-black `#1f1a17` for light school colours). Every brand tint, the soft fill, the readable ink, the ID card field, the focus ring, the paper itself, is derived from that one variable. The hex values in this file are the fallback school (`#b42318`); the relationships are the design.

Density is phone-first: 44px touch targets, a sticky top bar and a bottom tab bar below 768px, a single column that becomes a two-column ledger at 1024px. Light, dark and match-device themes are first-class, chosen from the profile menu. Motion is sparing and physical: a spring on the active nav pill, a tilt and light sweep on the ID card, a slowly drifting mesh behind sign-in, the school logo in a rotating conic ring while loading. All of it stops or slows under reduced motion.

**Key Characteristics:**
- One school colour, used as a committed field (ID card, primary actions, count badge) and as soft/ink tints (active nav, date tiles, links).
- Warm paper ground and one tinted ink family; neutrals lean a breath toward the school colour.
- Statement rows on hairlines, not boxed cards; filled surfaces are few and purposeful.
- Manrope for headings and every figure (tabular); Source Sans 3 for reading.
- Status always shown as icon plus word, never colour alone.
- Corners tight inside, soft outside.

## Colors

A warm paper-and-ink palette that takes its one accent from whichever school is running it.

### Primary
- **School Colour** (`--primary`, fallback #b42318): set per tenant from env. Fills primary buttons, the unpaid-fee count badge, the skip link, caret colour, and (darkened 14% toward black) the ID card field. Never hard-coded in components.
- **School Colour Ink** (`primary-ink`, 78% primary into warm near-black in oklch; 45% into warm white in dark): the readable form of the school colour on paper. Active nav label, "See all" links, the owed amount in the statement, date-tile numerals, empty-state icons.
- **School Colour Soft** (`primary-soft`, 10% primary into card in oklch; 22% in dark): the quiet brand fill. Active nav pill, date tiles, avatar fallback, empty-state icon disc, calendar today cell.
- **ID Card Field** (86% primary mixed with black in oklch): reserved for the ID card surface.
- **Focus Ring** (`ring`, primary at 70% opacity): every `:focus-visible` outline (2px, offset 2px).

### Neutral
- **Warm Paper** (`paper`, #faf7f2 with 1.5% primary, mixed in sRGB): page ground in light mode.
- **Card White** (oklch 1 0.002 75): filled surfaces, inputs, sheets, popovers, the bottom tab bar.
- **Warm Ink** (oklch 0.22 0.012 40): all primary text.
- **Muted Ink** (oklch 0.47 0.014 45): meta lines, dates, descriptions, inactive nav.
- **Linen** (`secondary` 3% / `muted` 2% primary into #f0ece6, sRGB): hover rows, segmented-control track, ghost and outline hover, fee-detail fact tiles.
- **Hairline** (oklch 0.9 0.008 70) and **Input Stroke** (oklch 0.88 0.01 70): row rules, card borders, field strokes.
- **Night Paper / Night Card** (warm near-black with 4% primary, oklch): dark-mode ground and surface. Dark hairlines are white at 9%, input strokes white at 14%.

### State
- **Paid Green** (`success` / `success-soft`), **Due Amber** (`warning` / `warning-soft`; text darkened 25% toward black on light for contrast), **Overdue Red** (`danger` / `danger-soft`). Each has a dark-mode pair. Used in status pills, attention-row icon discs, the all-paid panel and the carry-over panel.

### Named Rules
**The One Variable Rule.** Every brand colour is a `color-mix()` of `var(--primary)`. A new surface that needs the school's colour derives it from `--primary`, `--primary-soft`, `--primary-ink` or `--ring`; it never names a hue.

**The sRGB Neutrals Rule.** Neutrals tinted toward the school mix in sRGB at 3% or less; brand tints (soft, ink, ring, ID field) mix in oklch. An oklch mix drags a near-grey's hue all the way to the primary (a red school's paper went rose).

**The Contrast-Picked Ink Rule.** Text on the school colour is always `--primary-foreground`, chosen by `foregroundOn()`. Never assume white on primary.

**The Words-With-Colour Rule.** Paid, due, overdue and fail always appear with an icon and a word. Colour confirms; it never carries the meaning alone.

## Typography

**Display Font:** Manrope (via `--font-display`, system sans fallback)
**Body Font:** Source Sans 3 (via `--font-body`, system sans fallback)

**Character:** Manrope's geometric heft gives headings and money the weight of a printed card and statement; Source Sans 3 keeps long memos and meta lines easy on small screens.

### Hierarchy
- **Display** (800, 2.75rem, 1.05, -0.03em): the school name on the desktop sign-in aside. Only there.
- **Metric** (800, 2.75rem on Academics / 2rem on Home, line-height 1, tabular): the CGPA.
- **Headline** (800, 1.5rem rising to 1.75rem at 640px, 1.25, -0.02em): page titles.
- **Title** (800, 1.125rem, 1.25, -0.02em): section headings ("Needs your attention", "To pay"). Sheet titles use 700 at the same size; the statement sentence uses 700 at 1.25rem to 1.5rem.
- **Body** (400, 0.9375rem, 1.55): base reading size; descriptions held to `max-w-prose`. Row titles are body at 600.
- **Body Small** (400, 0.875rem): the workhorse for meta lines, dates, row details, buttons.
- **Label** (600, 0.75rem): status pills, tab-bar labels, grading-scheme notes.
- **Numeral** (Manrope 700 to 800, tabular, -0.01em): every naira amount, GPA, unit count and reg number, via the `.num` utility.

### Named Rules
**The Tabular Money Rule.** Any figure a student compares or copies (amounts, GPA, CGPA, units, reg numbers, references) is set in `.num`: Manrope with `tnum`. Prose numerals stay in the body face.

**The Heavy Heading Rule.** h1 to h3 are Manrope at 800 with -0.02em tracking and balanced wrapping. Body copy is never set in Manrope, and headings are never set in Source Sans 3.

## Layout

Content sits in a centred column (max 72rem) with 16px gutters, 24px from 640px. Below 768px the app has a sticky 64px top bar (logo left, mini ID chip right) and a fixed bottom tab bar of five equal cells (min 60px tall, safe-area padded); main content reserves 88px plus the safe-area inset at its foot. From 768px the tab bar disappears and the same five destinations become pill links in the top bar.

Home is a named-area grid: one column in reading order (ID card, attention, standing, updates, quick actions) with 28px gaps, becoming two columns at 1024px (26rem left, fluid right; 40px column gap, 24px row gap) so identity and standing sit left of attention and updates. Other pages stack sections at 20 to 24px.

Section headings sit 12px above their list. Rows pad 16px horizontally (20px from 640px) and 12 to 16px vertically. Sheets pad 20px (24px from 640px). The auth screen is a two-column grid at 1024px (fluid aside, 28rem card, 64px gap) and a single centred card below.

**The Bleed Rule.** Statement lists bleed to the screen edge below 1024px (negative margins equal to the gutter) so rows read like a native list and their content aligns with section headings; from 1024px the rules stay inside the grid column.

## Elevation & Depth

A hybrid: the page is flat paper with hairline rules, and only a few objects lift off it. Depth comes from two warm-tinted shadows, translucent blurred chrome, and the ID card's own lighting (a top-right radial highlight and a bottom shade over the guilloche).

### Shadow Vocabulary
- **Soft** (`box-shadow: 0 1px 2px oklch(0.3 0.02 50 / 0.06), 0 4px 16px -6px oklch(0.3 0.02 50 / 0.12)`): primary buttons, the payments statement, the payment-status card, the loader's logo disc, sign-in feature icons.
- **Lift** (`box-shadow: 0 2px 4px oklch(0.3 0.02 50 / 0.06), 0 18px 40px -18px oklch(0.3 0.04 40 / 0.35)`): the ID card, the sign-in card, sheets, the floating profile save bar.

### Named Rules
**The Two Shadows Rule.** Only Soft and Lift exist. Lift is for objects that are held or that float over content; Soft is for filled surfaces resting on the page. Rows and lists cast nothing.

**The Chrome-Only Blur Rule.** Backdrop blur belongs to fixed chrome: the sticky top bar (paper at 70 to 85%), the bottom tab bar (card at 80 to 92%), and the sheet scrim (warm ink at 45%, 2px blur). Content cards are solid `card`; the sign-in card was moved off glass for this reason.

## Shapes

The base radius is 14px (`--radius`), scaled into 7 / 10.5 / 14 / 18.9px steps. Corners are tight on small inner things and soft on large outer ones: buttons, inputs, date tiles and fact tiles at 10.5px; dropdowns, empty states and the floating save bar at 18.9px; the payments statement and desktop sheets at 20px; the ID card, phone bottom-sheet top corners and payment-status card at 24px; the sign-in card at 28px. Pills (nav, status, chips, quick actions, segmented tabs, count badge) are fully round. Portraits are squircle-like: student avatars at 30%, the ID-card photo at about 17.6px with a 3px white ring, the school logo tile at 28%.

Borders are 1px hairlines; empty states use a dashed hairline. The ID card clips its guilloche and sheen inside its rounded field.

**The Soft-Outside Rule.** A container's radius is never smaller than the radius of what it holds; the larger and more "held" the object, the softer its corner.

## Components

### Buttons
Confident but quiet; they press in rather than bounce.
- **Shape:** gently rounded (10.5px); 44px tall on phones, 40px from 768px.
- **Primary:** school colour with contrast-picked text, Soft shadow, 600 weight at 0.875rem, 16px side padding. Large size keeps 44px with 20px padding and 0.9375rem text.
- **Hover / Focus / Active:** hover darkens to 88% primary with black; focus shows the ring border plus a 2px ring at 30%; active scales to 0.98. Transitions run 200ms on the expo-out curve.
- **Outline:** card fill, hairline border, linen on hover. The default secondary action ("All fees", "See results", "Try again").
- **Ghost / Secondary / Destructive:** ghost turns linen on hover; destructive is a 10% red tint with red text, never a solid red block.
- **Quick-action chips:** outline buttons made fully round, in a horizontally scrolling row on phones.

### Status Pills
- **Style:** 24px tall, fully round, soft state fill with state-coloured text, a 14px filled icon then the word (Paid, Due, Overdue).
- **State:** success, warning, danger, and a neutral (muted fill, muted ink).

### Cards / Containers
- **ID Card and Payments Statement** are the primary filled surfaces. The statement is card white, 20px radius, hairline border, Soft shadow, 20 to 24px padding, opening with a sentence ("You owe ₦X across N fees.") and one primary action. When nothing is owed it becomes a success-tinted panel with a hairline in 20% green.
- **Sheets:** card white with Lift; a bottom sheet with a grab handle on phones (max 88dvh), a centred 32rem panel from 640px.
- **Empty states:** card white, dashed hairline, 18.9px radius, a 44px school-soft icon disc, a Manrope 700 title.
- **Fact tiles** inside sheets: linen at 60%, 10.5px radius, 12px padding.

### Statement Rows
The system's default list. Full-bleed rows divided by hairlines, a title in body 600, one or two muted meta lines, figures right-aligned in `.num` with a status pill below, and a trailing chevron when the row opens a sheet. Hover and focus fill the row with linen at 60%. Attention rows lead with a 40px tinted icon disc (danger, warning or neutral) and end in buttons that stack full-width on phones. Event rows lead with a 48px school-soft date tile (day numeral over short month).

### Inputs / Fields
- **Style:** card fill, 1px input stroke, 10.5px radius, 44px tall, 16px text on phones (no iOS zoom) and 15px from 640px.
- **Focus:** border shifts to the ring colour with a 3px ring at 50%.
- **Error / Disabled:** red border with a 20% red ring; disabled at 50% opacity. Autofill keeps the card surface instead of the browser's blue.

### Navigation
- **Top bar:** paper at 70 to 85% with heavy blur, hairline at 70%. Desktop links are 40px pills, 0.875rem at 600, muted until active. The active link sits on a school-soft pill that springs between tabs (stiffness 420, damping 34) with school-ink text.
- **Bottom tab bar (below 768px):** card at 80 to 92% with blur, five cells with a 22px icon (stroke 2.2 active, 1.8 idle) over a 0.75rem label; the active icon sits in a 56 by 32px school-soft pill that springs between cells.
- **Count badge:** school-colour circle (18px) with the unpaid-fee count, ringed in card colour on the tab bar.
- **Mini ID chip / profile menu:** avatar plus reg number in `.num`, opening a 18rem dropdown with profile, password, appearance (light, dark, match my device) and sign out.
- **Segmented tabs** (Academics, Resources): a fully round linen track 44px tall with 36px round triggers.

### ID Card (signature)
The student's passport photo (squircle, 3px white ring), name in Manrope 800, reg number as a tappable `.num` button that copies it, and programme, level and set as translucent white pills, on the ID card field at 24px radius with Lift. A 14-line guilloche sits at 14% opacity. Pressing tilts it (scale 0.985, rotateX 3, rotateY -2, spring 380/26, perspective 900) and sweeps a band of light across it over 900ms.

### Gradient Mesh and Brand Loader (signature)
Sign-in sits on three blurred blobs (64px blur, 55% opacity, 40% for the third) mixed from the school colour with warm amber and rose, drifting over 26, 32 and 36 seconds, with a 7% fractal-noise grain; dark mode drops blobs to 35% and screens the grain. The loader puts the school logo in a card disc inside a conic ring of the school colour (1.1s spin) with a breathing halo (2.2s), and rotates plain-language captions.

## Do's and Don'ts

### Do:
- **Do** derive every brand colour from `var(--primary)` and put text on it in `--primary-foreground`.
- **Do** mix tinted neutrals in sRGB (3% or less) and brand tints in oklch.
- **Do** list fees, memos, events, results and documents as full-bleed statement rows on hairlines, each ending in an action.
- **Do** set every amount, GPA, unit count and reg number in `.num` (Manrope, tabular).
- **Do** pair every state colour with an icon and a word.
- **Do** keep touch targets at 44px minimum on phones.
- **Do** use Lift only for held or floating objects (ID card, sign-in card, sheets, floating bars) and Soft for resting filled surfaces.
- **Do** stop the mesh and halo, slow the loader ring, and drop the sheen under `prefers-reduced-motion`.

### Don't:
- **Don't** hard-code a school's hue or tune a component to the fallback red; it must hold for any school colour, light or dark.
- **Don't** build the admin-dashboard pattern: no sidebar, no stat-tile grid, no rows of equal boxed cards.
- **Don't** wrap lists in bordered cards; the filled surfaces are the ID card, the statement, sheets, the sign-in card and empty states.
- **Don't** put backdrop blur or translucency on content cards; blur is for fixed chrome and the sheet scrim.
- **Don't** add shadows beyond Soft and Lift.
- **Don't** show paid, due or overdue by colour alone.
- **Don't** set body copy in Manrope or headings in Source Sans 3.
