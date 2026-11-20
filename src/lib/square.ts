import "server-only";
import { SquareClient, SquareEnvironment, SquareError } from "square";

/**
 * Square card payments (hosted checkout via Payment Links).
 * Set SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID (and SQUARE_ENVIRONMENT=production when live).
 */
const token = process.env.SQUARE_ACCESS_TOKEN ?? "";
const locationId = process.env.SQUARE_LOCATION_ID ?? "";
const environment = process.env.SQUARE_ENVIRONMENT === "production" ? SquareEnvironment.Production : SquareEnvironment.Sandbox;

export const isSquareConfigured = Boolean(token && locationId);

let client: SquareClient | null = null;
function square() {
  // SQUARE_BASE_URL is only for automated tests against a fake Square server.
  client ??= new SquareClient({ token, environment, baseUrl: process.env.SQUARE_BASE_URL || undefined, timeoutInSeconds: 20 });
  return client;
}

export function describeSquareError(e: unknown) {
  if (e instanceof SquareError) return `${e.statusCode ?? ""} ${e.errors?.map((x) => `${x.code}: ${x.detail}`).join("; ") || e.message}`.trim();
  return e instanceof Error ? e.message : String(e);
}

/** Creates a Square-hosted checkout page for one enrolment. Returns the page URL and Square order id. */
export async function createCheckout(opts: {
  reference: string;
  name: string;
  amountCents: number;
  buyerEmail: string;
  redirectUrl: string;
  note: string;
}) {
  const res = await square().checkout.paymentLinks.create({
    idempotencyKey: `${opts.reference}-${opts.amountCents}`,
    quickPay: {
      name: opts.name.slice(0, 255),
      priceMoney: { amount: BigInt(opts.amountCents), currency: "AUD" },
      locationId,
    },
    checkoutOptions: {
      redirectUrl: opts.redirectUrl,
      askForShippingAddress: false,
      allowTipping: false,
      merchantSupportEmail: process.env.EMAIL_REPLY_TO || undefined,
    },
    prePopulatedData: { buyerEmail: opts.buyerEmail },
    paymentNote: opts.note.slice(0, 500),
  });
  const link = res.paymentLink;
  if (!link?.url || !link.orderId) throw new Error("Square didn't return a checkout link.");
  return { url: link.url, orderId: link.orderId, linkId: link.id ?? null };
}

/**
 * Checks with Square whether an order has been fully paid.
 * Only trusts Square's own records, never what the browser or a webhook body claims.
 */
export async function checkOrderPaid(orderId: string, expectedCents: number) {
  const { order } = await square().orders.get({ orderId });
  if (!order || order.locationId !== locationId) return { paid: false as const };
  const paymentIds = (order.tenders ?? []).map((t) => t.paymentId).filter((id): id is string => !!id);
  let paidCents = 0;
  let paymentId: string | null = null;
  for (const id of paymentIds) {
    const { payment } = await square().payments.get({ paymentId: id });
    if (payment?.status === "COMPLETED" && payment.orderId === orderId) {
      paidCents += Number(payment.amountMoney?.amount ?? 0);
      paymentId ??= payment.id ?? null;
    }
  }
  return paidCents >= expectedCents && paymentId ? { paid: true as const, paymentId } : { paid: false as const };
}
