# Career Transition Evidence Platform — Build Specification (v2.1)

> **Audience:** an AI coding agent (Codex, AntiGravity or similar) building the MVP end to end.
> **Status:** authoritative. Where this document gives a default, use it. Where something is genuinely ambiguous, choose the simplest option consistent with this document, and record the choice in `docs/ASSUMPTIONS.md`.
> **Working title:** configurable via `NEXT_PUBLIC_APP_NAME` (default `"Transition"`). Do not hard-code a brand name.

### Revision note (v2 → v2.1): extensibility and rebuildability

Product scope is unchanged. The structure was revised so that later versions can add features or replace parts without rewrites:

| # | Change | Why |
|---|---|---|
| 1 | **Modular monolith** with enforced module boundaries (section 6) replacing a type-based folder layout | Features stay isolated, and a module can later be extracted or rewritten |
| 2 | **Ports and adapters** for every external service (payments, email, analytics, repo host, rate limiting) | Swap Razorpay → Stripe, PostHog → anything, GitHub → GitLab without touching domain code |
| 3 | **Registries** for check runners, evidence types, engine strategies and analytics events (section 6.7) | New capabilities are added by adding a file, not editing core logic |
| 4 | **Engine as a staged pipeline** with injected `EngineConfig`, `ENGINE_VERSION` and **reason codes** instead of strings (section 10) | Tune, A/B test and re-copy without breaking stored plans |
| 5 | **Versioned stored data** (`schema_version`, `engine_version`, `payload_version`) and Zod-on-read upgraders | Old rows survive format changes |
| 6 | **Text + CHECK columns** instead of native Postgres enums; provider-agnostic payments; expiring entitlements (section 9) | Cheap migrations, subscriptions and Stripe later |
| 7 | **Immutable slugs with aliases and `retired` status** in content (section 8) | Renaming or removing content never orphans user data |
| 8 | **Thin app layer, API-ready services, user-lifecycle hooks, architecture tests, extension recipes** (sections 5.4, 15) | Mobile or public API later, safe account deletion as modules grow |

---

## 0. How to use this document

1. Read sections 1–3 for product intent. Read sections 4–14 for what to build. Section 15 gives the build order, and each phase has acceptance criteria.
2. Build **in the phase order of section 15**. Do not skip ahead. Each phase must pass `pnpm typecheck && pnpm lint && pnpm test && pnpm arch:check` before the next begins.
3. **Do not invent product content.** Roles, skills, edges, paths and projects live in `/content` as YAML/Markdown. Create *clearly marked draft* seed content (section 8.4) so the app runs, and flag it with `status: draft`. A human will author the real content.
4. **No LLM or AI features in the MVP.** The core product is deterministic. Leave feature-flag stubs only (section 12.3).
5. Follow the engineering conventions in sections 5.3 **and 5.4**. The extensibility rules in 5.4 are mandatory and are enforced by tooling.
6. Out-of-scope items (section 2.2) must **not** be built, even if they look easy.
7. When something is built that a future developer would extend (a check type, an evidence type, a payment provider, a transition), make sure the recipe in `docs/EXTENDING.md` (section 6.8) is accurate.

---

## 1. Product overview

### 1.1 One-line positioning

> **The evidence platform for experienced tech professionals moving into cloud, AI and security: keep your seniority, upgrade your stack, prove the transition with verified projects.**

### 1.2 Problem

Experienced engineers (5–20+ years) hold valuable skills on older stacks (Java/Spring, .NET, on-prem, manual QA, classic DBA). They need to move toward cloud, AI application engineering, DevOps/platform or DevSecOps without restarting as beginners. Existing options fail them:

- Generic courses and roadmaps assume a beginner, so they don't say what the person can *skip*.
- Completion certificates prove time spent, not ability.
- Generic AI gap analysers and general-purpose LLMs produce roadmaps, but not *verified evidence*.

### 1.3 Core loop

`Assess → Map → Learn → Build → Prove → Transition`

1. **Assess:** user declares current role, years of experience, and current skills.
2. **Map:** a deterministic engine produces a transition map: *Keep / Upgrade / Learn*, with effort estimates and reasons.
3. **Learn:** curated external resources per skill.
4. **Build:** an ordered sequence of projects that closes the gaps. Each project maps to skills and competency levels.
5. **Prove:** user submits a public GitHub repo. Automated checks verify evidence of specific skills. Results appear on a shareable portfolio, with the evidence type shown.
6. **Transition:** the portfolio is the artefact the user takes to employers.

### 1.4 Competitive context and design implications

