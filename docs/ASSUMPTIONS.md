# Engineering & Product Assumptions

This document records explicit architectural, product, and engineering choices made during development.

1. **Deterministic Engine:** The platform transition engine operates purely deterministically without LLM/AI runtime dependencies. AI features are represented only by disabled feature flag stubs.
2. **File vs Database Content in Tests:** `FileContentRepository` directly reads, parses, and validates the YAML files in `/content`. Unit tests and golden tests execute against this file repository, ensuring tests are hermetic and run without a live Postgres connection.
3. **Database Drivers & Migrations:** Drizzle ORM is used with PostgreSQL (Neon serverless driver or standard Postgres). Migrations are produced via Drizzle Kit. Enumerated sets use `text` columns with CHECK constraints to allow seamless schema updates without migration locks.
4. **Ports and Test Fakes:** All external services (Razorpay, Resend, PostHog, GitHub, Upstash) have corresponding fake implementations in `src/platform/adapters/fakes/` to support tests and local development without cloud credentials.
5. **Tax Invoicing & Payments:** As documented in the specification (FR-8.4), tax invoice and GST compliance is handled out-of-band by the operator's accounting team. The application records payment IDs and provides a receipt view.
6. **Guided Project Markdown:** Guided project phases are stored in `content/projects-guided/<slug>/<phase>.md` and rendered into the application.
