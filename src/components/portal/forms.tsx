"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/portal/types";

export const inputClass =
  "mt-1.5 w-full rounded-lg border border-line bg-ink px-3.5 py-2.5 text-white placeholder:text-zinc-500 focus:border-brand-300 focus:outline-none disabled:opacity-60";
export const labelClass = "block text-sm text-zinc-300";

/** Pending state of the surrounding ActionForm. */
const PendingContext = createContext(false);

export function SubmitButton({
  children,
  pendingText = "Saving…",
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
}) {
  const formPending = useContext(PendingContext);
  const { pending: statusPending } = useFormStatus();
  const pending = formPending || statusPending;
  const styles = {
    primary: "bg-brand text-white hover:bg-brand-600",
    ghost: "border border-white/25 text-white hover:border-white hover:bg-white/5",
    danger: "border border-brand/50 text-brand-300 hover:bg-brand hover:text-white",
  }[variant];
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wider transition-colors disabled:cursor-wait disabled:opacity-60 ${styles} ${className}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state?.error && !state?.success) return null;
  return (
    <p
      role={state.error ? "alert" : "status"}
      className={`rounded-lg px-3 py-2 text-sm ${
        state.error ? "border border-brand/40 bg-brand/10 text-red-200" : "border border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      }`}
    >
      {state.error ?? state.success}
    </p>
  );
}

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

/** A form wired to a server action, showing its error or success message. */
export function ActionForm({
  action,
  children,
  className = "",
  resetOnSuccess = false,
  confirm,
}: {
  action: Action;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  /** Ask the user to confirm before submitting. */
  confirm?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (resetOnSuccess && state?.success) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    // Submitted manually (not via the `action` prop) so React doesn't clear what people typed when there's an error.
    <form
      ref={ref}
      onSubmit={(e) => {
        e.preventDefault();
        if (pending || (confirm && !window.confirm(confirm))) return;
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
      className={className}
    >
      <PendingContext.Provider value={pending}>{children}</PendingContext.Provider>
      <div className="mt-3 empty:hidden">
        <FormMessage state={state} />
      </div>
    </form>
  );
}
