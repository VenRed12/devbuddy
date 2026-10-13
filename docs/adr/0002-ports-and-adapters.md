# ADR 0002: Ports and Adapters Pattern

## Status
Accepted

## Context
The platform integrates with external vendors for payments (Razorpay), email delivery (Resend), analytics (PostHog), repository inspection (GitHub), and rate limiting (Upstash). Direct coupling to vendor SDKs throughout the application would complicate testing and make provider swaps difficult.

## Decision
Apply the Ports and Adapters (Hexagonal Architecture) pattern:
- Define port interfaces in `src/platform/ports/` (`PaymentProvider`, `EmailSender`, `Analytics`, `RepoHost`, `RateLimiter`, `FeatureFlags`, `Logger`, `Clock`, `UserLifecycle`).
- Implement real vendor adapters in `src/platform/adapters/<vendor>/`.
- Implement lightweight fake adapters in `src/platform/adapters/fakes/` for testing and local dev.
- Dependency rules strictly forbid vendor SDK imports outside `src/platform/adapters/**`.
- Container (`src/platform/container.ts`) wires ports and supplies `Ctx` (`{ userId?, ports, now }`) to services.

## Consequences
- Testing never touches external networks or requires credentials.
- Swapping providers (e.g. Razorpay to Stripe) requires writing a new adapter without touching domain logic.
