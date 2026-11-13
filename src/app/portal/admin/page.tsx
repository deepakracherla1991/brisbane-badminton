import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/portal/auth";
import { classTime, formatPrice, termDates } from "@/lib/portal/format";
import { ActionForm, SubmitButton, inputClass, labelClass } from "@/components/portal/forms";
import { createTerm, setActiveTerm } from "./actions";
import type { AcademyClass, Enrolment, Term } from "@/lib/portal/types";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ term?: string }> }) {
  await requireAdmin();
  const { term: termParam } = await searchParams;
  const supabase = await createClient();
  const { data: terms } = await supabase.from("terms").select("*").order("starts_on", { ascending: false }).returns<Term[]>();
  const term = terms?.find((t) => t.id === termParam) ?? terms?.find((t) => t.is_active) ?? terms?.[0];

  const { data: classes } = term
    ? await supabase.from("classes").select("*").eq("term_id", term.id).order("day_of_week").order("start_time").returns<AcademyClass[]>()
    : { data: [] as AcademyClass[] };
  const classIds = (classes ?? []).map((c) => c.id);
  const { data: enrolments } = classIds.length
    ? await supabase.from("enrolments").select("class_id, status, payment_status").in("class_id", classIds).neq("status", "withdrawn").returns<Pick<Enrolment, "class_id" | "status" | "payment_status">[]>()
    : { data: [] as Pick<Enrolment, "class_id" | "status" | "payment_status">[] };

  const stats = (id: string) => {
    const rows = (enrolments ?? []).filter((e) => e.class_id === id);
    const enrolled = rows.filter((e) => e.status === "enrolled");
    return {
      enrolled: enrolled.length,
      waitlisted: rows.length - enrolled.length,
      unpaid: enrolled.filter((e) => e.payment_status === "unpaid").length,
    };
  };
  const totals = (classes ?? []).reduce(
    (acc, c) => {
      const s = stats(c.id);
      return { enrolled: acc.enrolled + s.enrolled, waitlisted: acc.waitlisted + s.waitlisted, unpaid: acc.unpaid + s.unpaid, capacity: acc.capacity + c.capacity };
    },
    { enrolled: 0, waitlisted: 0, unpaid: 0, capacity: 0 },
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Admin</p>
          <h1 className="text-4xl font-bold">Academy classes</h1>
        </div>
        {term && (
          <Link
            href={`/portal/admin/classes/new?term=${term.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wider text-white hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> New class
          </Link>
        )}
      </div>

      {/* Terms */}
      <section className="card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {terms?.length ? (
              terms.map((t) => (
                <Link
                  key={t.id}
                  href={`/portal/admin?term=${t.id}`}
                  aria-current={t.id === term?.id ? "page" : undefined}
                  className={`rounded-full border px-4 py-1.5 text-sm ${t.id === term?.id ? "border-brand bg-brand/15 text-white" : "border-line text-zinc-300 hover:text-white"}`}
                >
                  {t.name}
                  {t.is_active && <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-300">Open</span>}
                </Link>
              ))
            ) : (
              <p className="text-zinc-400">No terms yet. Create the first one to start adding classes.</p>
            )}
          </div>
          <details className="w-full lg:w-auto">
            <summary className="cursor-pointer text-sm text-brand-300 hover:text-white">+ New term</summary>
            <ActionForm action={createTerm} resetOnSuccess className="mt-4 grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end">
              <label className={labelClass}>
                Name
                <input name="name" required placeholder="Term 2 2027" className={inputClass} />
              </label>
              <label className={labelClass}>
                Starts
                <input name="starts_on" type="date" required className={inputClass} />
              </label>
              <label className={labelClass}>
                Ends
                <input name="ends_on" type="date" required className={inputClass} />
              </label>
              <SubmitButton>Create</SubmitButton>
              <label className="flex items-center gap-2 text-sm text-zinc-300 sm:col-span-4">
                <input type="checkbox" name="is_active" className="h-4 w-4 accent-[#d92027]" /> Open this term for enrolments now
              </label>
            </ActionForm>
          </details>
        </div>
        {term && (
          <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {term.name}: {termDates(term)} · {totals.enrolled}/{totals.capacity} places filled · {totals.waitlisted} waitlisted ·{" "}
              <span className={totals.unpaid ? "text-brand-300" : ""}>{totals.unpaid} unpaid</span>
            </span>
            {!term.is_active && (
              <ActionForm action={setActiveTerm}>
                <input type="hidden" name="id" value={term.id} />
                <SubmitButton variant="ghost" className="!py-1.5 !text-xs">
                  Open for enrolments
                </SubmitButton>
              </ActionForm>
            )}
          </div>
        )}
      </section>

      {/* Classes */}
      {term && (
        <section className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-5 py-3 font-medium">Class</th>
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Coach</th>
                <th className="px-5 py-3 text-right font-medium">Fee</th>
                <th className="px-5 py-3 text-right font-medium">Enrolled</th>
                <th className="px-5 py-3 text-right font-medium">Waitlist</th>
                <th className="px-5 py-3 text-right font-medium">Unpaid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {classes?.length ? (
                classes.map((c) => {
                  const s = stats(c.id);
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.03]">
                      <td className="px-5 py-3">
                        <Link href={`/portal/admin/classes/${c.id}`} className="font-medium text-white hover:text-brand-300">
                          {c.name}
                          {c.level && <span className="text-zinc-400"> · {c.level}</span>}
                        </Link>
                        {!c.is_published && <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-zinc-400">Hidden</span>}
                      </td>
                      <td className="px-5 py-3 text-zinc-300">{classTime(c)}</td>
                      <td className="px-5 py-3 text-zinc-300">{c.coach ?? "—"}</td>
                      <td className="px-5 py-3 text-right text-zinc-300">{formatPrice(c.price_cents)}</td>
                      <td className={`px-5 py-3 text-right tabular-nums ${s.enrolled >= c.capacity ? "font-semibold text-amber-300" : "text-white"}`}>
                        {s.enrolled}/{c.capacity}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-zinc-300">{s.waitlisted || "—"}</td>
                      <td className={`px-5 py-3 text-right tabular-nums ${s.unpaid ? "text-brand-300" : "text-zinc-500"}`}>{s.unpaid || "—"}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-zinc-400">
                    No classes in {term.name} yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
