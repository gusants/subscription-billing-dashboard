---
name: Cadência Billing
description: A calm, dense, exact subscription-billing console, the category standard played at Stripe Dashboard craft.
colors:
  accent: 'light-dark(#4f46e5, #8b93f8)'
  accent-hover: 'light-dark(#4338ca, #a5b4fc)'
  accent-fg: 'light-dark(#ffffff, #0b1222)'
  accent-soft: 'light-dark(#eef2ff, #232457)'
  accent-soft-fg: 'light-dark(#4338ca, #c7d2fe)'
  canvas: 'light-dark(#f8fafc, #0b1222)'
  surface: 'light-dark(#ffffff, #121b2d)'
  surface-muted: 'light-dark(#f1f5f9, #18233a)'
  border: 'light-dark(#e2e8f0, #243049)'
  border-strong: 'light-dark(#cbd5e1, #334160)'
  fg: 'light-dark(#0f172a, #e2e8f0)'
  fg-muted: 'light-dark(#475569, #a3b1c6)'
  fg-subtle: 'light-dark(#64748b, #8796ad)'
  success: 'light-dark(#15803d, #4ade80)'
  success-soft: 'light-dark(#dcfce7, #0d2e1d)'
  danger: 'light-dark(#b91c1c, #f87171)'
  danger-soft: 'light-dark(#fee2e2, #3a1216)'
  warning: 'light-dark(#b45309, #fbbf24)'
  warning-soft: 'light-dark(#fef3c7, #352409)'
  chart-accent: 'light-dark(#4f46e5, #7078ee)'
  chart-grid: 'light-dark(#e2e8f0, #243049)'
typography:
  headline:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.25rem'
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: '-0.025em'
  figure:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 600
    lineHeight: 1.333
    letterSpacing: '-0.025em'
    fontFeature: '"tnum"'
  title:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.9375rem'
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'Inter Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 500
    lineHeight: 1.333
rounded:
  sm: '4px'
  md: '6px'
  lg: '8px'
  full: '9999px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '24px'
  2xl: '40px'
components:
  button-primary:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.accent-fg}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '0 14px'
    height: '36px'
  button-primary-hover:
    backgroundColor: '{colors.accent-hover}'
  button-secondary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.fg}'
    rounded: '{rounded.md}'
    padding: '0 14px'
    height: '36px'
  button-danger:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.danger}'
    rounded: '{rounded.md}'
    padding: '0 14px'
    height: '36px'
  button-danger-hover:
    backgroundColor: '{colors.danger-soft}'
  input-field:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.fg}'
    rounded: '{rounded.md}'
    padding: '0 10px'
    height: '36px'
  status-pill-success:
    backgroundColor: '{colors.success-soft}'
    textColor: '{colors.success}'
    typography: '{typography.label}'
    rounded: '{rounded.full}'
    padding: '2px 8px'
  status-pill-danger:
    backgroundColor: '{colors.danger-soft}'
    textColor: '{colors.danger}'
    typography: '{typography.label}'
    rounded: '{rounded.full}'
    padding: '2px 8px'
  status-pill-warning:
    backgroundColor: '{colors.warning-soft}'
    textColor: '{colors.warning}'
    typography: '{typography.label}'
    rounded: '{rounded.full}'
    padding: '2px 8px'
  status-pill-neutral:
    backgroundColor: '{colors.surface-muted}'
    textColor: '{colors.fg-muted}'
    typography: '{typography.label}'
    rounded: '{rounded.full}'
    padding: '2px 8px'
  card:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.lg}'
    padding: '16px'
  nav-item:
    textColor: '{colors.fg-muted}'
    rounded: '{rounded.md}'
    padding: '6px 10px'
  nav-item-active:
    backgroundColor: '{colors.accent-soft}'
    textColor: '{colors.accent-soft-fg}'
  sidebar:
    backgroundColor: '{colors.surface}'
    width: '240px'
---

# Design System: Cadência Billing

## Overview

**Creative North Star: "The Exact Ledger"**

Cadência is the category standard played straight: a calm, dense billing console in the lineage of the Stripe Dashboard. It refuses novelty and any world costume. Its distinction comes only from precision (money, dates, decline reasons set in tabular figures and placed where the eye expects them) and from finish: hairlines that line up, states that are never left blank, and two themes that are equally considered.

The ground is neutral slate with white (or deep slate) surfaces separated by 1px hairlines. A single indigo accent carries primary action, selection, focus and the active navigation item; state colours appear only where they mean something, and always alongside a word. Density is high but quiet: 14px body text, 36px controls, 16px card padding, 24px between page blocks.

Depth is flat. Cards are bordered, not lifted; shadow is reserved for things that float above the page. Primitives are React Aria Components, unstyled, so behaviour (focus, keyboard, announcements) comes from the platform layer and the look comes only from these tokens.

**Key Characteristics:**

- Neutral slate ground, white or deep-slate surfaces, 1px hairline borders.
- One indigo accent for action, selection, focus and current location.
- Status by dot plus word, never colour alone.
- Tabular figures on every amount, date, count and delta.
- Light and dark themes as equals, authored together through `light-dark()`.
- Flat at rest; a single soft panel shadow only for floating layers.
- Lucide line icons at 1.75 stroke.

