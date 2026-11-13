import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/portal/AuthCard";
import { AuthOptions } from "@/components/portal/AuthOptions";
import { isGoogleAuthEnabled } from "@/lib/supabase/config";
import { ActionForm, SubmitButton, inputClass, labelClass } from "@/components/portal/forms";
import { getCurrentProfile } from "@/lib/portal/auth";
import { safeNext } from "@/lib/portal/format";
import { signIn } from "../auth-actions";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const nextPath = safeNext(next);
  if (await getCurrentProfile()) redirect(nextPath);

  return (
    <AuthCard
      title="Sign in"
      intro="Manage your academy enrolments, students and payments."
      footer={
        <>
          New here?{" "}
          <Link href={`/portal/register${next ? `?next=${encodeURIComponent(nextPath)}` : ""}`} className="text-brand-300 hover:text-white">
            Create an account
          </Link>
        </>
      }
    >
      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-red-200">
          {error === "link"
            ? "That link has expired or was already used. Please try again."
            : error === "oauth"
              ? "Google sign-in didn't complete. Please try again, or continue with email."
              : "Something went wrong. Please try again."}
        </p>
      )}
      <AuthOptions googleEnabled={isGoogleAuthEnabled} next={nextPath}>
      <ActionForm action={signIn} className="space-y-4">
        <input type="hidden" name="next" value={nextPath} />
        <label className={labelClass}>
          Email
          <input name="email" type="email" required autoComplete="email" className={inputClass} />
        </label>
        <label className={labelClass}>
          Password
          <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
        </label>
        <div className="flex items-center justify-between gap-3 pt-1">
          <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
          <Link href="/portal/forgot-password" className="text-sm text-zinc-400 hover:text-white">
            Forgot password?
          </Link>
        </div>
      </ActionForm>
      </AuthOptions>
    </AuthCard>
  );
}
