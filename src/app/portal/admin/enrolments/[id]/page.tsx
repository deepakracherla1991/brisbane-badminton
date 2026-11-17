import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/portal/auth";
import { ageOn, sessionLabel } from "@/lib/enrolment/validate";
import { paymentMethods, plans, programs, siblingOptions } from "@/content/enrolment";
import { PAYMENT_LABELS, STATUS_LABELS, statusClass, type Application } from "@/lib/enrolment/types";
import { ActionForm, SubmitButton, inputClass, labelClass } from "@/components/portal/forms";
import { updateApplication } from "../actions";

export const metadata: Metadata = { title: "Enrolment" };

const money = (cents: number | null) => (cents == null ? "To be confirmed" : `$${(cents / 100).toLocaleString("en-AU")}`);

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-2.5 sm:grid-cols-[200px_1fr]">
      <dt className="text-sm text-zinc-500">{label}</dt>
      <dd className="text-sm text-zinc-200">{children || "—"}</dd>
    </div>
  );
}

export default async function EnrolmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const { data: a } = await supabase.from("enrolment_applications").select("*").eq("id", id).maybeSingle<Application>();
  if (!a) notFound();

  // Short-lived links to the private receipt files.
  const files = await Promise.all(
    a.files.map(async (path) => {
      const { data } = await supabase.storage.from("enrolment-uploads").createSignedUrl(path, 60 * 60);
      return { path, name: path.split("/").pop()?.replace(/^\d+-/, "") ?? path, url: data?.signedUrl };
    }),
  );
  const program = programs.find((p) => p.id === a.program)?.name ?? a.program;
  const plan = plans.find((p) => p.id === a.plan)?.name;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/portal/admin/enrolments" className="text-sm text-zinc-400 hover:text-white">
          ← All enrolments
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-bold">{a.player_name}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(a.status)}`}>{STATUS_LABELS[a.status]}</span>
        </div>
        <p className="mt-1 text-zinc-400">
          <span className="font-mono">{a.reference}</span> · {a.term} · received{" "}
          {new Date(a.created_at).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short", timeZone: "Australia/Brisbane" })}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="mb-2 text-xl font-bold">Program</h2>
            <dl className="divide-y divide-line">
              <Row label="Program">{program}</Row>
              <Row label="Plan">{plan ?? (a.program === "trial" ? "Trial lesson" : "")}</Row>
              <Row label="Preferred sessions">
                <ul className="space-y-0.5">
                  {a.sessions.map((s) => (
                    <li key={s}>{sessionLabel(s)}</li>
                  ))}
                </ul>
              </Row>
              {a.program === "advanced" && <Row label="Invited by a coach">{a.invited_by_coach ? "Yes" : "No"}</Row>}
              <Row label="Sibling">{siblingOptions.find((s) => s.value === a.sibling_order)?.label}</Row>
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="mb-2 text-xl font-bold">Player</h2>
            <dl className="divide-y divide-line">
              <Row label="Name">{a.player_name}</Row>
              <Row label="Date of birth">
                {new Date(a.date_of_birth).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })} (age{" "}
                {ageOn(a.date_of_birth)})
              </Row>
              <Row label="Gender">{a.gender}</Row>
              <Row label="Playing level">{a.level}</Row>
              <Row label="Experience">{a.experience}</Row>
              <Row label="Medical / injuries / allergies">
                <span className={a.medical.trim().toLowerCase() === "none" ? "" : "text-amber-200"}>{a.medical}</span>
              </Row>
              <Row label="Heard about us">{a.heard_from}</Row>
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="mb-2 text-xl font-bold">Parent / guardian</h2>
            <dl className="divide-y divide-line">
              <Row label="Name">{a.parent_name}</Row>
              <Row label="Mobile">
                <a href={`tel:${a.mobile.replace(/\s/g, "")}`} className="hover:text-white">
                  {a.mobile}
                </a>
              </Row>
              <Row label="Email">
                <a href={`mailto:${a.email}?subject=${encodeURIComponent(`Enrolment ${a.reference} – ${a.player_name}`)}`} className="text-brand-300 hover:text-white">
                  {a.email}
                </a>
              </Row>
              <Row label="Emergency contact">{a.emergency_contact}</Row>
              <Row label="Suburb">{a.suburb}</Row>
            </dl>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="mb-2 text-xl font-bold">Payment</h2>
            <dl className="divide-y divide-line">
              <Row label="Plan price">{money(a.price_cents)}</Row>
              {a.discount_cents > 0 && <Row label="Family discount">−{money(a.discount_cents)}</Row>}
              <Row label="Total">
                <span className="font-display text-xl font-bold text-white">{money(a.total_cents)}</span>
              </Row>
              <Row label="Method">{paymentMethods.find((m) => m.id === a.payment_method)?.label ?? a.payment_method}</Row>
              {a.playon_voucher && <Row label="PlayOn voucher">{a.playon_voucher}</Row>}
              <Row label="Receipts">
                {files.length ? (
                  <ul className="space-y-1.5">
                    {files.map((f) => (
                      <li key={f.path}>
                        {f.url ? (
                          <a href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand-300 hover:text-white">
                            <FileText className="h-4 w-4" aria-hidden="true" /> {f.name}
                          </a>
                        ) : (
                          <span className="text-zinc-500">{f.name} (unavailable)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "None uploaded"
                )}
              </Row>
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="mb-4 text-xl font-bold">Update</h2>
            <ActionForm action={updateApplication} className="space-y-4">
              <input type="hidden" name="id" value={a.id} />
              <label className={labelClass}>
                Enrolment status
                <select name="status" defaultValue={a.status} className={inputClass}>
                  {Object.entries(STATUS_LABELS).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Payment
                <select name="payment_status" defaultValue={a.payment_status} className={inputClass}>
                  {Object.entries(PAYMENT_LABELS).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Staff notes <span className="text-zinc-500">(not shown to the parent)</span>
                <textarea name="admin_notes" rows={4} maxLength={2000} defaultValue={a.admin_notes ?? ""} placeholder="e.g. Placed in Wednesday group" className={inputClass} />
              </label>
              <label className="flex items-start gap-2 text-sm text-zinc-300">
                <input type="checkbox" name="notify" className="mt-0.5 h-4 w-4 accent-[#d92027]" />
                Email the parent about the new status
              </label>
              <SubmitButton>Save</SubmitButton>
            </ActionForm>
          </section>
        </div>
      </div>
    </div>
  );
}