## Colors

A cool, nearly colourless slate system with one indigo voice and three meaning-bound state hues; every token is a `light-dark()` pair, so each role is defined once for both themes.

### Primary

- **Ledger Indigo** (accent): primary buttons, focus outlines (2px, 2px offset), text caret, info toast icon, inline links and the selected option check. Hover deepens to **Pressed Indigo** (accent-hover) in light and lifts to a paler indigo in dark.
- **Indigo Wash** (accent-soft, with accent-soft-fg text): active sidebar item, selected toggles, focused table row, and text selection.
- **Chart Indigo** (chart-accent): the data colour for series and for the healthy (active) bar in charts; slightly desaturated in dark so bars do not glow.

### Neutral

- **Slate Canvas** (canvas): the page ground behind everything.
- **Paper Surface** (surface): cards, sidebar, table bodies, popovers, toasts, inputs, secondary buttons.
- **Muted Slate** (surface-muted): table header bands (at 60%), row hover (at 40-50%), skeletons, neutral pills, the theme-switcher track.
- **Hairline** (border) and **Firm Hairline** (border-strong): 1px dividers and card edges; border-strong for hover on fields and for dashed empty-state outlines.
- **Ink** (fg), **Graphite** (fg-muted), **Pewter** (fg-subtle): primary text; secondary text, labels and column headers; placeholders, icons, comparisons and footnotes. Chart grid lines use **Chart Hairline** (chart-grid), equal to border.

### State

- **Paid Green** (success / success-soft): paid charges, active subscriptions, positive deltas. Canceled and expired take the neutral tone.
- **Declined Red** (danger / danger-soft): failed and uncollectible charges, past-due subscriptions, decline reasons, destructive buttons, negative deltas.
- **Risk Amber** (warning / warning-soft): pending charges and incomplete subscriptions.

### Named Rules

**The One Voice Rule.** Indigo is the only accent. It marks what you can act on, what is selected, and where focus is; it is never decoration. Outside charts it never signals status; inside charts Chart Indigo is the data colour and stands for the healthy series, with red, amber and Pewter reserved for the states that need attention.

**The Meaning-Only State Rule.** Green, red and amber appear only where they mean paid, declined or risk, and always next to a word that says so. A state hue with no label is a defect.

**The Paired Themes Rule.** Every colour is authored as a `light-dark()` pair in one declaration. No role exists in one theme only, and dark is never derived by inversion.

## Typography

**Display Font:** none (the system has no display tier)
**Body Font:** Inter Variable, self-hosted via @fontsource-variable (with ui-sans-serif, system-ui, sans-serif)

**Character:** A single neutral grotesque at small sizes, carrying hierarchy through weight (400 / 500 / 600) and slight negative tracking rather than size jumps.

### Hierarchy

- **Headline** (600, 20px, 1.4, -0.025em): page H1, such as the customer name or "Customers".
- **Figure** (600, 24px, 1.333, -0.025em, tabular): KPI values on Overview.
- **Title** (600, 15px, 1.5): stat-card values and the wordmark; section H2s use 600 at body size.
- **Body** (400, 14px, 1.5): everything else, including table cells, descriptions and controls (controls at 500).
- **Label** (500, 12px): column headers, stat-card labels, pills, deltas, footnotes. Sentence case, no tracking added.

### Named Rules

**The Tabular Figures Rule.** Every amount, date, count, delta and pagination range is set with tabular numerals and money is right-aligned in tables, so columns of figures align digit for digit.

**The Weight Not Size Rule.** Hierarchy steps by weight within a 12-24px range. Nothing on a working screen is larger than the 24px KPI figure.

## Layout

An app shell with a 240px sticky sidebar (15rem) and a fluid main column capped at 1440px (90rem), centred. Main padding is 16px on mobile, 24px from 640px, and 40px horizontally with 32px vertically from 1024px. Page blocks stack with 24px gaps; inside cards, 8-16px gaps. The optional simulator panel docks to the right at 320px on desktop and overlays the content below 1024px.

Below 1024px the sidebar becomes a top bar: wordmark and theme switcher on one row, then a horizontally scrolling nav row (icons hidden under 640px). Customer detail runs a two-column grid (fluid main, 320px aside) from 1024px; on narrow screens the aside comes first and charges follow. Tables become stacked lists on small screens rather than scrolling sideways. Overview places KPI cards in a responsive grid above chart cards.

Breakpoints are Tailwind defaults: 640px (sm), 1024px (lg).

## Elevation & Depth

Flat by default. Cards, tables, the sidebar and stat rows sit on the canvas separated by 1px hairlines and a surface-versus-canvas tone step, with no shadow. One soft two-layer shadow, **panel**, exists for layers that float over content: select popovers, toasts, chart tooltips, and the simulator panel when it overlays on small screens. Its colour is itself a `light-dark()` token, faint in light and denser in dark so it still reads.

### Shadow Vocabulary

