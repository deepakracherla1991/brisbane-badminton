"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/auth";
import { getOrigin } from "@/lib/portal/origin";
import { classTime, formatPrice } from "@/lib/portal/format";
import { sendEnrolmentEmail, sendPromotedEmails } from "@/lib/email";
import type { AcademyClass, Enrolment, FormState, Promotion, Term } from "@/lib/portal/types";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

function refresh() {
  revalidatePath("/portal", "layout");
}

export async function updateProfile(_: FormState, fd: FormData): Promise<FormState> {
  const profile = await requireUser("/portal/account");
  const fullName = str(fd, "full_name").slice(0, 120);
  if (!fullName) return { error: "Please enter your name." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: str(fd, "phone").slice(0, 30) || null })
    .eq("id", profile.id);
  if (error) return { error: "Couldn't save your details. Please try again." };
  refresh();
  return { success: "Your details have been saved." };
}

function studentFields(fd: FormData) {
  const dob = str(fd, "date_of_birth");
  return {
    full_name: str(fd, "full_name").slice(0, 120),
    date_of_birth: /^\d{4}-\d{2}-\d{2}$/.test(dob) ? dob : null,
    notes: str(fd, "notes").slice(0, 1000) || null,
  };
}

export async function addStudent(_: FormState, fd: FormData): Promise<FormState> {
  const profile = await requireUser("/portal/students");
  const fields = studentFields(fd);
  if (!fields.full_name) return { error: "Please enter the student's name." };
  const supabase = await createClient();
  const { error } = await supabase.from("students").insert({ ...fields, owner_id: profile.id });
  if (error) return { error: "Couldn't add the student. Please try again." };
  refresh();
  return { success: `${fields.full_name} has been added.` };
}

export async function updateStudent(_: FormState, fd: FormData): Promise<FormState> {
  await requireUser("/portal/students");
  const fields = studentFields(fd);
  if (!fields.full_name) return { error: "Please enter the student's name." };
  const supabase = await createClient();
  const { error } = await supabase.from("students").update(fields).eq("id", str(fd, "id"));
  if (error) return { error: "Couldn't save the changes. Please try again." };
  refresh();
  return { success: "Saved." };
}

export async function deleteStudent(_: FormState, fd: FormData): Promise<FormState> {
  await requireUser("/portal/students");
  const id = str(fd, "id");
  const supabase = await createClient();
  const { count } = await supabase
    .from("enrolments")
    .select("id", { count: "exact", head: true })
    .eq("student_id", id)
    .neq("status", "withdrawn");
  if (count) return { error: "This student is still enrolled or waitlisted. Withdraw them from their classes first." };
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) return { error: "Couldn't remove the student. Please try again." };
  refresh();
  return { success: "Student removed." };
}

export async function enrol(_: FormState, fd: FormData): Promise<FormState> {
  const profile = await requireUser("/portal/classes");
  const classId = str(fd, "class_id");
  const studentId = str(fd, "student_id");
  if (!studentId) return { error: "Choose who you're enrolling." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("enrol_student", { p_class_id: classId, p_student_id: studentId }).single<Enrolment>();
  if (error || !data) return { error: error?.message ?? "Couldn't enrol. Please try again." };

  const [{ data: cls }, { data: student }] = await Promise.all([
    supabase.from("classes").select("*, terms(name)").eq("id", classId).single<AcademyClass & { terms: Pick<Term, "name"> }>(),
    supabase.from("students").select("full_name").eq("id", studentId).single<{ full_name: string }>(),
  ]);
  if (cls && student) {
    await sendEnrolmentEmail(profile.email, {
      status: data.status === "enrolled" ? "enrolled" : "waitlisted",
      studentName: student.full_name,
      className: [cls.name, cls.level].filter(Boolean).join(" – "),
      when: classTime(cls),
      termName: cls.terms.name,
      price: formatPrice(cls.price_cents),
      origin: await getOrigin(),
    });
  }
  refresh();
  const who = student?.full_name ?? "Your student";
  return data.status === "enrolled"
    ? { success: `${who} is enrolled! We've emailed you a confirmation.` }
    : { success: `This class is full, so ${who} is on the waitlist. We'll email you if a place opens up.` };
}

export async function withdraw(_: FormState, fd: FormData): Promise<FormState> {
  await requireUser("/portal");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("withdraw_enrolment", { p_enrolment_id: str(fd, "enrolment_id") });
  if (error) return { error: error.message };
  const promoted = (data ?? []) as Promotion[];
  if (promoted.length) await sendPromotedEmails(promoted, await getOrigin());
  refresh();
  return { success: "Withdrawn." };
}
