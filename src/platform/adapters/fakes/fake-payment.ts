import type {
  CreateOrderInput,
  CreateOrderResult,
  NormalizedPaymentEvent,
  PaymentProvider,
} from "../../ports/payment";

export class FakePaymentProvider implements PaymentProvider {
  public readonly id = "fake";
  public orders: Array<{ id: string; input: CreateOrderInput }> = [];
  public webhookToReturn: NormalizedPaymentEvent | null = null;
  public simulateInvalidWebhook = false;

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const providerOrderId = `fake_order_${this.orders.length + 1}`;
    this.orders.push({ id: providerOrderId, input });
    return {
      providerOrderId,
      clientPayload: { orderId: providerOrderId, amount: input.amountMinor },
    };
  }

  async parseWebhook(
    rawBody: string,
    _headers: Headers,
  ): Promise<NormalizedPaymentEvent | null> {
    if (this.simulateInvalidWebhook) {
      throw new Error("Invalid signature");
    }
    if (this.webhookToReturn) {
      return this.webhookToReturn;
    }
    try {
      const parsed = JSON.parse(rawBody) as NormalizedPaymentEvent;
      return parsed;
    } catch {
      return null;
    }
  }
}