- **Panel** (`box-shadow: 0 1px 2px var(--shadow-color), 0 12px 32px -8px var(--shadow-color)`): floating layers only.
- **Thumb** (`box-shadow: 0 1px 2px var(--shadow-color)`): the selected segment of the theme switcher, lifting it off the track.

### Named Rules

**The Float-Only Shadow Rule.** A shadow means "this is above the page". Resting cards never carry one; border and tone do the separating.

## Shapes

Gently rounded, small radii in three steps: 6px for anything you press or type into (buttons, inputs, nav items, list options, skeleton blocks, tooltips), 8px for containers (cards, popovers, toasts, the table header's top corners, empty states), and full pills for status. Chart bars round only their free end (4px). Borders are always 1px solid; dashed border-strong outlines mark empty or absent content.

## Components

### Buttons

Quiet and compact; colour reserved for the one action that matters.

- **Shape:** gently rounded (6px), 36px tall, 14px horizontal padding, 500 weight, 8px gap to a 16px icon.
- **Primary:** indigo fill with white text (deep-slate text in dark); one per view region.
- **Secondary (default):** paper surface, 1px hairline, ink text; hover firms the border.
- **Danger:** paper surface, red text, red border at 40%; hover fills with Declined Red wash.
- **Hover / Focus:** colour transition only; focus is the global 2px indigo outline at 2px offset. Disabled at 50% opacity, pending at 70%.

### Status Pill

The system's signature: a full-radius pill in the soft wash of its tone, carrying a 6px dot in currentColor and a 12px medium label. Tones: success, danger, warning, neutral. The word is mandatory; the dot is redundant reinforcement, never the sole signal.

### Cards / Containers

- **Corner Style:** 8px.
- **Background:** paper surface on slate canvas.
- **Shadow Strategy:** none at rest (see Elevation).
- **Border:** 1px hairline.
- **Internal Padding:** 16px; stat cards 16px by 14px with a 12px Graphite label over a 15px tabular value; KPI cards add a 24px figure and a 12px delta line (arrow icon plus signed text, green or red by whether the change is good, Graphite when flat) followed by a Pewter comparison.

### Chart Card

A card holding an H2 title and Graphite description, the chart (hidden from assistive tech), a screen-reader text summary, and a "View as table" disclosure that reveals the same data as a tabular-figure table. Charts are Recharts drawn with token colours: series in Chart Indigo over Chart Hairline grid; status bars toned by meaning (danger, warning, neutral Pewter; healthy in Chart Indigo) with their text labels on the axis and counts at the bar end.

### Tables

Header band in Muted Slate at 60% with rounded top corners, 12px Graphite column labels, cells 16px horizontal by 10-12px vertical, each row separated by a hairline top border. Row hover tints Muted Slate; keyboard focus fills Indigo Wash. Amounts right-aligned and semibold; decline reasons in red medium with a Graphite outcome line beneath.

### Inputs / Fields

- **Style:** 36px tall, paper surface, 1px hairline, 6px radius, 15px Pewter leading icon, Pewter placeholder.
- **Focus:** border turns indigo; the select trigger turns indigo while pressed.
- **Select popover:** 8px radius, panel shadow, 4px inset; options 6px radius, Muted Slate on focus, an indigo check on the selected one.

### Navigation

Sidebar on paper surface with a right hairline. Items are 6px-radius rows with a 16px icon and 500-weight Graphite label; hover tints Muted Slate and inks the text; the current page (and the open Simulator toggle) fills with Indigo Wash and Indigo text. Breadcrumbs are Graphite with a 14px chevron, the current crumb in Ink.

### Feedback

Skeletons are pulsing Muted Slate blocks at 6px radius shaped like the content they replace. Empty states are dashed Firm Hairline boxes with a centred title, Graphite copy capped near 24rem, and an optional action. Toasts stack bottom-right (max 24rem), paper surface with panel shadow, an 18px tone icon (green success, red error, indigo info) beside a medium title and Graphite description, with a 28px dismiss button.

## Do's and Don'ts

### Do:

- **Do** set every amount, date, count and delta in tabular figures, and right-align money in tables.
- **Do** pair every state colour with its word: pills carry dot plus label, chart bars carry axis labels, deltas carry signed text.
- **Do** author new colours as `light-dark()` pairs in `src/index.css` and map them through `@theme inline`; check both themes before shipping.
- **Do** build interactive pieces on React Aria Components and style them only with these tokens.
- **Do** use Lucide line icons at 1.75 stroke (2 only for tiny check and delta arrows), 14-18px, `aria-hidden` beside text.
- **Do** give every data surface a loading skeleton, an empty state and an error with retry.
- **Do** give charts a text summary and a table view of the same data.

### Don't:

- **Don't** introduce a second accent hue, or use indigo as a status colour in pills, text or icons.
- **Don't** use green, red or amber decoratively or without an accompanying label.
- **Don't** put shadows on resting cards; reserve the panel shadow for floating layers.
- **Don't** add a display tier or type above 24px on working screens.
- **Don't** add uppercase tracked labels or kickers above headings; labels stay sentence case at 12px.
