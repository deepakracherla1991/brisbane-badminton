"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/portal/auth";
import { sendEnrolmentStatus } from "@/lib/email";
import { sessionLabel } from "@/lib/enrolment/validate";
import { PAYMENT_LABELS, STATUS_LABELS, type Application } from "@/lib/enrolment/types";
import type { FormState } from "@/lib/portal/types";

export async function updateApplication(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const status = String(fd.get("status") ?? "") as Application["status"];
  const payment = String(fd.get("payment_status") ?? "");
  const notes = String(fd.get("admin_notes") ?? "").trim().slice(0, 2000);
  if (!(status in STATUS_LABELS) || !(payment in PAYMENT_LABELS)) return { error: "Invalid status." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrolment_applications")
    .update({ status, payment_status: payment, admin_notes: notes || null })
    .eq("id", id)
    .select("*")
    .single<Application>();
  if (error || !data) return { error: error?.message ?? "Couldn't save." };

  let emailed = false;
  if (fd.get("notify") === "on" && status !== "new") {
    await sendEnrolmentStatus({
      to: data.email,
      parentName: data.parent_name,
      playerName: data.player_name,
      reference: data.reference,
      status,
      sessions: data.sessions.map(sessionLabel),
    });
    emailed = true;
  }
  revalidatePath("/portal/admin/enrolments", "layout");
  return { success: emailed ? "Saved and emailed the parent." : "Saved." };
}
