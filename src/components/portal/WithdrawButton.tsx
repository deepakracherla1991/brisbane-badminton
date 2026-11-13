"use client";

import { withdraw } from "@/app/portal/actions";
import { ActionForm, SubmitButton } from "./forms";

export function WithdrawButton({ enrolmentId, label, waitlisted }: { enrolmentId: string; label: string; waitlisted: boolean }) {
  return (
    <ActionForm
      action={withdraw}
      confirm={waitlisted ? `Leave the waitlist for ${label}?` : `Withdraw from ${label}? Your place will be offered to the next person on the waitlist.`}
    >
      <input type="hidden" name="enrolment_id" value={enrolmentId} />
      <SubmitButton variant="danger" pendingText="Withdrawing…" className="!px-3.5 !py-1.5 !text-xs">
        {waitlisted ? "Leave waitlist" : "Withdraw"}
      </SubmitButton>
    </ActionForm>
  );
}
