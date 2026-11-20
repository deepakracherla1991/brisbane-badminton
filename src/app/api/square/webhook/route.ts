import { WebhooksHelper } from "square";
import { confirmCardPayment } from "@/lib/enrolment/payments";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Square webhook (subscribe to "payment.created" and "payment.updated").
 * Marks card enrolments as paid even if the parent closes the tab before returning to the site.
 */
export async function POST(req: Request) {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const notificationUrl = process.env.SQUARE_WEBHOOK_URL;
  if (!signatureKey || !notificationUrl || !isAdminClientConfigured) return new Response("Webhook not configured", { status: 503 });

  const body = await req.text();
  const valid = await WebhooksHelper.verifySignature({
    requestBody: body,
    signatureHeader: req.headers.get("x-square-hmacsha256-signature") ?? "",
    signatureKey,
    notificationUrl,
  });
  if (!valid) return new Response("Invalid signature", { status: 403 });

  let event: { type?: string; data?: { object?: { payment?: { order_id?: string; status?: string } } } };
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const payment = event.data?.object?.payment;
  if ((event.type === "payment.created" || event.type === "payment.updated") && payment?.status === "COMPLETED" && payment.order_id) {
    // The body is only a hint: confirmCardPayment re-checks the order with Square before marking it paid.
    const origin = new URL(notificationUrl).origin;
    const { state } = await confirmCardPayment({ orderId: payment.order_id }, origin);
    if (state === "error") return new Response("Retry later", { status: 500 });
  }
  return new Response("ok");
}
