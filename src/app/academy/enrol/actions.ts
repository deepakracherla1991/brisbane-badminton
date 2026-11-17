"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/portal/auth";
import { getOrigin } from "@/lib/portal/origin";
import { enrolmentTerm, plans, programs } from "@/content/enrolment";
import { normalise, sessionLabel, validateAll, type EnrolmentInput, type Errors } from "@/lib/enrolment/validate";
import { sendEnrolmentReceived } from "@/lib/email";
import { createCheckout, describeSquareError, isSquareConfigured } from "@/lib/square";

export type SubmitResult =
  | { ok: true; reference: string; totalCents: number | null; checkoutUrl?: string }
  | { ok: false; error: string; errors?: Errors };

// Basic abuse protection: 8 submissions per IP per hour (per server instance).
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 8;
}

function makeReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return `BB-${enrolmentTerm.shortName}-${[...bytes].map((b) => alphabet[b % alphabet.length]).join("")}`;
}

const clip = (s: unknown, n: number) => String(s ?? "").trim().slice(0, n);

export async function submitEnrolment(raw: EnrolmentInput & { website?: string }): Promise<SubmitResult> {
  // Honeypot field: real people never fill it in.
  if (raw.website) return { ok: true, reference: "BB-OK", totalCents: null };
  if (!enrolmentTerm.open) return { ok: false, error: "Enrolments for this term are closed. Please contact us." };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip)) return { ok: false, error: "Too many submissions. Please try again later or contact us." };

  const v: EnrolmentInput = {
    program: raw.program,
    planId: clip(raw.planId, 40),
    sessions: Array.isArray(raw.sessions) ? raw.sessions.map((s) => clip(s, 20)).slice(0, 12) : [],
    invitedByCoach: raw.invitedByCoach === "yes" || raw.invitedByCoach === "no" ? raw.invitedByCoach : "",
    siblingOrder: Number(raw.siblingOrder) || 1,
    player: {
      name: clip(raw.player?.name, 120),
      dob: clip(raw.player?.dob, 10),
      gender: clip(raw.player?.gender, 40),
      level: clip(raw.player?.level, 40),
      experience: clip(raw.player?.experience, 60),
      medical: clip(raw.player?.medical, 1000),
      heardFrom: clip(raw.player?.heardFrom, 60),
    },
    parent: {
      name: clip(raw.parent?.name, 120),
      mobile: clip(raw.parent?.mobile, 30),
      email: clip(raw.parent?.email, 254).toLowerCase(),
      emergency: clip(raw.parent?.emergency, 160),
      suburb: clip(raw.parent?.suburb, 80),
    },
    paymentMethod: raw.paymentMethod,
    voucher: clip(raw.voucher, 60),
    uploadId: clip(raw.uploadId, 40),
    files: Array.isArray(raw.files) ? raw.files.map((f) => clip(f, 300)) : [],
    agree: raw.agree === true,
  };

  const errors = validateAll(v);
  // Uploaded files must belong to this submission's upload folder.
  if (!/^[a-z0-9-]{16,40}$/.test(v.uploadId) || v.files.some((f) => !f.startsWith(`applications/${v.uploadId}/`) || f.includes("..")))
    errors.files = "Please upload your receipt again.";
  if (Object.keys(errors).length) return { ok: false, error: "Please check the highlighted fields.", errors };

  const { planId, sessions, price } = normalise(v);
  if (v.program !== "trial" && !price) return { ok: false, error: "Please choose a training plan." };

  const profile = await getCurrentProfile().catch(() => null);
  const supabase = await createClient();
  const reference = makeReference();
  const origin = await getOrigin();

  // Card: create the Square checkout page first, so the enrolment is saved with its Square order.
  let checkout: { url: string; orderId: string } | null = null;
  if (v.paymentMethod === "card") {
    if (!isSquareConfigured) return { ok: false, error: "Card payments aren't available right now. Please choose another payment method." };
    if (!price?.total) return { ok: false, error: "Card payment isn't available for this option. Please choose another payment method." };
    const planName = plans.find((p) => p.id === planId)?.name ?? "Group training";
    try {
      checkout = await createCheckout({
        reference,
        name: `${enrolmentTerm.name} – ${planName} – ${v.player.name}`,
        amountCents: price.total,
        buyerEmail: v.parent.email,
        redirectUrl: `${origin}/academy/enrol/complete?ref=${reference}`,
        note: `${reference} · ${v.player.name} · ${planName}`,
      });
    } catch (e) {
      console.error("[enrol] Square checkout failed:", describeSquareError(e));
      return { ok: false, error: "We couldn't start the card payment. Please try again, or choose bank transfer." };
    }
  }

  const { error } = await supabase.from("enrolment_applications").insert({
    square_order_id: checkout?.orderId ?? null,
    reference,
    user_id: profile?.id ?? null,
    term: enrolmentTerm.name,
    program: v.program,
    plan: planId,
    sessions,
    invited_by_coach: v.program === "advanced" ? v.invitedByCoach === "yes" : null,
    player_name: v.player.name,
    date_of_birth: v.player.dob,
    gender: v.player.gender || null,
    level: v.player.level,
    experience: v.player.experience,
    medical: v.player.medical,
    heard_from: v.player.heardFrom || null,
    parent_name: v.parent.name,
    mobile: v.parent.mobile,
    email: v.parent.email,
    emergency_contact: v.parent.emergency,
    suburb: v.parent.suburb,
    sibling_order: v.siblingOrder,
    price_cents: price?.base ?? null,
    discount_cents: price?.discount ?? 0,
    total_cents: price?.total ?? null,
    payment_method: v.paymentMethod,
    playon_voucher: v.voucher || null,
    files: v.files,
  });
  if (error) {
    console.error("[enrol] insert failed:", error.message);
    return { ok: false, error: "We couldn't save your enrolment. Please try again, or email us." };
  }

  // Card: emails are sent once Square confirms the payment (see lib/enrolment/payments.ts).
  if (checkout) return { ok: true, reference, totalCents: price?.total ?? null, checkoutUrl: checkout.url };

  await sendEnrolmentReceived({
    reference,
    parentEmail: v.parent.email,
    parentName: v.parent.name,
    playerName: v.player.name,
    program: programs.find((p) => p.id === v.program)?.name ?? v.program,
    plan: plans.find((p) => p.id === planId)?.name ?? (v.program === "trial" ? "Trial lesson" : ""),
    sessions: sessions.map(sessionLabel),
    totalCents: price?.total ?? null,
    discountCents: price?.discount ?? 0,
    paymentMethod: v.paymentMethod,
    origin,
  });

  return { ok: true, reference, totalCents: price?.total ?? null };
}
