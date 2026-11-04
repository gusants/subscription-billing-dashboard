# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: a billing operations analyst at **Cadência**, a fictional Brazilian B2B SaaS that sells monthly scheduling plans to music schools and independent teachers. Many of Cadência's customers pay by Pix or boleto; others by card. The analyst opens the dashboard during the working day to see revenue health, find customers who are overdue, understand why a charge failed, and decide what to do next (retry, wait, contact, cancel).

Secondary audience: recruiters and hiring managers who open the live demo or the repository to evaluate the author's frontend and fullstack skills. They judge it as a credible product, so the dashboard serves the analyst's job first and never turns into a guided showcase.

## Product Purpose

A subscription billing dashboard that consumes the Subscription Payments API (Project 1). It shows customers, subscriptions, charges and payment attempts, revenue metrics, and an AI risk summary per customer, plus a simulator that changes the data live.

Success: the analyst can answer "how is revenue doing, who is at risk, and why did this payment fail" in seconds, and an evaluator who clicks the demo sees data react to actions without a backend.

## Positioning

Built around the Brazilian payment reality: Pix, boleto, and card retries with explicit decline reasons, values in BRL. The demo mode (MSW with an in-browser database seeded from JSON) makes every action change the screens and metrics live, and a simulator drives events (approve Pix, expire boleto, force a card decline, advance retry time) that a static mock dashboard cannot.

## Operating Context

- Two run modes: API mode against Project 1 locally (`VITE_API_URL`), and demo mode with MSW and `src/mocks/seed.json`, deployable as a static site.
- Screens: Overview (MRR, active subscriptions, overdue subscriptions, delinquency rate, revenue by month, subscriptions by status), Customers (search, status filter, pagination), Customer detail (subscription data, charge and attempt timeline with decline reasons, AI summary card with risk level and suggested action), Plans (list and create form), Simulator side panel.
- Every screen handles loading (skeleton), empty (useful message), error (retry), and action feedback (toast).
- Desktop is the primary working environment; layouts must remain usable on smaller screens.

## Capabilities and Constraints

- Interface language: English. Currency stays BRL (amounts arrive in cents and are formatted by a single utility). Pix and boleto are kept as proper nouns.
- Types are generated from Project 1's OpenAPI; until that phase, MSW handlers follow the contract defined in Project 1's plans.
- Stack already set: React 19, Vite, TypeScript strict, Tailwind v4, TanStack Router / Query / Form, Zod, Zustand (persisted to localStorage), Recharts, React Aria Components (unstyled primitives), MSW, Vitest, Playwright.
- React 19 features used where they fit for real: `useActionState`, `useOptimistic` (retry charge), form `action` with `useFormStatus`.
- In demo mode the AI summary returns pre-written summaries from the seed.
- Open: dark theme is optional and undecided.

## Brand Commitments

- Product owner in the fiction: **Cadência** (keep the cedilla). The dashboard is Cadência's internal billing tool.
- Voice: plain, operational English; states facts and next actions, no marketing tone.
- Visual standing preference (chosen 2026-11-03): the category standard, executed at full craft. Quality bar: Stripe Dashboard.

## Evidence on Hand

- No real customers, metrics, or testimonials exist. All data is fictional seed data and must read as plausible, never as claims about a real business.
- Planning docs in `_local/` (projeto-2-dashboard-react.md, decisoes-iniciais.md, plano-01..08).

## Product Principles

1. The analyst's next decision comes first: every screen answers "what needs attention and why".
2. Money is exact: BRL formatting, cents-precise, consistent everywhere.
3. Failures are explained, not just flagged: decline reasons and retry state are always visible.
4. The data is alive: actions and simulator events visibly propagate to every affected screen.
5. Credible over flashy: it should feel like a tool a real billing team relies on.

## Accessibility & Inclusion

WCAG 2.2 AA: contrast, full keyboard navigation, visible focus, labelled fields, skip link, reduced-motion support. Status must never rely on color alone.
