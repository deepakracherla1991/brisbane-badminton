import type { EnrolmentStatus, PaymentStatus } from "@/lib/portal/types";

const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";

export function StatusBadge({ status }: { status: EnrolmentStatus }) {
  const style = {
    enrolled: "bg-emerald-500/15 text-emerald-300",
    waitlisted: "bg-amber-500/15 text-amber-300",
    withdrawn: "bg-white/10 text-zinc-400",
  }[status];
  const label = { enrolled: "Enrolled", waitlisted: "Waitlisted", withdrawn: "Withdrawn" }[status];
  return <span className={`${base} ${style}`}>{label}</span>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const style = {
    paid: "bg-emerald-500/15 text-emerald-300",
    unpaid: "bg-brand/15 text-brand-300",
    waived: "bg-sky-500/15 text-sky-300",
  }[status];
  const label = { paid: "Paid", unpaid: "Awaiting payment", waived: "No charge" }[status];
  return <span className={`${base} ${style}`}>{label}</span>;
}
