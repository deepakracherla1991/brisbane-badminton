import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkOrderPaid, describeSquareError } from "@/lib/square";
import { sendEnrolmentReceived } from "@/lib/email";
import { plans, programs } from "@/content/enrolment";
import { sessionLabel } from "./validate";
import type { Application } from "./types";

export type CardPaymentState = "paid" | "unpaid" | "not-found" | "not-card" | "error";

/**
 * Checks a card enrolment's Square order and, if paid, marks it verified and sends the emails.
 * Safe to call repeatedly (return page, webhook): it only updates and emails once.
 */
export async function confirmCardPayment(by: { reference?: string; orderId?: string }, origin: string): Promise<{ state: CardPaymentState; app?: Application }> {
  const db = createAdminClient();
  let query = db.from("enrolment_applications").select("*").limit(1);
  if (by.reference) query = query.eq("reference", by.reference);
  else if (by.orderId) query = query.eq("square_order_id", by.orderId);
  else return { state: "not-found" };
  const { data: app } = await query.maybeSingle<Application & { square_order_id: string | null }>();
  if (!app) return { state: "not-found" };
  if (app.payment_method !== "card" || !app.square_order_id || app.total_cents == null) return { state: "not-card", app };
  if (app.payment_status === "verified") return { state: "paid", app };

  try {
    const result = await checkOrderPaid(app.square_order_id, app.total_cents);
    if (!result.paid) return { state: "unpaid", app };

    // Only the first caller to flip pending -> verified sends the emails.
    const { data: updated } = await db
      .from("enrolment_applications")
      .update({ payment_status: "verified", square_payment_id: result.paymentId, paid_at: new Date().toISOString() })
      .eq("id", app.id)
      .eq("payment_status", "pending")
      .select("*")
      .maybeSingle<Application>();

    if (updated) {
      await sendEnrolmentReceived({
        reference: updated.reference,
        parentEmail: updated.email,
        parentName: updated.parent_name,
        playerName: updated.player_name,
        program: programs.find((p) => p.id === updated.program)?.name ?? updated.program,
        plan: plans.find((p) => p.id === updated.plan)?.name ?? "",
        sessions: updated.sessions.map(sessionLabel),
        totalCents: updated.total_cents,
        discountCents: updated.discount_cents,
        paymentMethod: "card",
        paid: true,
        origin,
      });
    }
    return { state: "paid", app: updated ?? app };
  } catch (e) {
    console.error(`[square] Couldn't check order for ${app.reference}: ${describeSquareError(e)}`);
    return { state: "error", app };
  }
}