| Competitor type | Examples | Implication for this build |
|---|---|---|
| Horizontal AI gap-analysis startups | Leapr (resume upload, AI gap report, generated projects, cohorts, free tier, recruiter affiliate programme) | The gap map will be free everywhere. **Do not gate the map.** Do not build cohorts, "twin" matching, resume parsing or market-salary dashboards. |
| Free role roadmaps | roadmap.sh | Win on personalisation (skip-list from the user's stack), not on content volume. |
| Mega learning platforms | Coursera + Udemy, LinkedIn Learning, Pluralsight | Do not build a course catalogue or LMS. Link out to external resources. |
| Skills-assessment / L&D tools | HackerEarth L&D and similar | B2B is a post-MVP motion. Keep the data model tenant-ready (section 9.5), but build no enterprise features. |
| General LLMs | ChatGPT, Claude | A plain roadmap is a commodity. The product's value is **calibrated skip-lists, engineering-grade projects, automated verification and a shareable evidence portfolio.** |

### 1.5 Product principles (use as tie-breakers)

1. **Don't make experienced people start over.** Every screen should show what they already have before what they lack.
2. **Explainable over clever.** Every recommendation carries a human-readable reason.
3. **Evidence over completion.** A skill is "demonstrated" only with recorded evidence, and the evidence type is always visible.
4. **Honest labels.** Never display "Verified" for self-declared data.
5. **Quality over quantity.** Few transitions, done deeply.
6. **Built to change.** Every part that is likely to be replaced or extended sits behind a seam (a port, a registry or a versioned format).

---

## 2. Scope

### 2.1 MVP: in scope

- Auth (GitHub + Google), account deletion.
- Onboarding wizard (current role, experience, skills, target role).
- Deterministic transition engine, map UI, saved plan snapshots, plan-update notices.
- Project catalogue with skill coverage; guided projects (Markdown content) and curated external projects.
- Progress tracking and a six-level competency model.
- Evidence: self-declared, rubric self-review, **automated GitHub repo verification**.
- Public portfolio page (privacy-controlled), print-friendly for PDF export.
- Payments (Razorpay, one-time purchases) with an entitlements system.
- Programmatic SEO pages generated from the content graph.
- Content-as-code pipeline: schema, validator, seeder, engine-preview tool.
- Analytics events, transactional email, error monitoring.

### 2.2 Out of scope: do not build

Course marketplace or LMS · community, forums, cohorts, chat · "find your twin" matching · resume upload or parsing · job board or job applications · market/salary intelligence · AI chatbot or any LLM feature · in-browser coding sandbox · enterprise dashboards, SSO, seat management · mobile apps · microservices · Kubernetes for the product's own hosting · multi-language UI · a second payment provider (build the *seam*, not the second adapter) · a separate public REST API (build services API-ready, not the API).

### 2.3 Launch content target (authored by a human; seed drafts are placeholders)

- Roles: ~8 current roles, ~6 target roles.
- Skills: ~60. Projects: ~15.
- **Two fully authored transitions:** `java-backend-developer → cloud-engineer` and `java-backend-developer → ai-application-engineer`. A third (`engineering-manager → ai-engineering-manager`) exercises the manager role kind.

---

## 3. Users and journeys

### 3.1 Personas (also used as golden test fixtures, section 10.8)

- **P1, Senior Java Developer:** 12 years, Java, Spring, SQL, Oracle, REST, Jenkins, on-prem. Target: AI/Cloud Engineer.
- **P2, QA Engineer:** 9 years, manual and Selenium testing, Java. Target: DevOps Engineer.
- **P3, Engineering Manager:** 14 years, delivery management, system design review. Target: AI Engineering Manager (needs *understanding*-level skills, not hands-on).

### 3.2 Primary journey

1. Lands on an SEO page such as `/transitions/java-backend-developer-to-cloud-engineer`.
2. Clicks "See my personal map" and completes the onboarding wizard. **No sign-up is required to see the map** (state is held in the session, then saved on sign-in).
3. Sees the map: Keep / Upgrade / Learn, estimated hours, recommended project sequence.
4. Signs in to save the plan.
5. Hits the paywall at guided project walkthroughs and repo verification.
6. Builds a project, submits a repo, gets verified skills, shares the public portfolio.

---

## 4. Functional requirements

Each requirement has an ID. "AC" = acceptance criteria. Implement exactly what is stated.

### FR-1 Authentication and account

- FR-1.1 Sign in with GitHub or Google via Auth.js. No email/password.
- FR-1.2 On first sign-in, require acceptance of Terms and Privacy Policy (consent stored with timestamp and version).
- FR-1.3 Account deletion: `/settings/account` → "Delete my account" → confirmation → runs **every registered user-deletion handler** (section 5.4, rule 9), which hard-deletes the user's data, anonymises payment records, and removes the public portfolio.
- AC: a deleted user's public portfolio URL returns 404; no user-owned rows remain in any table; an architecture test fails if a table with a `user_id` column has no registered deletion handler.

### FR-2 Onboarding wizard (`/start`)

Steps, each its own route-less client step with server validation at the end:

1. **Current role**: select from roles where `is_current_role = true`.
2. **Experience**: years (0–40) and seniority (`junior|mid|senior|lead|manager`).
3. **Current skills**: multi-select with search, grouped by category, each with a level (default `can_build`). Skills implied by the chosen role are **pre-checked and marked "from your role"**, and the user can uncheck them.
4. **Target role**: select from roles where `is_target_role = true`. Only targets with an authored `transition_path` from the current role (or a generic fallback) are enabled; others show "coming soon" and a waitlist field (store email in `waitlist`).
5. **Review and generate.**

- AC: complete wizard in under 2 minutes with keyboard only; state survives refresh (stored in a signed cookie or `sessionStorage` keyed draft, then migrated to the DB on sign-in).

### FR-3 Transition map (`/plan/[planId]` and anonymous `/map`)

Display, in this order:

1. Header: current role → target role, years, total estimated hours, estimated calendar time at an editable hours-per-week input (default 6).
2. **Keep**: skills already at or above the required level.
3. **Upgrade**: each shows `from → to` (e.g. "Spring → Spring Boot") with hours saved by transfer.
4. **Learn**: new skills, ordered, with effort and why they matter for the target role.
5. **Recommended projects**: ordered sequence, each with the skills it covers and a "why this project for you" line.
6. **Skills not covered** by any recommended project (honest gap list).

- FR-3.1 Every item shows its reasons (expandable). Reasons are stored as **reason codes with params** and rendered to text by a single renderer (section 10.5).
- FR-3.2 The user can edit a skill's level or add or remove a skill from the map page, which regenerates the plan.
- FR-3.3 The map is **free**, with no authentication or purchase needed.
- FR-3.4 Signed-in users have plan snapshots saved. If the content version **or the engine version** changes, show "An updated plan is available", with a diff summary (added or removed items) and an Accept button.
- AC: the plan renders from a pure engine call, with identical input giving identical output (deterministic). Server render time for the map page is under 300 ms p95 on seed content.

### FR-4 Projects

- FR-4.1 Project types: `guided` (Markdown content in-app, paid) and `external` (link to a curated resource, free).
- FR-4.2 A project page shows: title, difficulty, estimated hours, prerequisites, **skill coverage table** (skill, level demonstrated, status for this user), and the personalised "why this project" text derived from the user's plan.
- FR-4.3 Guided projects are phased (Understand → Modernise → Containerise → Deploy, etc.), with per-phase checklists (stored per user).
- FR-4.4 Guided content is gated by entitlement. Access rules are declared on the project (`access.entitlement_keys_any`, section 8.2). Unentitled users see the overview, the skill coverage and the first phase as a preview.
- FR-4.5 User project status: `not_started | in_progress | submitted | verified | completed`.

### FR-5 Competency model and progress

- Six ordered levels: `knowledge(1) < understanding(2) < can_build(3) < can_deploy(4) < can_troubleshoot(5) < production_ready(6)`.
- FR-5.1 A user's skill level has a `source`, defined in the **evidence-type registry** (section 11.3). MVP sources: `inferred_from_role`, `self_declared`, `rubric_review`, `repo_check`, `human_review` (reserved).
- FR-5.2 Dashboard (`/dashboard`) shows overall transition progress (share of target skills at required level), skills by status, projects by status.
- FR-5.3 UI must always show the evidence source next to a skill level (badge with tooltip), rendered from the evidence-type registry (no hard-coded switch statements).

### FR-6 Evidence and verification

- FR-6.1 **Rubric review**: per project, a short checklist (3–8 yes/no items). Passing grants `rubric_review` evidence at the project's stated level. Weak evidence, shown as "Self-reviewed".
- FR-6.2 **Repo verification** (paid): the user submits a public GitHub repo URL for a project. The server runs the project's declared checks (section 11) through the **check-runner registry**. Results are stored as evidence rows and shown check by check (pass/fail with the reason).
- FR-6.3 A skill earns `repo_check` evidence at level L only if **all required checks mapped to that skill@L pass**.
- FR-6.4 The user can re-run verification (limit: 5 per project per day).
- FR-6.5 `human_review` is **registry and schema-only** in the MVP (no UI or workflow), reserved for later.
- AC: a repo that lacks a Dockerfile fails the `has-dockerfile` check, and Docker is not marked demonstrated.

### FR-7 Portfolio

- FR-7.1 Private by default. A toggle makes `/p/[slug]` public (slug is a random 10-character base62 string, regenerable).
- FR-7.2 Contents: name, current role → target role, years of experience, existing strengths (Keep), modern skills **with evidence badges**, completed projects with repo links, last-updated date.
- FR-7.3 Print stylesheet so "Print → Save as PDF" produces a clean one-page-per-section document. No PDF library.
- FR-7.4 Public pages set `noindex` unless the user ticks "allow search engines".
- FR-7.5 Open Graph image generated with `next/og` (name, transition, count of verified skills).

### FR-8 Payments and entitlements

- FR-8.1 One-time purchases through the **`PaymentProvider` port** (Razorpay adapter in the MVP). Products are defined in `modules/billing/products.ts` (price in minor units, currency, the entitlement keys granted, optional `durationDays` for later). **No hard-coded prices elsewhere.**
- FR-8.2 Entitlements are granted **only** by the verified webhook handler, never by the client redirect.
- FR-8.3 Webhook handler (`/api/webhooks/[provider]`): the adapter verifies the signature and returns a **normalised payment event**. The billing service is idempotent on `(provider, event_id)` and writes `payments` + `entitlements` in one transaction.
- FR-8.4 Invoices and GST: store order and payment IDs, and display a "receipt" page. Tax-invoice generation is out of scope (note in `docs/ASSUMPTIONS.md` that the operator must handle GST with an accountant).
- FR-8.5 Refund policy page and "no job guarantee" disclaimer are static pages linked from checkout.
- FR-8.6 Entitlements support `expires_at` and `revoked_at` from day one. An entitlement is active when `revoked_at is null and (expires_at is null or expires_at > now)`. All access checks go through `billing.hasEntitlement()`.
- Default products (editable): `track:java-backend-developer-to-cloud-engineer`, `track:java-backend-developer-to-ai-application-engineer` (example price ₹2,999 each, unvalidated, set via env or config).

### FR-9 SEO pages (`/transitions/[slug]`)

- FR-9.1 One static page per authored `transition_path`, generated with `generateStaticParams`. Content: overview, what to keep (and skip), what to upgrade, what to learn, sample project sequence, FAQs (from content), CTA to `/start?from=…&to=…`.
- FR-9.2 JSON-LD (`Article` + `FAQPage`), canonical URLs, `sitemap.xml`, `robots.txt`, OG tags.
- FR-9.3 Only `status: published` paths are rendered; drafts return 404 in production.

### FR-10 Content pipeline and dev tools

- FR-10.1 `pnpm content:validate` validates all files in `/content` against Zod schemas plus graph rules (section 8.3), failing with readable errors.
- FR-10.2 `pnpm content:seed` idempotently upserts content into Postgres by `slug` (resolving `aliases`) and records a `content_versions` row (hash of the content directory). **It never deletes a row that user data references**; removed content is marked `retired`.
- FR-10.3 `/admin/engine-preview` (restricted to `ADMIN_EMAILS`, and disabled in production unless the email matches): pick current role, skills, target role, and see the raw engine output, reason codes and the rendered reasons.
- FR-10.4 A CI job runs validate, golden tests and architecture checks on every PR.
- FR-10.5 `pnpm content:migrate` upgrades content files from an older `schema_version` (section 8.5).

### FR-11 Analytics, email, monitoring

- FR-11.1 Track the events in section 13 through the **`Analytics` port** (PostHog adapter, client and server). Event names and property schemas are defined once in a typed registry.
- FR-11.2 Transactional emails via the `EmailSender` port (Resend adapter): welcome, purchase receipt, "your plan has an update". Plain, text-first templates.
- FR-11.3 Sentry on client, server and edge.
- FR-11.4 Weekly Vercel Cron job: link-check external resources, writing `resources.last_check_status`, and notify `ADMIN_EMAILS` of broken links.

### FR-12 Static and legal pages

Terms, Privacy (state DPDP-style consent and deletion rights), Refund policy, Disclaimer, Contact.

---

## 5. Non-functional requirements and conventions

### 5.1 Security (must pass before launch)

- Authorisation on **every** data access, enforced in each module's `data/` layer, which takes `userId` explicitly. No raw DB access outside module data layers (enforced by the architecture check, section 5.4 rule 2).
- Zod validation on every route handler and server action input.
- Repo URLs: accept only `https://github.com/{owner}/{repo}` after strict regex parsing. No arbitrary URL fetches (SSRF). Fetch only through the `RepoHost` adapter with a server-side token.
- Secrets only in server-side env. A `server-only` import guard on every module that reads secrets.
- CSRF protection via Auth.js and same-site cookies. Security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, frame-ancestors none) in `next.config.ts`.
- Rate limiting through the `RateLimiter` port (Upstash adapter, with an in-memory fallback in dev): auth endpoints, plan generation, repo verification, waitlist.
- Webhook endpoints: raw-body signature verification, no auth cookies.
- Public portfolios expose only whitelisted fields (an explicit DTO, never a DB row).
- Dependabot and `pnpm audit` in CI. Secret scanning on.
- Minimal PII: name, email, avatar, GitHub username. No resumes, phone numbers or government IDs.

### 5.2 Other NFRs

- **Performance:** LCP under 2.5 s on 4G for SEO pages (static generation); map generation under 300 ms server-side.
- **Accessibility:** WCAG 2.1 AA basics: keyboard-operable wizard, visible focus, semantic headings, contrast, `aria-live` for plan regeneration.
- **Reliability:** idempotent webhooks, DB transactions for entitlement grants, migrations through Drizzle Kit only.
- **Observability:** structured logs (pino via the `Logger` port), request IDs, Sentry release tracking.
- **Privacy:** consent record, deletion endpoint, no third-party trackers beyond the analytics adapter (self-configurable host).

