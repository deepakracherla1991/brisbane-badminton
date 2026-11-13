"use client";

import { adminWithdraw } from "@/app/portal/admin/actions";
import { ActionForm, SubmitButton } from "./forms";

export function AdminWithdrawButton({ enrolmentId, name }: { enrolmentId: string; name: string }) {
  return (
    <ActionForm action={adminWithdraw} confirm={`Withdraw ${name}? If they were enrolled, the next waitlisted student gets their place.`}>
      <input type="hidden" name="enrolment_id" value={enrolmentId} />
      <SubmitButton variant="danger" pendingText="…" className="!px-3 !py-1 !text-xs">
        Withdraw
      </SubmitButton>
    </ActionForm>
  );
}
