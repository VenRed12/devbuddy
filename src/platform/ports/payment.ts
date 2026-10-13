export interface NormalizedPaymentEvent {
  eventId: string;
  type: "payment.succeeded" | "payment.failed" | "payment.refunded";
  providerOrderId: string;
  providerPaymentId: string;
  amountMinor: number;
  currency: string;
}

export interface CreateOrderInput {
  amountMinor: number;
  currency: string;
  receipt: string;
  metadata: Record<string, string>;
}

export interface CreateOrderResult {
  providerOrderId: string;
  clientPayload: unknown;
}

export interface PaymentProvider {
  readonly id: string;
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  parseWebhook(rawBody: string, headers: Headers): Promise<NormalizedPaymentEvent | null>;
}