### 5.3 Engineering conventions

- TypeScript `strict: true`, `noUncheckedIndexedAccess: true`. **No `any`.** No non-null assertions without a comment.
- Zod schemas are the source of truth for external data, and types are inferred from them.
- **The transition engine is a pure module** (`src/modules/planning/engine`): no I/O, no `Date.now()` or randomness without injection, no imports from `platform/`, `next/`, the DB or other modules except type imports from `catalog`'s public API.
- Server-only code carries `import "server-only"`.
- Use Server Components by default. Client Components only for the wizard, interactive map controls and forms.
- Tests accompany each phase. Conventional commits.
- Environment access only via `src/platform/env.ts` (Zod-validated, `@t3-oss/env-nextjs` or equivalent).

### 5.4 Extensibility rules (mandatory; enforced where marked)

1. **Modular monolith.** The application is organised into domain modules under `src/modules/*`, each with a single public entry point `index.ts`. Other code may import a module **only through its `index.ts`**. Deep imports into a module's internals are forbidden. *(Enforced: dependency-cruiser.)*
2. **Module dependency direction is fixed** (section 6.4). No cycles. Only a module's own `data/` layer touches its tables. Another module needs data? Call its public service. *(Enforced: dependency-cruiser + test that greps for table imports outside the owning module.)*
3. **Ports and adapters for external services.** Domain code depends on **port interfaces** in `src/platform/ports/*`, never on vendor SDKs. SDKs are imported only inside `src/platform/adapters/*`. *(Enforced: dependency-cruiser rule forbidding `razorpay`, `resend`, `posthog-*`, `@upstash/*`, `@octokit/*` imports outside adapters.)*
4. **Composition root.** All wiring of ports to adapters happens in `src/platform/container.ts`. Services receive their ports through a `Ctx` argument (`{ userId?, ports, now }`), so tests inject fakes and nothing uses hidden globals.
5. **Thin app layer.** Files under `src/app/**` (pages, layouts, route handlers, server actions) contain **no business logic and no DB access**. They parse input with the module's Zod schemas, call one module service, and render or revalidate. **Every service function has Zod-typed, serialisable input and output**, so a future public API or mobile client can call the same services. *(Enforced: dependency-cruiser forbids `app/**` importing `platform/db` or module internals.)*
6. **Registries over conditionals.** Anything that has "types" which will grow uses a registry (section 6.7): check runners, evidence types, engine strategies, analytics events, products. No `switch (type)` scattered through the codebase.
7. **Version everything that is stored or authored.** `schema_version` on content files, `engine_version` and `plan_schema_version` on stored plans, `payload_version` on evidence payloads. Stored JSON is **parsed with Zod on read** via an upgrader chain (`vN → vN+1`), never trusted as-is.
8. **Stable identifiers.** Slugs are immutable IDs. Renames use `aliases`; removals use `status: retired`. Nothing referenced by user data is ever hard-deleted by the seeder.
9. **User-lifecycle hooks.** Each module that stores user-owned data registers an `onUserDeleted(userId)` handler in the lifecycle registry (`platform/ports/lifecycle.ts`). Account deletion calls them all. *(Enforced: architecture test scans the schema for `user_id` columns and asserts a handler exists for each table.)*
10. **Text + CHECK, not native enums.** Value sets that may grow (edge types, evidence types, check types, statuses, roles kinds) are `text` columns constrained by a CHECK generated from a shared `as const` array that also feeds Zod. Never use `pgEnum`.
11. **Config, not magic numbers.** Tunable numbers (engine weights, limits, rate limits, check budgets) live in typed config objects with defaults, never inline.
12. **Document the seams.** `docs/ARCHITECTURE.md` (module map and rules), `docs/EXTENDING.md` (recipes, section 6.8) and `docs/adr/` (one short Architecture Decision Record per significant decision) are maintained as part of the work, not after it.

---

## 6. Architecture

### 6.1 Overview

A single Next.js application (modular monolith) with a Postgres database. The transition engine is an isolated pure module. Content is authored as files and seeded into the DB. External services are reached only through ports.

```text
                    ┌──────────────────────────────────────────────────┐
  Browser ─────────▶│  src/app  (routing layer ONLY: pages, actions,   │
  (SEO pages,       │            route handlers) — thin wrappers       │
   wizard, map,     └───────────────┬──────────────────────────────────┘
   dashboard,                       │ via each module's index.ts only
   portfolio)       ┌───────────────▼──────────────────────────────────┐
                    │  src/modules (domain modules, services = use     │
                    │  cases)                                          │
                    │  catalog · planning(engine) · identity ·         │
                    │  projects · evidence · portfolio · billing ·     │
                    │  marketing · ops                                 │
                    └───────────────┬──────────────────────────────────┘
                                    │ depends on interfaces only
                    ┌───────────────▼──────────────────────────────────┐
                    │  src/platform                                    │
                    │  ports/  ◀──implemented by──  adapters/          │
                    │  (Payment, Email, Analytics, RepoHost,           │
                    │   RateLimiter, Logger, Flags, Lifecycle)         │
                    │  container.ts (composition root) · db · env      │
                    └───────┬─────────────┬────────────┬───────────────┘
                            ▼             ▼            ▼
                    Postgres (Neon)   Razorpay/Resend/PostHog/GitHub/Upstash
                            ▲
       /content (YAML + MD, Git) ── content:seed ──┘
```

### 6.2 Data flow: generating a plan

1. Wizard posts `{currentRole, years, seniority, skills[], targetRole}` to a thin server action.
2. The action validates input with `planning`'s Zod schema and calls `planning.generatePlanForProfile(ctx, input)`.
3. The service obtains a **ContentSnapshot** from `catalog.getSnapshot(ctx)` (a `ContentRepository` port implementation, cached in memory keyed by `content_version`).
4. `generatePlan(profile, targetRole, snapshot, config)` (pure) returns a `Plan`.
5. If signed in: persist `plan_snapshots` (input + output + `content_version_id` + `engine_version` + `plan_schema_version`). Otherwise return the plan for render, and keep the input in the draft cookie.

### 6.3 Directory structure

```text
/
├─ content/                          # human-authored, validated, seeded (each file has schema_version)
│  ├─ roles/*.yaml
│  ├─ skills/*.yaml
│  ├─ skill-edges/*.yaml
│  ├─ requirements/*.yaml            # role_skill_requirements
│  ├─ transitions/*.yaml             # transition_paths + SEO copy + FAQs
│  ├─ projects/*.yaml                # metadata, skill coverage, access, checks, rubric
│  └─ projects-guided/<slug>/*.md    # guided walkthrough phases (Markdown)
├─ docs/
│  ├─ ARCHITECTURE.md                # module map, dependency rules, ports
│  ├─ EXTENDING.md                   # recipes (section 6.8)
│  ├─ ASSUMPTIONS.md
│  └─ adr/0001-modular-monolith.md, 0002-ports-and-adapters.md, ...
├─ drizzle/                          # generated migrations
├─ scripts/
│  ├─ content-validate.ts
│  ├─ content-seed.ts
│  └─ content-migrate.ts
├─ src/
│  ├─ app/                           # Next.js routing layer ONLY (thin)
│  │  ├─ (marketing)/                # /, /transitions/[slug], legal pages
│  │  ├─ start/  map/  plan/[planId]/  dashboard/  projects/[slug]/
│  │  ├─ p/[slug]/  settings/  checkout/[productKey]/
│  │  ├─ admin/engine-preview/
│  │  └─ api/
│  │     ├─ auth/[...nextauth]/
│  │     ├─ webhooks/[provider]/
│  │     ├─ verify/
│  │     └─ cron/link-check/
│  ├─ modules/
│  │  ├─ catalog/                    # content domain
│  │  │  ├─ index.ts                 # PUBLIC API
│  │  │  ├─ schema.ts                # Drizzle tables owned by this module
│  │  │  ├─ domain/                  # types, Zod schemas (+ schema_version)
│  │  │  ├─ repository/              # ContentRepository: Db + File implementations
│  │  │  ├─ validation/              # graph rules
│  │  │  └─ migrations/              # content schema upgraders (vN→vN+1)
│  │  ├─ planning/                   # engine + profiles + plan snapshots
│  │  │  ├─ index.ts · schema.ts · service.ts · data/ · ui/
│  │  │  └─ engine/                  # PURE
│  │  │     ├─ config.ts             # EngineConfig + DEFAULT_ENGINE_CONFIG
│  │  │     ├─ version.ts            # ENGINE_VERSION
│  │  │     ├─ types.ts · reasons.ts · diff.ts
│  │  │     ├─ pipeline.ts           # runs stages in order
│  │  │     ├─ stages/               # effectiveSkills, requirements, classify,
│  │  │     │                        #   order, selectProjects, finalize
│  │  │     └─ strategies/           # ic.ts, manager.ts, registry.ts
│  │  ├─ identity/                   # users, auth config, consent, deletion orchestration
│  │  ├─ projects/                   # user_projects, rubric, phase progress
│  │  ├─ evidence/                   # competency, skill_evidence, verification
│  │  │  ├─ evidence-types.ts        # registry (label, tooltip, rank)
│  │  │  └─ verification/
│  │  │     ├─ registry.ts           # check-runner registry
│  │  │     ├─ runners/              # fileExists.ts, fileContains.ts, dependencyContains.ts
│  │  │     └─ runVerification.ts
│  │  ├─ portfolio/                  # portfolio settings, public DTO, OG
│  │  ├─ billing/                    # products, payments, entitlements
│  │  ├─ marketing/                  # SEO page data, sitemap, waitlist
│  │  └─ ops/                        # link-check, admin tooling
│  ├─ platform/
│  │  ├─ ports/                      # payment.ts, email.ts, analytics.ts, repo-host.ts,
│  │  │                              #   rate-limit.ts, flags.ts, logger.ts, clock.ts, lifecycle.ts
│  │  ├─ adapters/                   # razorpay/, resend/, posthog/, github/, upstash/, pino/, fakes/
│  │  ├─ analytics/events.ts         # typed event registry
│  │  ├─ db/                         # client.ts, schema.ts (aggregates module schema.ts files)
│  │  ├─ container.ts                # composition root
│  │  └─ env.ts
│  └─ ui/                            # shadcn primitives, layout components (no domain logic)
├─ tests/
│  ├─ golden/                        # persona fixtures + snapshots + version manifest
│  ├─ architecture/                  # dependency, lifecycle and registry tests
│  └─ e2e/                           # Playwright
├─ .dependency-cruiser.cjs           # module and port rules
└─ .github/workflows/ci.yml
```

