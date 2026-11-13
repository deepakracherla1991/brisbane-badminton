import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/portal/AuthCard";
import { ActionForm, SubmitButton, inputClass, labelClass } from "@/components/portal/forms";
import { requestPasswordReset } from "../auth-actions";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      intro="Enter your email and we'll send you a link to choose a new password."
      footer={
        <Link href="/portal/login" className="text-brand-300 hover:text-white">
          Back to sign in
        </Link>
      }
    >
      <ActionForm action={requestPasswordReset} className="space-y-4">
        <label className={labelClass}>
          Email
          <input name="email" type="email" required autoComplete="email" className={inputClass} />
        </label>
        <SubmitButton pendingText="Sending…" className="w-full">
          Send reset link
        </SubmitButton>
      </ActionForm>
    </AuthCard>
  );
}
