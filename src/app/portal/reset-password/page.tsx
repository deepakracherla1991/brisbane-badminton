import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/portal/AuthCard";
import { ActionForm, SubmitButton, inputClass, labelClass } from "@/components/portal/forms";
import { getCurrentProfile } from "@/lib/portal/auth";
import { updatePassword } from "../auth-actions";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return (
      <AuthCard title="Link expired" intro="This password reset link has expired or was already used.">
        <Link href="/portal/forgot-password" className="text-brand-300 hover:text-white">
          Request a new link →
        </Link>
      </AuthCard>
    );
  }
  return (
    <AuthCard
      title="Choose a new password"
      footer={
        <Link href="/portal" className="text-brand-300 hover:text-white">
          Go to my classes →
        </Link>
      }
    >
      <ActionForm action={updatePassword} className="space-y-4" resetOnSuccess>
        <label className={labelClass}>
          New password
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
        </label>
        <label className={labelClass}>
          Confirm new password
          <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
        </label>
        <SubmitButton className="w-full">Update password</SubmitButton>
      </ActionForm>
    </AuthCard>
  );
}
