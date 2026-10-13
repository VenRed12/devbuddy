import type { Analytics } from "./ports/analytics";
import type { Clock } from "./ports/clock";
import type { EmailSender } from "./ports/email";
import type { FeatureFlags } from "./ports/flags";
import type { UserLifecycle } from "./ports/lifecycle";
import type { Logger } from "./ports/logger";
import type { PaymentProvider } from "./ports/payment";
import type { RateLimiter } from "./ports/rate-limit";
import type { RepoHost } from "./ports/repo-host";

import { FakePaymentProvider } from "./adapters/fakes/fake-payment";
import { InMemoryEmailSender } from "./adapters/fakes/in-memory-email";
import { RecorderAnalytics } from "./adapters/fakes/recorder-analytics";
import { FixtureRepoHost } from "./adapters/fakes/fixture-repo-host";
import { InMemoryRateLimiter } from "./adapters/fakes/in-memory-rate-limiter";
import { StaticFeatureFlags } from "./adapters/fakes/static-flags";
import { SilentLogger } from "./adapters/fakes/silent-logger";
import { SystemClock } from "./adapters/fakes/fixed-clock";
import { UserLifecycleRegistry } from "./adapters/lifecycle-registry";
import { env } from "./env";

export interface Ports {
  payment: PaymentProvider;
  email: EmailSender;
  analytics: Analytics;
  repoHost: RepoHost;
  rateLimiter: RateLimiter;
  flags: FeatureFlags;
  logger: Logger;
  clock: Clock;
  lifecycle: UserLifecycle;
}

export interface Ctx {
  userId?: string;
  ports: Ports;
  now: Date;
}

let defaultPorts: Ports | null = null;

export function getPorts(): Ports {
  if (!defaultPorts) {
    defaultPorts = {
      payment: new FakePaymentProvider(),
      email: new InMemoryEmailSender(),
      analytics: new RecorderAnalytics(),
      repoHost: new FixtureRepoHost(),
      rateLimiter: new InMemoryRateLimiter(),
      flags: new StaticFeatureFlags({
        FEATURE_AI_JD_ANALYSIS: env.FEATURE_AI_JD_ANALYSIS,
        FEATURE_AI_RESUME_PARSE: env.FEATURE_AI_RESUME_PARSE,
        FEATURE_HUMAN_REVIEW: env.FEATURE_HUMAN_REVIEW,
        FEATURE_SUBSCRIPTIONS: env.FEATURE_SUBSCRIPTIONS,
      }),
      logger: new SilentLogger(),
      clock: new SystemClock(),
      lifecycle: new UserLifecycleRegistry(),
    };
  }
  return defaultPorts;
}

export function createCtx(options: { userId?: string; ports?: Ports } = {}): Ctx {
  const ports = options.ports ?? getPorts();
  return {
    userId: options.userId,
    ports,
    now: ports.clock.now(),
  };
}