Each module has this internal shape (create only the folders it needs): `index.ts` (public API: types, Zod schemas, service functions), `schema.ts` (its Drizzle tables), `domain/` (pure types and rules), `data/` (the only code that queries its tables), `service.ts` (use cases), `ui/` (module-specific components).

Cross-module **foreign keys** in `schema.ts` are allowed (for example to `users.id`). Cross-module **queries** are not.

### 6.4 Module ownership and allowed dependencies

| Module | Owns (tables) | May depend on |
|---|---|---|
| `platform` | none (ports, adapters, db client) | none (adapters depend on vendor SDKs) |
| `catalog` | skills, skill_edges, roles, role_implied_skills, role_skill_requirements, transition_paths, projects, project_skills, resources, content_versions | platform |
| `identity` | users, accounts, sessions, verification_tokens | platform |
| `billing` | payments, entitlements, webhook_events | platform |
| `planning` | profiles, plan_snapshots | catalog, platform |
| `projects` | user_projects | catalog, billing, platform |
| `evidence` | user_skills, skill_evidence | catalog, projects, billing, platform |
| `portfolio` | portfolios | catalog, planning, projects, evidence, identity, platform |
| `marketing` | waitlist | catalog, platform |
| `ops` | none | catalog, platform |
| `app` | none | any module, via `index.ts` only |

The `planning/engine` sub-folder depends on **nothing** except type imports from `catalog`'s public API.

### 6.5 Ports (interfaces in `src/platform/ports`)

| Port | Responsibility | MVP adapter | Fake for tests |
|---|---|---|---|
| `PaymentProvider` | `createOrder`, `parseWebhook` → normalised event | Razorpay | `FakePaymentProvider` |
| `EmailSender` | `send(template, to, data)` | Resend | in-memory outbox |
| `Analytics` | `track(event, props)`, `identify` (typed by the events registry) | PostHog | no-op / recorder |
| `RepoHost` | `getDefaultBranchTree(owner, repo)`, `getBlob(...)` with budgets | GitHub REST | fixture repo host |
| `RateLimiter` | `limit(key, rule)` | Upstash | in-memory |
| `FeatureFlags` | `isEnabled(flag)` | env-based | static map |
| `Logger` | structured logging | pino | silent |
| `Clock` | `now()` | system clock | fixed clock |
| `UserLifecycle` | `register(moduleName, onUserDeleted)` / `runDeletion(userId)` | in-process registry | in-process registry |

`PaymentProvider` shape (reference):

```ts
interface PaymentProvider {
  id: string;                                   // 'razorpay' | later 'stripe'
  createOrder(input: { amountMinor: number; currency: string; receipt: string;
                       metadata: Record<string, string> }):
    Promise<{ providerOrderId: string; clientPayload: unknown }>;
  // Verifies the signature (throws on invalid) and normalises the provider event.
  parseWebhook(rawBody: string, headers: Headers): Promise<NormalizedPaymentEvent | null>;
}
interface NormalizedPaymentEvent {
  eventId: string;
  type: 'payment.succeeded' | 'payment.failed' | 'payment.refunded';
  providerOrderId: string; providerPaymentId: string;
  amountMinor: number; currency: string;
}
```

### 6.6 Composition root

`src/platform/container.ts` reads `env`, constructs adapters, and exports `getPorts()` and `createCtx({ userId })`. Services take `ctx` explicitly. Unit and golden tests build a ctx from fakes and never import vendor SDKs.

### 6.7 Extension points (registries and interfaces)

| Extension point | Location | What a new entry looks like |
|---|---|---|
| Check runners | `evidence/verification/registry.ts` | `{ type, specSchema (Zod), run(spec, repoAccess) → pass/fail/inconclusive }`. The project content schema's `checks` union is **built from the registry**, so a new check type automatically becomes valid content |
| Evidence types | `evidence/evidence-types.ts` | `{ type, label, tooltip, rank, isVerified }`. Rank decides which source wins for a skill. Badges, portfolio and dashboard read from here |
| Engine strategies | `planning/engine/strategies/registry.ts` | Keyed by role `kind`. A strategy provides config overrides and requirement or project filters. Unknown kinds fall back to `ic` with a warning |
| Engine stages | `planning/engine/stages/*` and `DEFAULT_STAGES` | A stage is `(ctx: PlanContext) => PlanContext`. A different stage list can be passed to experiment without touching the rest |
| Analytics events | `platform/analytics/events.ts` | `{ name: zodPropsSchema }`. `track()` is typed against it |
| Products | `billing/products.ts` | `{ key, price, currency, entitlements[], durationDays? }` |
| Payment providers | `platform/adapters/*` + container | Implement `PaymentProvider`, register under an id. `/api/webhooks/[provider]` resolves it by the URL segment |
| Content kinds / fields | `catalog/domain` + `catalog/migrations` | Add the Zod field with a default, bump `schema_version`, add an upgrader |
| User-owned tables | module `schema.ts` + lifecycle | Register an `onUserDeleted` handler (architecture test enforces this) |

### 6.8 Extension recipes (`docs/EXTENDING.md` must contain these, accurate and short)

1. Add a new transition (content only; no code).
2. Add a new verification check type.
3. Add a new evidence type (for example `human_review` going live).
4. Add a second payment provider (for example Stripe).
5. Add a new engine stage or a role-kind strategy, and bump `ENGINE_VERSION`.
6. Add a new analytics event.
7. Add a field to content or stored JSON (the versioning and upgrader steps).
8. Add a new module (folder layout, `index.ts`, dependency-cruiser entry, lifecycle handler).
9. Extract a module into a service (what must be true first: only its public API is used, no cross-module queries).

---

## 7. Technology stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js (latest stable), App Router, React Server Components** | Server Actions for mutations (thin); Route Handlers for webhooks/cron |
| Language | **TypeScript (strict)** | |
| Package manager | pnpm | |
| Styling / UI | Tailwind CSS + shadcn/ui + lucide-react | Dark mode via `prefers-color-scheme` |
| Database | PostgreSQL (Neon, serverless driver) | |
| ORM / migrations | **Drizzle ORM + Drizzle Kit** | Schema files live in modules, aggregated in `platform/db/schema.ts` |
| Auth | **Auth.js (NextAuth v5)** with Drizzle adapter, GitHub + Google providers | No extra scopes needed. Verification uses a server token |
| Validation | Zod | |
| Content | YAML (`yaml` package) + Markdown | Guided walkthroughs rendered with `next-mdx-remote/rsc` |
| Payments | Razorpay (Orders API + webhooks) behind `PaymentProvider` | INR, one-time |
| Email | Resend behind `EmailSender` | |
| Analytics | PostHog behind `Analytics` | |
| Monitoring | Sentry | |
| Rate limiting | Upstash Ratelimit behind `RateLimiter` | In-memory fallback for local dev |
| Logging | pino behind `Logger` | |
| Architecture checks | **dependency-cruiser** (`pnpm arch:check`) | Module boundaries, port rules, no cycles |
| Unit / golden / architecture tests | Vitest | |
| E2E tests | Playwright | |
| Lint / format | ESLint (next + typescript-eslint) + Prettier | |
| CI | GitHub Actions | typecheck, lint, arch:check, content:validate, test, build |
| Hosting | Vercel (app, cron) + Neon (DB) | No Kubernetes, no extra services |
| OG images | `next/og` | |

Do not add other frameworks or services without recording the reason in `docs/ASSUMPTIONS.md` (and an ADR if it changes the architecture).

---

## 8. Content model and authoring format

### 8.1 Competency levels

`knowledge(1) → understanding(2) → can_build(3) → can_deploy(4) → can_troubleshoot(5) → production_ready(6)`

### 8.2 Entity definitions (YAML)

Every content file begins with `schema_version: 1`.

**Skill**

```yaml
schema_version: 1
slug: spring-boot
aliases: []               # previous slugs; resolved by the seeder and loader
name: Spring Boot
category: backend-frameworks
tags: [java, framework]
base_hours: 20            # hours from none to can_build, for an experienced developer
fundamental: false        # true = assume known by experienced practitioners of related roles
description: Opinionated Spring setup with auto-configuration, starters and embedded servers.
status: draft             # draft | published | retired
last_reviewed_at: 2026-10-01
reviewed_by: seed-placeholder
```

**Skill edge** (the core IP; the `note` is shown to users as the reason)

```yaml
schema_version: 1
from: spring
to: spring-boot
type: upgrade_of          # upgrade_of | bridge_to | prerequisite_of | equivalent
transfer_weight: 0.7      # 0..1, share of learning effort already covered. Ignored for prerequisite_of
note: Same core DI and MVC concepts; Boot replaces XML/manual config with auto-configuration.
```

**Role**

```yaml
schema_version: 1
slug: cloud-engineer
aliases: []
name: Cloud Engineer
kind: ic                  # ic | manager | architect
is_current_role: false
is_target_role: true
implied_skills: []        # for current roles: skills assumed from the role (pre-checked in wizard)
status: draft
```

