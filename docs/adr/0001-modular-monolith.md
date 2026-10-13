# ADR 0001: Modular Monolith Architecture

## Status
Accepted

## Context
The application serves experienced professionals transitioning career paths. It requires fast iterations, unified type safety, content-as-code seeding, and a pure calculation engine, but also needs high boundaries to prevent spaghetti code and allow future extraction into services or separate packages.

## Decision
Adopt a Modular Monolith architecture within Next.js App Router:
- Each domain lives in `src/modules/<name>/` with a single entry point `index.ts`.
- Deep internal imports into a module are strictly forbidden.
- Each module owns its own database tables and queries. Direct cross-module queries are disallowed.
- Boundaries are mechanically enforced using `dependency-cruiser` (`pnpm arch:check`).

## Consequences
- Clean separation of concerns.
- Easy testing in isolation.
- Direct path to extract individual modules (such as the engine or verification runner) if needed later.
