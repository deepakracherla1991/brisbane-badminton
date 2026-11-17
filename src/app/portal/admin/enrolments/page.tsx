import type { Metadata } from "next";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/portal/auth";
import { ageOn } from "@/lib/enrolment/validate";
import { enrolmentTerm, paymentMethods, plans, programs } from "@/content/enrolment";
import { PAYMENT_LABELS, STATUS_LABELS, statusClass, type Application, type ApplicationStatus } from "@/lib/enrolment/types";

export const metadata: Metadata = { title: "Enrolments" };

const money = (cents: number | null) => (cents == null ? "TBC" : `$${(cents / 100).toLocaleString("en-AU")}`);
const FILTERS: { key: string; label: string; statuses?: ApplicationStatus[] }[] = [
  { key: "new", label: "New", statuses: ["new"] },
  { key: "confirmed", label: "Confirmed", statuses: ["confirmed"] },
  { key: "waitlisted", label: "Waitlisted", statuses: ["waitlisted"] },
  { key: "closed", label: "Declined / cancelled", statuses: ["declined", "cancelled"] },
  { key: "all", label: "All" },
];

export default async function EnrolmentsAdminPage({ searchParams }: { searchParams: Promise<{ status?: string; term?: string; q?: string }> }) {
  await requireAdmin();
  const { status = "new", term = enrolmentTerm.name, q = "" } = await searchParams;
  const filter = FILTERS.find((f) => f.key === status) ?? FILTERS[0];
  const supabase = await createClient();

  let query = supabase.from("enrolment_applications").select("*").order("created_at", { ascending: false }).limit(500);
  if (term !== "all") query = query.eq("term", term);
  if (filter.statuses) query = query.in("status", filter.statuses);
  const search = q.trim().replace(/[%,()]/g, " ").slice(0, 60);
  if (search) query = query.or(`player_name.ilike.%${search}%,parent_name.ilike.%${search}%,email.ilike.%${search}%,reference.ilike.%${search}%`);
  const { data, error } = await query.returns<Application[]>();
  const rows = data ?? [];

  const { data: terms } = await supabase.from("enrolment_applications").select("term").returns<{ term: string }[]>();
  const termOptions = [...new Set([enrolmentTerm.name, ...(terms ?? []).map((t) => t.term)])];
  const qs = (over: Record<string, string>) => new URLSearchParams({ status, term, ...(q ? { q } : {}), ...over }).toString();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/portal/admin" className="text-sm text-zinc-400 hover:text-white">
            ← Admin
          </Link>
          <h1 className="mt-2 text-4xl font-bold">Enrolments</h1>
          <p className="mt-1 text-zinc-400">Submissions from the online enrolment form.</p>
        </div>
        <a
          href={`/portal/admin/enrolments/export?${qs({})}`}
          className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 font-display text-sm uppercase tracking-wider text-white hover:bg-white/5"
        >
          <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
        </a>
      </div>

      <div className="card flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={`?${qs({ status: f.key })}`}
              aria-current={f.key === filter.key ? "page" : undefined}
              className={`rounded-full border px-4 py-1.5 text-sm ${f.key === filter.key ? "border-brand bg-brand text-white" : "border-line text-zinc-300 hover:text-white"}`}
            >
              {f.label}
            </Link>
          ))}
        </nav>
        <form className="flex flex-wrap gap-2" action="">
          <input type="hidden" name="status" value={filter.key} />
          <select name="term" defaultValue={term} className="rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white">
            {termOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            <option value="all">All terms</option>
          </select>
          <label className="relative">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-zinc-500" aria-hidden="true" />
            <input name="q" defaultValue={q} placeholder="Name, email or reference" className="w-56 rounded-lg border border-line bg-ink py-2 pr-3 pl-9 text-sm text-white placeholder:text-zinc-500" />
          </label>
          <button className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">Apply</button>
        </form>
      </div>

      {error && <p className="text-red-300">Couldn&apos;t load enrolments: {error.message}</p>}

      <section className="card overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Received</th>
              <th className="px-4 py-3 font-medium">Player</th>
              <th className="px-4 py-3 font-medium">Program / plan</th>
              <th className="px-4 py-3 font-medium">Parent</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length ? (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3 text-zinc-400">
                    <Link href={`/portal/admin/enrolments/${r.id}`} className="font-mono text-xs text-brand-300 hover:text-white">
                      {r.reference}
                    </Link>
                    <span className="block text-xs">{new Date(r.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "Australia/Brisbane" })}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/portal/admin/enrolments/${r.id}`} className="font-medium text-white hover:text-brand-300">
                      {r.player_name}
                    </Link>
                    <span className="block text-xs text-zinc-500">
                      Age {ageOn(r.date_of_birth)} · {r.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {programs.find((p) => p.id === r.program)?.name.replace(" (Invite Only)", "")}
                    <span className="block text-xs text-zinc-500">
                      {plans.find((p) => p.id === r.plan)?.name ?? "—"} · {r.sessions.length} session{r.sessions.length === 1 ? "" : "s"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {r.parent_name}
                    <span className="block text-xs text-zinc-500">{r.mobile}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-white tabular-nums">
                    {money(r.total_cents)}
                    {r.discount_cents > 0 && <span className="block text-xs text-emerald-300">−{money(r.discount_cents)}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${r.payment_status === "verified" ? "text-emerald-300" : r.payment_status === "pending" ? "text-brand-300" : "text-zinc-400"}`}>
                      {PAYMENT_LABELS[r.payment_status]}
                    </span>
                    <span className="block text-xs text-zinc-500">{paymentMethods.find((m) => m.id === r.payment_method)?.label ?? r.payment_method}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(r.status)}`}>{STATUS_LABELS[r.status]}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">
                  No enrolments here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
