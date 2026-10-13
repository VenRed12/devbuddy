export interface EmailSender {
  send(template: string, to: string, data: Record<string, unknown>): Promise<void>;
}
