import { z } from "zod";
import type { CheckRunner } from "./types";
import {
  fileExistsRunner,
  fileExistsSpecSchema,
} from "./runners/fileExists";
import {
  fileContainsRunner,
  fileContainsSpecSchema,
} from "./runners/fileContains";
import {
  dependencyContainsRunner,
  dependencyContainsSpecSchema,
} from "./runners/dependencyContains";

const runners = new Map<string, CheckRunner<unknown>>([
  [fileExistsRunner.type, fileExistsRunner as unknown as CheckRunner<unknown>],
  [fileContainsRunner.type, fileContainsRunner as unknown as CheckRunner<unknown>],
  [dependencyContainsRunner.type, dependencyContainsRunner as unknown as CheckRunner<unknown>],
]);

export function registerCheckRunner<TSpec>(runner: CheckRunner<TSpec>): void {
  runners.set(runner.type, runner as unknown as CheckRunner<unknown>);
}

export function getCheckRunner(type: string): CheckRunner<unknown> | undefined {
  return runners.get(type);
}

export function getAllCheckRunners(): CheckRunner<unknown>[] {
  return Array.from(runners.values());
}

export function isCheckRunnerRegistered(type: string): boolean {
  return runners.has(type);
}

/**
 * Builds a discriminating Zod union schema across all registered runners.
 */
export function getCheckUnionSchema(): z.ZodTypeAny {
  const runnerList = getAllCheckRunners();
  if (runnerList.length === 0) {
    return z.never();
  }
  if (runnerList.length === 1) {
    return runnerList[0]!.specSchema;
  }
  const schemas = runnerList.map((r) => r.specSchema) as [
    z.ZodDiscriminatedUnionOption<"type">,
    z.ZodDiscriminatedUnionOption<"type">,
    ...z.ZodDiscriminatedUnionOption<"type">[],
  ];
  return z.discriminatedUnion("type", schemas);
}

// Built-in static fallback union for compile-time types
export const baseCheckSchema = z.discriminatedUnion("type", [
  fileExistsSpecSchema,
  fileContainsSpecSchema,
  dependencyContainsSpecSchema,
]);

export type CheckSpec = z.infer<typeof baseCheckSchema>;