**Role skill requirement**

```yaml
schema_version: 1
role: cloud-engineer
skill: docker
importance: core          # core | expected | nice
target_level: can_deploy
applies_to_kind: [ic]     # which role kinds this requirement is evaluated for
```

**Transition path** (curated overrides + SEO copy)

```yaml
schema_version: 1
slug: java-backend-developer-to-cloud-engineer
aliases: []
from_role: java-backend-developer
to_role: cloud-engineer
status: draft
title: Java Backend Developer to Cloud Engineer
summary: Keep your Java and API expertise; learn containers, cloud services and delivery pipelines.
overrides:
  force_include_skills: []
  force_exclude_skills: []
  project_sequence: [modernise-java-service, containerise-and-deploy-aws]   # optional hard ordering
faqs:
  - q: Do I need to relearn Java?
    a: No. The plan treats Java, OOP, SQL and REST as skills you keep.
```

**Project**

```yaml
schema_version: 1
slug: containerise-and-deploy-aws
aliases: []
name: Containerise and deploy a Spring Boot service on AWS
mode: guided              # guided | external
resource_url: null        # required if mode = external
difficulty: intermediate  # beginner | intermediate | advanced
est_hours: 12
tags: []                  # e.g. manager-friendly
requires_skills: [spring-boot]          # must be at least can_build (user level or earlier project)
requires_projects: [modernise-java-service]
access:
  free_preview: true                    # overview, coverage and first phase visible without entitlement
  entitlement_keys_any:                 # any one of these entitlements unlocks guided content and verification
    - track:java-backend-developer-to-cloud-engineer
covers:
  - { skill: docker, level: can_deploy }
  - { skill: aws-ecs, level: can_deploy }
  - { skill: github-actions, level: can_build }
rubric:
  - Does the container run as a non-root user?
  - Are secrets injected at runtime rather than baked into the image?
  - Is there a health check endpoint used by the platform?
verification:             # see section 11; check specs are validated by the check-runner registry
  checks: [...]
status: draft
```

### 8.3 Graph validation rules (`content:validate` must enforce)

1. All slugs unique per entity type (including aliases); referenced slugs and aliases resolve to exactly one entity.
2. No cycles in `prerequisite_of` edges or `requires_projects`.
3. `transfer_weight` ∈ [0,1]; `equivalent` edges symmetric (auto-create the reverse in the loader).
4. Every `published` transition path has: a published from-role and to-role, requirements for the to-role, and **at least one project covering each `core` requirement** (otherwise warn "uncovered core skill"; fail if more than 20% uncovered).
5. Every `external` project has `resource_url`. Every `guided` project has at least one Markdown phase file and at least one `access.entitlement_keys_any` key that exists in `billing/products.ts`.
6. Every skill, path and project has `last_reviewed_at`. Warn if older than 180 days.
7. Verification checks reference declared skills and levels, and every check `type` has a registered runner whose `specSchema` validates the spec.
8. A slug that disappears from `/content` between versions must have been marked `retired` or listed in another entity's `aliases` (compare against the previous `content_versions` manifest); otherwise fail.
9. Every file's `schema_version` is supported by the loader (section 8.5).

### 8.4 Seed content (draft placeholders)

Create a minimal but **internally consistent** draft set so the app, engine and tests run end to end:

- Roles: `java-backend-developer`, `qa-engineer`, `engineering-manager` (current); `cloud-engineer`, `ai-application-engineer`, `devops-engineer`, `ai-engineering-manager` (target).
- ~30 skills across: Java/Spring, SQL, REST, CI/CD (Jenkins, GitHub Actions), Docker, Kubernetes, AWS basics (EC2, S3, ECS, IAM), observability, LLM APIs, embeddings, RAG, vector databases, AI evaluation, testing automation, and manager-level AI literacy skills.
- ~10 edges, including `spring → spring-boot` (upgrade_of), `jenkins → github-actions` (bridge_to), `rest-apis → llm-apis` (bridge_to), `docker → kubernetes` (prerequisite_of).
- ~6 projects, three of them `guided` with short placeholder Markdown phases.
- All entities carry `status: draft` and `reviewed_by: seed-placeholder`. Show a visible "Draft content" banner in non-production when any referenced entity is a draft.

### 8.5 Content format evolution

- `catalog/migrations/` holds upgraders (`v1ToV2.ts`, ...). The loader applies them in memory so old files still load; `pnpm content:migrate` rewrites files on disk to the latest version.
- A new optional field must have a default so existing files stay valid. A breaking change needs a new `schema_version` and an upgrader. A test loads fixture files of every supported old version and asserts they upgrade to the current shape.

### 8.6 ContentRepository

`catalog` exposes a `ContentRepository` interface (`getSnapshot(): Promise<ContentSnapshot>`) with two implementations: `DbContentRepository` (production, reads seeded tables, cached by `content_version`) and `FileContentRepository` (reads and validates `/content` directly, no DB). The engine preview, golden tests and `content:validate` use the file-backed one. A future CMS or API-backed source implements the same interface.

---

## 9. Database schema (Drizzle / Postgres)

Each module defines its tables in its own `schema.ts`. `platform/db/schema.ts` re-exports all of them for Drizzle Kit. Use `uuid` primary keys (`defaultRandom()`), `timestamptz` columns, snake_case column names, and indexes on all foreign keys and slugs.

**Column rule (5.4 rule 10):** enumerations below are `text` columns with a CHECK constraint generated from a shared `as const` array that also feeds Zod. No `pgEnum`.

**JSON rule (5.4 rule 7):** every `jsonb` column that stores a structured shape carries a version, and is parsed with Zod (with upgraders) on read.

### 9.1 Identity tables (module `identity`)
Standard Auth.js Drizzle adapter tables: `users`, `accounts`, `sessions`, `verification_tokens`. Extend `users` with: `github_username text null`, `consented_at timestamptz`, `consent_version text`, `org_id uuid null` (see 9.5, reserved).

### 9.2 Content tables (module `catalog`; seeded; read-only at runtime)

| Table | Key columns |
|---|---|
| `skills` | `id`, `slug unique`, `aliases text[]`, `name`, `category`, `tags text[]`, `base_hours int`, `fundamental bool`, `description`, `status` (draft/published/retired), `last_reviewed_at` |
| `skill_edges` | `id`, `from_skill_id fk`, `to_skill_id fk`, `type` (text+CHECK), `transfer_weight real`, `note` · unique(`from`,`to`,`type`) |
| `roles` | `id`, `slug unique`, `aliases text[]`, `name`, `kind` (text+CHECK: ic/manager/architect), `is_current_role`, `is_target_role`, `status` |
| `role_implied_skills` | `role_id`, `skill_id`, `level` |
| `role_skill_requirements` | `role_id`, `skill_id`, `importance` (text+CHECK), `target_level`, `applies_to_kind text[]` |
| `transition_paths` | `id`, `slug unique`, `aliases text[]`, `from_role_id`, `to_role_id`, `status`, `title`, `summary`, `overrides jsonb`, `faqs jsonb` |
| `projects` | `id`, `slug unique`, `aliases text[]`, `name`, `mode` (text+CHECK), `resource_url`, `difficulty`, `est_hours`, `tags text[]`, `requires_skills jsonb`, `requires_projects jsonb`, `access jsonb`, `rubric jsonb`, `verification jsonb`, `guided_content_path`, `status`, `last_reviewed_at` |
| `project_skills` | `project_id`, `skill_id`, `level_demonstrated` |
| `resources` | `id`, `skill_id`, `title`, `url`, `kind`, `last_check_status`, `last_checked_at` |
| `content_versions` | `id`, `hash`, `manifest jsonb` (slugs by entity type, for rule 8.3-8), `created_at` · the latest row is the current version |

### 9.3 User and commerce tables

| Module | Table | Key columns |
|---|---|---|
| `planning` | `profiles` | `user_id pk/fk`, `current_role_id`, `years_experience`, `seniority` (text+CHECK), `hours_per_week int default 6` |
| `planning` | `plan_snapshots` | `id`, `user_id`, `target_role_id`, `input jsonb`, `output jsonb`, `content_version_id`, **`engine_version text`**, **`plan_schema_version int`**, `is_current bool`, `created_at` |
| `projects` | `user_projects` | `id`, `user_id`, `project_id`, `status` (text+CHECK), `repo_url`, `phase_progress jsonb`, `submitted_at`, unique(`user_id`,`project_id`) |
| `evidence` | `user_skills` | `user_id`, `skill_id`, `level`, `source` (text+CHECK from the evidence-type registry), `updated_at` · unique(`user_id`,`skill_id`) |
| `evidence` | `skill_evidence` | `id`, `user_id`, `skill_id`, `level`, `evidence_type` (text+CHECK), `project_id`, `payload jsonb`, **`payload_version int`**, `created_at` · **append-only; never updated or deleted except by the user-deletion handler** |
| `portfolio` | `portfolios` | `user_id pk/fk`, `slug unique`, `is_public bool default false`, `allow_indexing bool default false`, `headline text null`, `updated_at` |
| `billing` | `payments` | `id`, `user_id null`, **`provider text`**, **`provider_order_id`**, **`provider_payment_id null`**, `product_key`, `amount_minor int`, `currency`, `status` (text+CHECK: created/paid/failed/refunded), `created_at` · unique(`provider`,`provider_order_id`), unique(`provider`,`provider_payment_id`) |
| `billing` | `entitlements` | `id`, `user_id`, `key text` (e.g. `track:<slug>`), `source_payment_id fk`, `granted_at`, **`expires_at null`**, **`revoked_at null`**, unique(`user_id`,`key`) |
| `billing` | `webhook_events` | `id`, `provider`, `event_id`, `received_at` · unique(`provider`,`event_id`) |
| `marketing` | `waitlist` | `id`, `email`, `from_role_id null`, `to_role_id null`, `created_at` |

