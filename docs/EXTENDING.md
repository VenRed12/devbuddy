# Extension Recipes

This document provides clear, concise recipes for extending the Career Transition Evidence Platform.

---

## 1. Add a New Transition
**Content-only change. No application code edits required.**
1. Ensure both `from_role` and `to_role` exist under `content/roles/*.yaml`.
2. Ensure required skills and requirements exist under `content/skills/*.yaml` and `content/requirements/*.yaml`.
3. Create `content/transitions/<from>-to-<to>.yaml` with `slug`, `from_role`, `to_role`, `title`, `summary`, `faqs`, and optional `overrides`.
4. Add relevant projects under `content/projects/*.yaml` covering the core skills.
5. Run `pnpm content:validate` to ensure graph integrity.
6. Run `pnpm content:seed` to update database snapshot.

---

## 2. Add a New Verification Check Type
1. Define the check spec schema and runner in `src/modules/evidence/verification/runners/<checkType>.ts` implementing `CheckRunner<TSpec>`.
2. Register the runner in `src/modules/evidence/verification/registry.ts`.
3. The content schema's `checks` union automatically includes the new type.
4. Add test fixtures and verify in `tests/catalog/validation.test.ts`.

---

## 3. Add a New Evidence Type
1. Add the type definition to `src/modules/evidence/evidence-types.ts` with `{ type, label, tooltip, rank, isVerified }`.
2. Add corresponding badge rendering configuration in evidence UI components.
3. Update unit tests to verify badge and ranking behavior.

---

## 4. Add a Second Payment Provider (e.g., Stripe)
1. Implement the `PaymentProvider` port interface (`src/platform/ports/payment.ts`) in `src/platform/adapters/stripe/`.
2. Register the adapter in `src/platform/container.ts`.
3. In `/api/webhooks/[provider]`, resolve the provider from the route param `provider`.
4. Domain billing logic remains untouched as it relies solely on `NormalizedPaymentEvent`.

---

## 5. Add a New Engine Stage or Role-Kind Strategy
1. For an engine stage: Create a pure stage function `(ctx: PlanContext) => PlanContext` under `src/modules/planning/engine/stages/`.
2. Insert the stage into `DEFAULT_STAGES` in `src/modules/planning/engine/pipeline.ts`.
3. For a role-kind strategy: Implement `Strategy` under `src/modules/planning/engine/strategies/` and register in `src/modules/planning/engine/strategies/registry.ts`.
4. Bump `ENGINE_VERSION` in `src/modules/planning/engine/version.ts` and update the golden test snapshot manifest.

---

## 6. Add a New Analytics Event
1. Add the event name and Zod props schema to `src/platform/analytics/events.ts`.
2. Call `ctx.ports.analytics.track("event_name", props)` from your service layer with full type safety.

---

## 7. Add a Field to Content or Stored JSON
1. Update Zod schema in `src/modules/catalog/domain/` with an optional or default value.
2. Bump `schema_version` (or `payload_version`/`plan_schema_version`).
3. Add an in-memory upgrader in `src/modules/catalog/migrations/` (e.g. `v1ToV2.ts`).
4. Update `scripts/content-migrate.ts` for disk migrations and add test fixtures for previous versions.

---

## 8. Add a New Module
1. Create directory `src/modules/<moduleName>/` with:
   - `index.ts` (public API exports only)
   - `schema.ts` (owned Drizzle tables)
   - `service.ts` (use cases receiving `Ctx`)
   - `domain/` and `data/` subfolders as needed.
2. Register module tables in `src/platform/db/schema.ts`.
3. Add module entry and allowed dependencies to `.dependency-cruiser.cjs`.
4. If module stores user data, register an `onUserDeleted` handler with `UserLifecycle`.

---

## 9. Extract a Module into an Independent Service
Because each module:
- Is accessed solely via its public `index.ts`.
- Has Zod-typed, serializable input and output DTOs.
- Has zero direct cross-module database joins or queries.
- Depends on external systems via ports.

Extraction involves wrapping the module's `service.ts` entry points with an HTTP/gRPC route handler in a standalone service, creating an API client adapter in the platform layer, and replacing direct calls without refactoring domain logic.
