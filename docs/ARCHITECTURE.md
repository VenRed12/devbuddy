# Architecture Guide

## 1. Overview

Career Transition Evidence Platform is built as a **Modular Monolith** using Next.js (App Router), TypeScript, and PostgreSQL (via Drizzle ORM).
External services (payments, email, analytics, repo hosting, rate limiting, logging, clock, lifecycle) are accessed exclusively via **Ports & Adapters**.

```text
Browser ──▶ src/app (Thin routing layer: pages, server actions, route handlers)
                │ via each module's index.ts only
            src/modules (Domain modules: catalog, planning, identity, projects, evidence, portfolio, billing, marketing, ops)
                │ depends on interfaces only
            src/platform (ports/, adapters/, container.ts, db, env)
                ▼
            Postgres / External APIs
```

## 2. Module Boundaries & Ownership

Each domain module lives in `src/modules/<name>/` and has a single public entry point: `index.ts`.
Deep imports into module internals (e.g. `src/modules/catalog/domain/skill`) from other modules or from `src/app` are forbidden.
Cross-module queries are forbidden: each module owns its tables and data access.

### Allowed Dependencies

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

The `planning/engine` sub-folder is pure and depends on nothing except type imports from `catalog`'s public API.

## 3. Ports and Adapters

Domain modules depend strictly on interfaces declared in `src/platform/ports/`.
Vendor SDKs (e.g., Razorpay, Resend, PostHog, Octokit, Upstash) are isolated inside `src/platform/adapters/`.
In tests, lightweight fakes from `src/platform/adapters/fakes/` are used to ensure determinism, speed, and zero external network calls.

Wiring is performed at the composition root: `src/platform/container.ts`.

## 4. Architectural Rules Enforced by Tooling

1. `pnpm arch:check` (`dependency-cruiser`) asserts:
   - No deep module imports.
   - No cyclic dependencies.
   - Vendor SDK imports restricted to `src/platform/adapters/**`.
   - `src/app/**` does not access `platform/db` or module internals directly.
   - `src/modules/planning/engine/**` has zero imports from platform, app, db or vendor SDKs.
2. User-lifecycle hooks: Each module storing user data registers an `onUserDeleted` handler with `UserLifecycle`.
