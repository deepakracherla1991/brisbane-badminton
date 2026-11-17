import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/portal/auth";
import { ageOn, sessionLabel } from "@/lib/enrolment/validate";
import { enrolmentTerm, paymentMethods, plans, programs } from "@/content/enrolment";
import { PAYMENT_LABELS, STATUS_LABELS, type Application } from "@/lib/enrolment/types";

const STATUS_GROUPS: Record<string, string[] | undefined> = {
  new: ["new"],
  confirmed: ["confirmed"],
  waitlisted: ["waitlisted"],
  closed: ["declined", "cancelled"],
  all: undefined,
};

/** Escapes a CSV cell, and stops spreadsheet apps from treating text as a formula. */
function cell(v: unknown) {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV download of enrolments for staff (opens in Excel / Google Sheets). */
export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admins only" }, { status: 403 });

  const sp = request.nextUrl.searchParams;
  const term = sp.get("term") ?? enrolmentTerm.name;
  const statuses = STATUS_GROUPS[sp.get("status") ?? "all"];

  const supabase = await createClient();
  let query = supabase.from("enrolment_applications").select("*").order("created_at");
  if (term !== "all") query = query.eq("term", term);
  if (statuses) query = query.in("status", statuses);
  const { data, error } = await query.returns<Application[]>();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const header = [
    "Reference", "Received", "Term", "Status", "Payment status", "Program", "Plan", "Sessions", "Invited by coach",
    "Player", "Date of birth", "Age", "Gender", "Level", "Experience", "Medical", "Heard from",
    "Parent / guardian", "Mobile", "Email", "Emergency contact", "Suburb", "Sibling",
    "Price", "Discount", "Total", "Payment method", "PlayOn voucher", "Receipt files", "Staff notes",
  ];
  const rows = (data ?? []).map((a) => [
    a.reference,
    new Date(a.created_at).toLocaleString("en-AU", { timeZone: "Australia/Brisbane" }),
    a.term,
    STATUS_LABELS[a.status],
    PAYMENT_LABELS[a.payment_status],
    programs.find((p) => p.id === a.program)?.name ?? a.program,
    plans.find((p) => p.id === a.plan)?.name ?? "",
    a.sessions.map(sessionLabel).join("; "),
    a.invited_by_coach == null ? "" : a.invited_by_coach ? "Yes" : "No",
    a.player_name,
    a.date_of_birth,
    ageOn(a.date_of_birth),
    a.gender,
    a.level,
    a.experience,
    a.medical,
    a.heard_from,
    a.parent_name,
    a.mobile,
    a.email,
    a.emergency_contact,
    a.suburb,
    a.sibling_order,
    a.price_cents == null ? "" : (a.price_cents / 100).toFixed(2),
    (a.discount_cents / 100).toFixed(2),
    a.total_cents == null ? "" : (a.total_cents / 100).toFixed(2),
    paymentMethods.find((m) => m.id === a.payment_method)?.label ?? a.payment_method,
    a.playon_voucher,
    a.files.length,
    a.admin_notes,
  ]);
  const csv = "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  const name = `enrolments-${term === "all" ? "all-terms" : term.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
