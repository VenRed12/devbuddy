import type { Logger } from "../../ports/logger";

export interface LogEntry {
  level: "info" | "warn" | "error" | "debug";
  message: string;
  error?: unknown;
  context?: Record<string, unknown>;
}

export class SilentLogger implements Logger {
  public logs: LogEntry[] = [];

  info(message: string, context?: Record<string, unknown>): void {
    this.logs.push({ level: "info", message, context });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.logs.push({ level: "warn", message, context });
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    this.logs.push({ level: "error", message, error, context });
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.logs.push({ level: "debug", message, context });
  }

  clear(): void {
    this.logs = [];
  }
}
