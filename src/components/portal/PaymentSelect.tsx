"use client";

import { startTransition, useActionState, useState } from "react";
import { setPaymentStatus } from "@/app/portal/admin/actions";
import type { PaymentStatus } from "@/lib/portal/types";

/** Saves as soon as staff change the payment status. */
export function PaymentSelect({ enrolmentId, value }: { enrolmentId: string; value: PaymentStatus }) {
  const [state, action, pending] = useActionState(setPaymentStatus, null);
  const [current, setCurrent] = useState(value);
  const color = current === "paid" ? "border-emerald-500/50 text-emerald-300" : current === "waived" ? "border-sky-500/50 text-sky-300" : "border-brand/50 text-brand-300";
  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor={`pay-${enrolmentId}`}>
        Payment status
      </label>
      <select
        id={`pay-${enrolmentId}`}
        value={current}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as PaymentStatus;
          setCurrent(next);
          const fd = new FormData();
          fd.set("enrolment_id", enrolmentId);
          fd.set("payment_status", next);
          startTransition(() => action(fd));
        }}
        className={`rounded-lg border bg-ink px-2.5 py-1.5 text-sm focus:outline-none disabled:opacity-60 ${color}`}
      >
        <option value="unpaid">Unpaid</option>
        <option value="paid">Paid</option>
        <option value="waived">No charge</option>
      </select>
      {state?.error && <span className="text-xs text-red-300">{state.error}</span>}
    </div>
  );
}
