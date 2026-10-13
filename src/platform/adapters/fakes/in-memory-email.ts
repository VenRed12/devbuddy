import type { EmailSender } from "../../ports/email";

export interface SentEmail {
  template: string;
  to: string;
  data: Record<string, unknown>;
  sentAt: Date;
}

export class InMemoryEmailSender implements EmailSender {
  public outbox: SentEmail[] = [];

  async send(template: string, to: string, data: Record<string, unknown>): Promise<void> {
    this.outbox.push({
      template,
      to,
      data,
      sentAt: new Date(),
    });
  }

  clear(): void {
    this.outbox = [];
  }
}
