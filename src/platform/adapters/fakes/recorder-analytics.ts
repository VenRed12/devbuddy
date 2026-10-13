import type { Analytics } from "../../ports/analytics";

export interface RecordedEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: Date;
}

export interface RecordedIdentify {
  userId: string;
  traits?: Record<string, unknown>;
  timestamp: Date;
}

export class RecorderAnalytics implements Analytics {
  public events: RecordedEvent[] = [];
  public identities: RecordedIdentify[] = [];

  async track(event: string, properties?: Record<string, unknown>): Promise<void> {
    this.events.push({
      event,
      properties,
      timestamp: new Date(),
    });
  }

  async identify(userId: string, traits?: Record<string, unknown>): Promise<void> {
    this.identities.push({
      userId,
      traits,
      timestamp: new Date(),
    });
  }

  clear(): void {
    this.events = [];
    this.identities = [];
  }
}