`user_skills` is a **derived summary** recomputed from the highest-ranked evidence plus declared levels (rank from the evidence-type registry). `skill_evidence` is the source of truth for anything shown as "verified".

### 9.4 Deletion behaviour
Each module's `onUserDeleted` handler removes its own user-owned rows. `billing`'s handler **anonymises** `payments` (`user_id = null`) instead of deleting them, to keep financial records, and deletes `entitlements`. Document this in the privacy policy. The architecture test (5.4 rule 9) guarantees no table with a `user_id` is forgotten.

### 9.5 Tenant readiness
Add nullable `org_id` to `users`, `entitlements` and `plan_snapshots` now. Do not build organisation features.

### 9.6 Stored JSON versions
`plan_snapshots.output` is parsed through `parsePlan(json, plan_schema_version)`, which upgrades older versions to the current shape. `skill_evidence.payload` is parsed through `parseEvidencePayload(type, json, payload_version)`. Both have tests with fixtures for every historical version.

---

## 10. Transition engine specification

Location: `src/modules/planning/engine/`. Pure functions only. No imports from `platform/`, `next/`, the DB or other modules (type-only imports from `catalog`'s public API are allowed).

### 10.1 Types (reference shapes)

```ts
type Level = 1 | 2 | 3 | 4 | 5 | 6; // maps to the named competency levels

interface Profile {
  currentRoleSlug: string;
  yearsExperience: number;
  seniority: 'junior' | 'mid' | 'senior' | 'lead' | 'manager';
  skills: { skillSlug: string; level: Level; source: string /* evidence-type id */ }[];
}

interface ContentSnapshot {
  version: string;
  skills: Map<string, Skill>;
  edges: SkillEdge[];
  roles: Map<string, Role>;
  requirements: Map<string /*roleSlug*/, Requirement[]>;
  projects: Project[];
  transitionPaths: Map<string /*from->to*/, TransitionPath>;
}

type ItemClass = 'keep' | 'upgrade' | 'learn';

interface Reason { code: ReasonCode; params: Record<string, string | number> }

interface PlanItem {
  skillSlug: string;
  class: ItemClass;
  currentLevel: Level | 0;
  requiredLevel: Level;
  importance: 'core' | 'expected' | 'nice';
  effortHours: number;               // after transfer discount
  hoursSaved: number;                // base - effort
  upgradeFrom?: string;              // skill slug, for class = upgrade
  reasons: Reason[];                 // always non-empty
}

interface PlannedProject {
  projectSlug: string;
  order: number;
  covers: { skillSlug: string; level: Level }[];
  newlyCoveredSkills: string[];
  reasons: Reason[];
}

interface Plan {
  planSchemaVersion: number;
  engineVersion: string;             // ENGINE_VERSION at generation time
  contentVersion: string;
  fromRole: string; toRole: string;
  items: PlanItem[];
  learningOrder: string[];           // skill slugs, topologically sorted
  projects: PlannedProject[];
  uncoveredSkills: string[];         // gap skills no selected project covers
  totalEffortHours: number;
  warnings: Reason[];
}

function generatePlan(
  profile: Profile,
  targetRoleSlug: string,
  snapshot: ContentSnapshot,
  config: EngineConfig = DEFAULT_ENGINE_CONFIG,
  stages: Stage[] = DEFAULT_STAGES,
): Plan;
```

### 10.2 Configuration (no magic numbers in stages)

```ts
interface EngineConfig {
  impliedSkillsMinYears: number;                        // 3
  minSourceLevelForTransfer: Level;                     // 3 (can_build)
  seniorFundamentalEffortFactor: number;                // 0.5
  importanceWeights: Record<'core'|'expected'|'nice', number>; // 3 / 2 / 1
  maxProjects: number;                                  // 6
}
```

Strategies (section 10.6) may override config values for a role kind.

### 10.3 Pipeline and algorithm

`generatePlan` builds a `PlanContext` (profile, target, snapshot, config, strategy, working data) and runs the stages **in this order**. Each stage is its own file in `stages/`, pure, and independently unit-tested:

1. **`effectiveSkills`.** Start from `profile.skills`. Add `role_implied_skills` of the current role as `inferred_from_role` at their stated level, **only if** `yearsExperience >= config.impliedSkillsMinYears` and the skill is not already declared. Expand `equivalent` edges: owning X grants Y at the same level with source `inferred_from_role`, unless Y is declared.
2. **`requirements`.** Load the target role's requirements filtered by `applies_to_kind` containing the role kind (via the strategy's requirement filter). Apply path overrides (`force_include_skills`, `force_exclude_skills`).
3. **`classify`.** For each requirement R (skill S, required level T):
   - Let `cur` = effective level of S (0 if none).
   - If `cur >= T` → **keep**. `effortHours = 0`.
   - Else find the best incoming edge from any skill the user holds: edges of type `upgrade_of` or `bridge_to` with `to = S` and the source skill at effective level ≥ `config.minSourceLevelForTransfer`. Take the maximum `transfer_weight` as `w` (0 if none).
     - If such an edge exists with `w > 0` → **upgrade** (`upgradeFrom` = the best source skill).
     - Else → **learn**.
   - `levelFraction = (T - cur) / T`.
   - `effortHours = round(skill.base_hours × levelFraction × (1 − w))`; `hoursSaved = round(skill.base_hours × levelFraction × w)`.
   - Seniority modifier: if `seniority ∈ {senior, lead}` and `skill.fundamental` is true and `cur >= 2`, set `effortHours = round(effortHours × config.seniorFundamentalEffortFactor)`.
   - Attach **reason codes** (section 10.5); every item has at least one.
4. **`order`.** Over the `upgrade` and `learn` items, add `prerequisite_of` dependencies (even for skills not in the gap, so that a missing prerequisite is **added as a learn item with a `PREREQUISITE_FOR` reason**). Topologically sort; ties break by importance (core > expected > nice), then by lower `effortHours`, then slug (determinism). A cycle throws a typed `PrerequisiteCycleError` (content validation should have prevented it).
5. **`selectProjects`.** Greedy set cover:
   - Candidates: published (or draft in non-production) projects whose `covers` hit at least one gap skill at a level ≥ the required level, or that are listed in `project_sequence` overrides, after the strategy's project filter.
   - If `project_sequence` is provided, use it as the order and skip selection.
   - Else loop up to `config.maxProjects` times: for each unselected candidate whose `requires_projects` are selected and whose `requires_skills` are satisfied (by effective skills or by skills covered by already-selected projects), compute `score = Σ(importanceWeight × coveredGapEffort) / est_hours`, counting only gap skills not yet covered. Pick the highest score (ties → fewer `est_hours`, then slug). Stop if the best score is 0.
   - Project reasons list the newly covered gap skills and prerequisite relationships.
6. **`finalize`.** Compute `uncoveredSkills` (gap skills not covered at the required level by any selected project), `totalEffortHours`, and warnings (as reason codes): draft content used, uncovered `core` skills, unknown skill slugs in the profile. Stamp `engineVersion`, `planSchemaVersion` and `contentVersion`.

### 10.4 Determinism, caching, versioning

- Same input, snapshot version, config and engine version must produce a byte-identical `Plan` (stable sorting everywhere).
- Cache plan generation per (profile-hash, target, content_version, ENGINE_VERSION) for 10 minutes.
- `ENGINE_VERSION` (semver string in `version.ts`) **must be bumped whenever behaviour changes** (any change to stages, config defaults or strategies that alters output). A test (`tests/golden/manifest.test.ts`) compares a committed manifest `{ engineVersion, snapshotsHash }` to the current golden snapshots and fails if snapshots changed without the version and manifest being updated together.

### 10.5 Reason codes

`reasons.ts` defines `ReasonCode` as a closed union, for example: `KEEP_MEETS_LEVEL`, `KEEP_FROM_ROLE`, `UPGRADE_VIA_EDGE`, `LEARN_NO_OVERLAP`, `PREREQUISITE_FOR`, `PROJECT_COVERS_GAPS`, `PROJECT_REQUIRES_PROJECT`, `WARN_DRAFT_CONTENT`, `WARN_UNCOVERED_CORE`, `WARN_UNKNOWN_SKILL`.

`planning/ui/renderReason.ts` is the **only** place that turns a `Reason` into text. Reference templates:

- `KEEP_MEETS_LEVEL`: `"You already work with {skill} at {level}; the {targetRole} role expects {requiredLevel}."`
- `UPGRADE_VIA_EDGE`: `"{edgeNote} Because you know {fromSkill}, about {hoursSaved}h of effort is already covered."`
- `LEARN_NO_OVERLAP`: `"{skill} is {importance} for {targetRole} and nothing in your current stack covers it."`
- `PREREQUISITE_FOR`: `"Required before {nextSkill}."`

Storing codes plus params (not text) means copy changes never invalidate stored plans, golden snapshots stay stable, and other renderers (email, API, other languages) can reuse the same data. A test asserts every `ReasonCode` has a template.

### 10.6 Role-kind strategies

`strategies/registry.ts` maps role `kind` → `Strategy { configOverrides, filterRequirements, filterProjects }`. `ic` is the default. `manager` caps required levels at `can_build`, prefers projects tagged `manager-friendly`, and sets a flag the UI uses to hide hands-on build language. Adding a kind means adding a file and a registry entry.

### 10.7 Plan diffing
`diffPlans(old, new)` returns added, removed and changed (effort, class, reason codes) items and projects. Used for FR-3.4.

### 10.8 Golden tests (required)

