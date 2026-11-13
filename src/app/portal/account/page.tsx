import type { Metadata } from "next";
import { requireUser } from "@/lib/portal/auth";
import { ActionForm, SubmitButton, inputClass, labelClass } from "@/components/portal/forms";
import { updateProfile } from "../actions";
import { updatePassword } from "../auth-actions";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const profile = await requireUser("/portal/account");
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="eyebrow mb-2">Account</p>
        <h1 className="text-4xl font-bold">Your details</h1>
      </div>

      <section className="card p-6">
        <h2 className="text-xl font-bold">Contact details</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Signed in as <span className="text-white">{profile.email}</span>. We use these details to contact you about classes.
        </p>
        <ActionForm action={updateProfile} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Full name
              <input name="full_name" required maxLength={120} defaultValue={profile.full_name} autoComplete="name" className={inputClass} />
            </label>
            <label className={labelClass}>
              Mobile
              <input name="phone" type="tel" maxLength={30} defaultValue={profile.phone ?? ""} autoComplete="tel" className={inputClass} />
            </label>
          </div>
          <SubmitButton>Save details</SubmitButton>
        </ActionForm>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-bold">Change password</h2>
        <ActionForm action={updatePassword} resetOnSuccess className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              New password
              <input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
            </label>
            <label className={labelClass}>
              Confirm new password
              <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
            </label>
          </div>
          <SubmitButton>Update password</SubmitButton>
        </ActionForm>
      </section>
    </div>
  );
}
