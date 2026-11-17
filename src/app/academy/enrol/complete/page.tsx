import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { confirmCardPayment } from "@/lib/enrolment/payments";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { getOrigin } from "@/lib/portal/origin";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Enrolment payment", robots: { index: false } };

const money = (cents: number | null | undefined) => (cents == null ? "" : `$${(cents / 100).toLocaleString("en-AU", { minimumFractionDigits: cents % 100 ? 2 : 0 })}`);

/** Square sends parents back here after card payment. */
export default async function EnrolCompletePage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref = "" } = await searchParams;
  const reference = /^BB-[A-Z0-9]{2,6}-[A-Z0-9]{5}$/.test(ref) ? ref : "";
  const result = reference && isAdminClientConfigured ? await confirmCardPayment({ reference }, await getOrigin()) : { state: "not-found" as const };
  const app = "app" in result ? result.app : undefined;
  const paid = result.state === "paid";

  return (
    <section className="container-x py-16 sm:py-24">
      <div className="card mx-auto max-w-xl p-6 text-center sm:p-10">
        {paid ? (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" aria-hidden="true" />
            <h1 className="mt-4 text-3xl font-bold">Payment received, you&apos;re enrolled!</h1>
            <p className="mt-2 text-zinc-300">
              Thanks{app ? `, ${app.parent_name.split(" ")[0]}` : ""}! We&apos;ve received {money(app?.total_cents)} for {app?.player_name}. A confirmation is on its
              way to {app?.email}. Our team will confirm the final session placement.
            </p>
          </>
        ) : result.state === "unpaid" || result.state === "error" ? (
          <>
            <Clock className="mx-auto h-14 w-14 text-amber-300" aria-hidden="true" />
            <h1 className="mt-4 text-3xl font-bold">We&apos;re confirming your payment</h1>
            <p className="mt-2 text-zinc-300">
              Your enrolment is saved, but we haven&apos;t received confirmation of the card payment yet. If you completed payment, it will show up shortly and you&apos;ll
              get an email. If you closed the payment page early, please contact us and quote your reference.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold">Enrolment not found</h1>
            <p className="mt-2 text-zinc-300">We couldn&apos;t find that enrolment. If you were charged, please contact us and we&apos;ll sort it out.</p>
          </>
        )}

        {reference && (
          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-line bg-ink p-5">
            <p className="text-xs uppercase tracking-widest text-zinc-500">Your reference</p>
            <p className="mt-1 font-display text-3xl font-bold tracking-wider text-white">{reference}</p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/academy/enrol" className="rounded-full bg-brand px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-white hover:bg-brand-600">
            Enrol another child
          </Link>
          <Link href="/academy" className="rounded-full border border-white/25 px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-white hover:bg-white/5">
            Back to academy
          </Link>
        </div>
        <p className="mt-6 text-sm text-zinc-500">
          Questions? {site.contact.email} · {site.contact.phones[0].display}
        </p>
      </div>
    </section>
  );
}
