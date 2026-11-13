"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/portal/auth";
import { getOrigin } from "@/lib/portal/origin";
import { sendPromotedEmails } from "@/lib/email";
import type { FormState, PaymentStatus, Promotion } from "@/lib/portal/types";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const optInt = (fd: FormData, key: string) => {
  const v = str(fd, key);
  return v === "" ? null : Number.parseInt(v, 10);
};
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const isTime = (v: string) => /^\d{2}:\d{2}(:\d{2})?$/.test(v);

function refresh() {
  revalidatePath("/portal", "layout");
}

async function notifyPromoted(data: unknown) {
  const promoted = (data ?? []) as Promotion[];
  if (promoted.length) await sendPromotedEmails(promoted, await getOrigin());
  return promoted.length;
}

export async function createTerm(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const name = str(fd, "name");
  const starts = str(fd, "starts_on");
  const ends = str(fd, "ends_on");
  const active = fd.get("is_active") === "on";
  if (!name) return { error: "Enter a term name." };
  if (!isDate(starts) || !isDate(ends) || ends < starts) return { error: "Enter valid start and end dates." };

  const supabase = await createClient();
  if (active) await supabase.from("terms").update({ is_active: false }).eq("is_active", true);
  const { error } = await supabase.from("terms").insert({ name, starts_on: starts, ends_on: ends, is_active: active });
  if (error) return { error: error.message };
  refresh();
  return { success: `${name} created.` };
}

export async function setActiveTerm(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id");
  const supabase = await createClient();
  await supabase.from("terms").update({ is_active: false }).neq("id", id);
  const { error } = await supabase.from("terms").update({ is_active: true }).eq("id", id);
  if (error) return { error: error.message };
  refresh();
  return { success: "Term is now open for enrolments." };
}

function classFields(fd: FormData) {
  const dollars = Number.parseFloat(str(fd, "price"));
  return {
    term_id: str(fd, "term_id"),
    program: str(fd, "program"),
    name: str(fd, "name").slice(0, 120),
    level: str(fd, "level").slice(0, 60) || null,
    description: str(fd, "description").slice(0, 1000) || null,
    day_of_week: Number.parseInt(str(fd, "day_of_week"), 10),
    start_time: str(fd, "start_time"),
    end_time: str(fd, "end_time"),
    coach: str(fd, "coach").slice(0, 80) || null,
    capacity: Number.parseInt(str(fd, "capacity"), 10),
    price_cents: Number.isFinite(dollars) ? Math.round(dollars * 100) : NaN,
    sessions: Number.parseInt(str(fd, "sessions"), 10),
    min_age: optInt(fd, "min_age"),
    max_age: optInt(fd, "max_age"),
    is_published: fd.get("is_published") === "on",
  };
}

function validateClass(c: ReturnType<typeof classFields>) {
  if (!c.term_id) return "Choose a term.";
  if (!c.name) return "Enter a class name.";
  if (!(c.day_of_week >= 0 && c.day_of_week <= 6)) return "Choose a day.";
  if (!isTime(c.start_time) || !isTime(c.end_time) || c.end_time <= c.start_time) return "Enter a valid start and end time.";
  if (!(c.capacity > 0)) return "Capacity must be at least 1.";
  if (!(c.price_cents >= 0)) return "Enter a valid price.";
  if (!(c.sessions > 0)) return "Sessions must be at least 1.";
  if ((c.min_age != null && c.min_age < 0) || (c.max_age != null && c.max_age < 0)) return "Ages can't be negative.";
  return null;
}

export async function saveClass(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id");
  const fields = classFields(fd);
  const invalid = validateClass(fields);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  if (!id) {
    const { data, error } = await supabase.from("classes").insert(fields).select("id").single<{ id: string }>();
    if (error || !data) return { error: error?.message ?? "Couldn't create the class." };
    refresh();
    redirect(`/portal/admin/classes/${data.id}?created=1`);
  }

  const { error } = await supabase.from("classes").update(fields).eq("id", id);
  if (error) return { error: error.message };
  // If capacity went up, move people off the waitlist.
  const { data: promoted } = await supabase.rpc("promote_waitlist", { p_class_id: id });
  const n = await notifyPromoted(promoted);
  refresh();
  return { success: n ? `Saved. ${n} waitlisted student${n > 1 ? "s were" : " was"} enrolled and emailed.` : "Saved." };
}

export async function deleteClass(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id");
  const supabase = await createClient();
  const { count } = await supabase
    .from("enrolments")
    .select("id", { count: "exact", head: true })
    .eq("class_id", id)
    .neq("status", "withdrawn");
  if (count) return { error: "This class has enrolled or waitlisted students. Withdraw them first, or untick 'Published' to hide it." };
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) return { error: error.message };
  refresh();
  redirect("/portal/admin");
}

export async function setPaymentStatus(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const status = str(fd, "payment_status") as PaymentStatus;
  if (!["unpaid", "paid", "waived"].includes(status)) return { error: "Invalid payment status." };
  const supabase = await createClient();
  const { error } = await supabase.from("enrolments").update({ payment_status: status }).eq("id", str(fd, "enrolment_id"));
  if (error) return { error: error.message };
  refresh();
  return { success: "Updated." };
}

export async function adminWithdraw(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("withdraw_enrolment", { p_enrolment_id: str(fd, "enrolment_id") });
  if (error) return { error: error.message };
  const n = await notifyPromoted(data);
  refresh();
  return { success: n ? "Withdrawn. The next student on the waitlist was enrolled and emailed." : "Withdrawn." };
}
