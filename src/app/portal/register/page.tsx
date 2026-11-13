import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/portal/AuthCard";
import { ActionForm, SubmitButton, inputClass, labelClass } from "@/components/portal/forms";
import { getCurrentProfile } from "@/lib/portal/auth";
import { signUp } from "../auth-actions";

export const metadata: Metadata = { title: "Create an account" };

export default async function RegisterPage() {
  if (await getCurrentProfile()) redirect("/portal");
  return (
    <AuthCard
      title="Create an account"
      intro="One account for the whole family. You can add your children as students after signing up."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/portal/login" className="text-brand-300 hover:text-white">
            Sign in
          </Link>
        </>
      }
    >
      <ActionForm action={signUp} className="space-y-4" resetOnSuccess>
        <label className={labelClass}>
          Your full name
          <input name="full_name" required maxLength={120} autoComplete="name" className={inputClass} />
        </label>
        <label className={labelClass}>
          Email
          <input name="email" type="email" required autoComplete="email" className={inputClass} />
        </label>
        <label className={labelClass}>
          Mobile
          <input name="phone" type="tel" required maxLength={30} autoComplete="tel" placeholder="04xx xxx xxx" className={inputClass} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Password
            <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
          </label>
          <label className={labelClass}>
            Confirm password
            <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
          </label>
        </div>
        <p className="text-xs text-zinc-500">At least 8 characters.</p>
        <SubmitButton pendingText="Creating account…" className="w-full">
          Create account
        </SubmitButton>
      </ActionForm>
    </AuthCard>
  );
}