Fixtures in `tests/golden/personas/*.json` for P1, P2, P3 (section 3.1) plus at least 5 edge cases (no declared skills; all skills already known; unknown skill slug; manager to IC; a path with `project_sequence` override). Golden tests build their snapshot via `FileContentRepository` from `/content` so any engine **or** content change shows a readable snapshot diff. Snapshots live in `tests/golden/__snapshots__`.

Unit tests (using a small fixture content set in `tests/fixtures/content`) must also cover: each stage in isolation, topological sort cycle error, transfer-weight arithmetic, seniority modifier, deterministic ordering, `equivalent` expansion, strategy fallback for an unknown kind, and every `ReasonCode` having a renderer template.

---

## 11. Evidence and repo verification

### 11.1 Check declaration (in project YAML)

```yaml
verification:
  checks:
    - id: has-dockerfile
      type: file_exists
      glob: "**/Dockerfile"
      required: true
      demonstrates: [{ skill: docker, level: can_build }]
    - id: has-ci
      type: file_exists
      glob: ".github/workflows/*.y*ml"
      required: true
      demonstrates: [{ skill: github-actions, level: can_build }]
    - id: nonroot-container
      type: file_contains
      glob: "**/Dockerfile"
      pattern: "^USER\\s+(?!root)"
      required: false
      demonstrates: [{ skill: docker, level: can_deploy }]
    - id: aws-deploy-config
      type: file_contains
      glob: "**/*.{yml,yaml,tf,json}"
      pattern: "(aws_ecs_service|AWS::ECS::Service|aws-actions/)"
      required: true
      demonstrates: [{ skill: aws-ecs, level: can_deploy }]
    - id: vector-dep
      type: dependency_contains
      files: ["pom.xml", "build.gradle", "package.json", "requirements.txt", "pyproject.toml"]
      pattern: "pgvector|chromadb|qdrant|pinecone|weaviate"
      required: true
      demonstrates: [{ skill: vector-databases, level: can_build }]
```

MVP check types: `file_exists`, `file_contains`, `dependency_contains`. They are implemented as **runners in the registry** (section 11.2), not hard-coded in the verification flow. Adding another type is adding a runner file and a registry line (recipe in `docs/EXTENDING.md`).

### 11.2 Check-runner interface and registry

```ts
interface CheckRunner<TSpec> {
  type: string;                                   // 'file_exists', ...
  specSchema: z.ZodType<TSpec>;                   // validates this check's YAML spec
  run(spec: TSpec, repo: RepoAccess): Promise<CheckResult>; // 'pass' | 'fail' | 'inconclusive' + detail
}
// Host-agnostic view of a repo with built-in budgets; runners never know about GitHub.
interface RepoAccess {
  listPaths(): Promise<string[]>;
  readFile(path: string): Promise<string | null>;   // enforces size and count budgets
}
```

The content schema's `checks` union is **generated from the registry**, so `content:validate` accepts a new check type the moment its runner is registered. `RepoAccess` is built from the `RepoHost` port (GitHub adapter in the MVP), so supporting another host later does not touch the runners.

### 11.3 Evidence-type registry

`evidence/evidence-types.ts` is the single source for evidence sources:

| Type | Label | Rank | Verified? |
|---|---|---|---|
| `inferred_from_role` | From your role | 0 | no |
| `self_declared` | Self-declared | 1 | no |
| `rubric_review` | Self-reviewed | 2 | no |
| `repo_check` | Repo-checked | 3 | yes |
| `human_review` | Human-reviewed (reserved, inactive) | 4 | yes |

Each entry also holds a tooltip. Badges, the portfolio, the dashboard and `user_skills` derivation all read this registry. A test asserts every `evidence_type` / `source` value used in the code exists in it.

### 11.4 Verification flow

1. Parse the repo URL with a strict regex (`^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+/?$`). Reject everything else.
2. Through the `RepoHost` port, fetch the default-branch tree via the GitHub REST API using the server `GITHUB_TOKEN`. Abort if the repo is private or missing, with a clear error.
3. Limits (typed config, not inline): skip blobs over 200 KB; read at most 25 blobs per run; cap the tree at 5,000 paths; overall timeout 25 s. On a cap hit, mark the check `inconclusive` (never `pass`).
4. Evaluate each declared check via its registered runner. Persist **every** run as `skill_evidence` rows (one row per skill-level claimed, with the full check results in `payload`, including repo URL, commit SHA and timestamp, plus `payload_version`).
5. A `demonstrates` claim passes only if all `required` checks that list that skill@level pass. Optional checks may raise a claim to a higher level only where declared.
6. Update `user_projects.status` (through `projects`' public API) to `verified` if all required checks pass, otherwise leave as `submitted`. Recompute `user_skills` as the highest-ranked evidence over declared.
7. Entitlement required: `billing.hasEntitlement(userId, key)` for any key in the project's `access.entitlement_keys_any`, else return 402 with the paywall payload.
8. The run is idempotent for the same commit SHA (return the existing result unless the user forces a re-run, within the daily limit).

### 11.5 UI labels

Evidence badges, always visible, are rendered from the evidence-type registry. A "Repo-checked" badge links to the check results (commit SHA, date).

---

## 12. Product surfaces and routes

### 12.1 Pages

| Route | Purpose | Auth |
|---|---|---|
| `/` | Landing page, transition picker | public |
| `/transitions/[slug]` | SEO page per published path | public (static) |
| `/start` | Onboarding wizard | public |
| `/map` | Anonymous plan view (from draft state) | public |
| `/plan/[planId]` | Saved plan, edit, update notice | owner |
| `/dashboard` | Progress overview | auth |
| `/projects/[slug]` | Project detail, skill coverage, rubric, submission, guided phases | public preview, entitlement for guided/verify |
| `/p/[slug]` | Public portfolio | public if enabled |
| `/settings` | Profile, portfolio toggle, account deletion | auth |
| `/checkout/[productKey]` | Provider checkout | auth |
| `/admin/engine-preview` | Engine playground | `ADMIN_EMAILS` |
| `/terms`, `/privacy`, `/refunds`, `/disclaimer`, `/contact` | Static | public |

### 12.2 Route handlers and actions (all thin: validate → call one module service)

| Endpoint | Method | Calls |
|---|---|---|
| `/api/auth/[...nextauth]` | * | `identity` (Auth.js config) |
| `/api/webhooks/[provider]` | POST | `billing.handleWebhook(provider, rawBody, headers)` |
| `/api/verify` | POST | `evidence.runVerification({projectSlug, repoUrl})` |
| `/api/cron/link-check` | GET | `ops.runLinkCheck()` (Vercel Cron, bearer secret) |
| Server action `generatePlanAction` | | `planning.generatePlanForProfile` |
| Server action `savePlanAction` | | `planning.savePlan` |
| Server action `updateSkillAction` | | `planning.updateSkillAndRegenerate` |
| Server action `startProjectAction` / `updatePhaseAction` | | `projects.*` |
| Server action `submitRubricAction` | | `evidence.submitRubric` |
| Server action `createOrderAction` | | `billing.createOrder` |
| Server action `togglePortfolioAction` | | `portfolio.*` |
| Server action `deleteAccountAction` | | `identity.deleteAccount` (runs lifecycle handlers) |

### 12.3 Feature flags (env-driven via the `FeatureFlags` port, default `false`)

`FEATURE_AI_JD_ANALYSIS`, `FEATURE_AI_RESUME_PARSE`, `FEATURE_HUMAN_REVIEW`, `FEATURE_SUBSCRIPTIONS`. They must be inert stubs with no code paths active in the MVP.

---

## 13. Analytics events

Defined once in `platform/analytics/events.ts` as `{ eventName: ZodPropsSchema }`. `Analytics.track(name, props)` is typed against it, and an unregistered event is a compile error.

Events: `landing_viewed`, `transition_page_viewed {slug}`, `wizard_started`, `wizard_step_completed {step}`, `plan_generated {from,to,authenticated}`, `plan_edited`, `plan_saved`, `signup_completed {provider}`, `paywall_viewed {product_key, surface}`, `checkout_started {product_key}`, `purchase_completed {product_key, amount_minor}`, `project_started {slug}`, `rubric_submitted {slug, passed}`, `verification_run {slug, passed, checks_passed, checks_total}`, `portfolio_made_public`, `portfolio_viewed {slug}` (server-side), `unmapped_transition_requested {from,to}` (waitlist).

Never send names, emails or repo URLs as event properties. Use the user ID only.

---

## 14. Environment variables (`src/platform/env.ts` must validate all)

```text
DATABASE_URL=
AUTH_SECRET=
AUTH_GITHUB_ID=            AUTH_GITHUB_SECRET=
AUTH_GOOGLE_ID=            AUTH_GOOGLE_SECRET=
NEXT_PUBLIC_APP_NAME=Transition
NEXT_PUBLIC_APP_URL=
GITHUB_TOKEN=              # server token for public-repo reads (no write scopes)
RAZORPAY_KEY_ID=           RAZORPAY_KEY_SECRET=       RAZORPAY_WEBHOOK_SECRET=
RESEND_API_KEY=            EMAIL_FROM=
NEXT_PUBLIC_POSTHOG_KEY=   NEXT_PUBLIC_POSTHOG_HOST=
SENTRY_DSN=                SENTRY_AUTH_TOKEN=
UPSTASH_REDIS_REST_URL=    UPSTASH_REDIS_REST_TOKEN=
ADMIN_EMAILS=              # comma-separated
CRON_SECRET=
FEATURE_AI_JD_ANALYSIS=false
FEATURE_AI_RESUME_PARSE=false
FEATURE_HUMAN_REVIEW=false
FEATURE_SUBSCRIPTIONS=false
```

Provide `.env.example` with these keys and no values. Provider credentials are read **only** by `platform/container.ts` and the adapters.

---

## 15. Build phases (execute in order)

Each phase: **deliverables → acceptance**. Commit per phase. Every phase must keep `pnpm typecheck && pnpm lint && pnpm test && pnpm arch:check` green.

### Phase 0: Scaffold, tooling and platform skeleton
- Next.js + TS strict, Tailwind, shadcn/ui, ESLint, Prettier, Vitest, Playwright, pnpm scripts (`dev, build, lint, typecheck, test, test:e2e, db:generate, db:migrate, content:validate, content:seed, content:migrate, arch:check`).
- `src/platform`: `env.ts`, all **port interfaces**, **fake adapters**, `container.ts` with `createCtx`, the `UserLifecycle` registry, the analytics events registry (empty or minimal).
- `.dependency-cruiser.cjs` implementing the rules in 5.4 and the dependency map in 6.4 (module entry points, no cycles, vendor SDKs only in adapters, `app/**` cannot import `platform/db` or module internals).
- `docs/ARCHITECTURE.md` (module map and rules), `docs/EXTENDING.md` (recipe headings), `docs/ASSUMPTIONS.md`, `docs/adr/0001-modular-monolith.md`, `docs/adr/0002-ports-and-adapters.md`.
- GitHub Actions CI, security headers, `.env.example`.
- **Accept:** CI green on an empty app; `pnpm build` succeeds; `arch:check` fails on a deliberately added forbidden import in a test fixture.

### Phase 1: `catalog` module: content schema, validator, seed
- Zod schemas (section 8) with `schema_version`, graph validation rules (8.3 incl. aliases and retired-slug rule), content-schema upgrader scaffold (8.5), `ContentRepository` with `FileContentRepository` and `DbContentRepository`, Drizzle tables for content, draft seed content (8.4), `content:seed` (idempotent, alias-aware, never deletes referenced rows, writes the manifest in `content_versions`).
- **Accept:** `content:validate` passes on seed content and fails on deliberately broken fixtures (cycle, missing slug, bad weight, vanished slug without alias/retired, unknown check type); seeding twice produces no duplicates; an old-`schema_version` fixture upgrades correctly.

### Phase 2: `planning/engine` and golden tests
- Everything in section 10: pipeline, stages, strategies, config, `ENGINE_VERSION`, reason codes and renderer, `diffPlans`, `parsePlan` upgrader scaffold.
- **Accept:** golden snapshots for P1–P3 and 5 edge cases; the version-manifest test works (changing a snapshot without bumping the version fails); the engine imports nothing outside its allowed set (dependency-cruiser); determinism test passes; every `ReasonCode` has a template.

### Phase 3: `identity`, profile and onboarding wizard
- Auth.js with GitHub/Google (Drizzle adapter), consent step, `profiles` (planning module), wizard (FR-2) including draft persistence and migration on sign-in, waitlist for unmapped targets (`marketing`), account-deletion orchestration with the lifecycle registry (handlers registered by each module as it is built).
- **Accept:** Playwright test completes the wizard anonymously, signs in (mocked provider), and the profile persists; deletion test passes for the modules that exist so far.

### Phase 4: Map UI and plan snapshots
- `/map`, `/plan/[planId]`, editing skills, hours-per-week, snapshots with `engine_version` and `plan_schema_version`, content-or-engine-version update notice with diff, `/admin/engine-preview` (using `FileContentRepository` option).
- **Accept:** FR-3 satisfied; changing seed content or bumping `ENGINE_VERSION` shows the update notice; map p95 under 300 ms on seed data (timing assertion with generous headroom); an old-version stored plan fixture still renders.

### Phase 5: `projects` and `evidence` basics: progress and competency
- Project pages, skill coverage table, rubric review, guided project Markdown rendering with preview gating (entitlement check stubbed through `billing.hasEntitlement`, returning false until Phase 8), project status, dashboard, **evidence-type registry**, `user_skills` derivation by rank.
- **Accept:** FR-4, FR-5; rubric evidence saved and badges rendered from the registry; a test adds a fake evidence type to the registry and verifies badge and ranking behaviour without other code changes.

### Phase 6: Repo verification
- `RepoHost` GitHub adapter, check-runner registry with the three runners, `RepoAccess` budgets, evidence persistence, UI results, rate limiting, entitlement gate.
- **Accept:** unit tests with a fixture repo host covering pass, fail, inconclusive, oversize blob, private repo, malformed URL (SSRF cases like `http://169.254.169.254`, `https://github.com.evil.com/x/y` rejected); append-only evidence verified by a test that attempts an update; a test registers a **fourth fake runner** and shows `content:validate` accepts its type with no other code changes.

### Phase 7: Portfolio
- FR-7 incl. DTO whitelist, slug regeneration, print stylesheet, OG image, lifecycle handler.
- **Accept:** private portfolio returns 404 to others; public page shows evidence badges; fields outside the DTO never appear (test serialises output and asserts the allowed key set).

### Phase 8: `billing`: payments and entitlements
- Product config, `PaymentProvider` port with Razorpay adapter and `FakePaymentProvider`, `/api/webhooks/[provider]`, order creation, checkout page, normalised events, idempotent grants, `expires_at`/`revoked_at` handling, receipt page, paywall components, real entitlement checks in projects and verification, lifecycle handler (anonymise payments).
- **Accept:** replaying the same webhook twice grants once; invalid signature returns 400 and grants nothing; client redirect alone never unlocks content (test); an expired or revoked entitlement denies access; the whole purchase flow runs end to end against `FakePaymentProvider`, proving the port is sufficient.

### Phase 9: SEO, analytics, email, cron
- Transition pages with JSON-LD, sitemap, robots, analytics events via the typed port, Resend emails via `EmailSender`, link-check cron (`ops`), Sentry.
- **Accept:** `sitemap.xml` lists only published paths; Lighthouse SEO ≥ 95 on a transition page; all events in section 13 fire in an e2e smoke test (recorder adapter).

### Phase 10: Hardening, documentation and launch checklist
- Run through section 5.1 line by line, add missing tests, accessibility pass (axe in Playwright on key pages), account deletion e2e, legal pages, 404/500 pages.
- Complete `docs/EXTENDING.md` with all nine recipes (6.8) **and verify each by following it once** (for example, adding a trivial check type or analytics event in a scratch branch). Fill in `docs/ARCHITECTURE.md` and the ADRs.
- README with setup and content-authoring guide.
- **Accept:** all e2e pass; `pnpm audit` has no high/critical issues; deletion test confirms no residual user-owned rows (payments anonymised); architecture tests pass (dependency rules, lifecycle coverage, registry coverage).

---

## 16. Definition of done (MVP)

- All FR items implemented with their acceptance criteria.
- CI green: typecheck, lint, `arch:check`, `content:validate`, unit, golden, architecture, e2e, build.
- Engine is pure, staged, versioned and deterministic with golden tests and a version manifest.
- All external services sit behind ports with fakes; swapping a provider requires only a new adapter and a container change.
- Security checklist complete and tested.
- Stored data is versioned and upgradable (content, plans, evidence payloads).
- `docs/ARCHITECTURE.md`, `docs/EXTENDING.md` and ADRs exist and are accurate; the README documents setup, environment, content authoring and the engine preview.
- `docs/ASSUMPTIONS.md` lists every decision made where this spec was silent.

---

## 17. Post-MVP roadmap (do **not** build now) and where each item plugs in

| Item | Extension point |
|---|---|
| Human review marketplace | Activate the `human_review` evidence type (registry), add a review workflow inside `evidence`, new product in `billing/products.ts` |
| Job-description analysis (LLM, flagged, usage-capped) | New `ai` port + adapter, new service in `planning`; engine stays deterministic and consumes the extracted skills |
| Resume-to-skill suggestion (LLM, user confirms every skill) | Same `ai` port; output feeds the wizard as suggested skills with source `self_declared` after confirmation |
| Subscriptions | Products with `durationDays`, `expires_at` already supported; add provider subscription events to the normalised event type |
| Second payment provider (Stripe) | New `PaymentProvider` adapter; no domain changes |
| Team/organisation features | Use the reserved `org_id`; add an `orgs` module that depends on `identity` and `billing`; no changes to the engine |
| More transitions | Content only (recipe 1) |
| Public API or mobile client | Route handlers calling the same module services (already Zod-typed and serialisable) |
| Extracting the engine or verification into a service | Both are already behind a public API with no cross-module queries (recipe 9) |

---

## 18. Open decisions for the human owner (do not block the build)

1. Final product name and domain.
2. Final pricing (config only; examples are unvalidated).
3. GST registration and invoicing process.
4. Authoring and review process for real content, and who the practitioner reviewers are.
5. Whether guided projects are partly hosted in a separate public template repo each (assumed: yes, linked from the Markdown).
6. Whether to allow search indexing of public portfolios by default (assumed: no).
7. Whether to promote the pure engine to a separate workspace package now (assumed: no; keep it a folder with enforced boundaries and extract only when a second consumer exists).

---

## 19. Glossary

- **Keep / Upgrade / Learn:** the three plan classes for target skills.
- **Edge:** a relationship between two skills that reduces learning effort (`transfer_weight`) or imposes order.
- **Evidence:** a recorded, typed, append-only claim that a user demonstrated a skill at a level.
- **Content version:** hash of the content directory at seed time; plans are pinned to it.
- **Engine version:** `ENGINE_VERSION`, bumped on any behaviour change; plans record it.
- **Golden test:** a snapshot test of full engine output for a fixed persona.
- **Module:** a folder under `src/modules` with one public `index.ts`, owned tables and fixed dependency direction.
- **Port / Adapter:** an interface the domain depends on / the vendor-specific implementation of it.
- **Registry:** a lookup of pluggable implementations (check runners, evidence types, strategies, events, products).
- **Reason code:** a stable identifier plus params describing why the engine made a recommendation; rendered to text in one place.
