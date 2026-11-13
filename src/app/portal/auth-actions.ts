"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrigin } from "@/lib/portal/origin";
import { safeNext } from "@/lib/portal/format";
import type { FormState } from "@/lib/portal/types";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
/** Loose phone check: 8–15 digits, allowing spaces, dashes, brackets and a leading +. */
const isPhone = (v: string) => /^\+?[\d\s()-]+$/.test(v) && (v.match(/\d/g)?.length ?? 0) >= 8 && (v.match(/\d/g)?.length ?? 0) <= 15;

/** Friendly wording for Supabase auth errors. */
function authError(error: { message: string; status?: number; code?: string }): FormState {
  if (!error.status || error.status >= 500) return { error: "We couldn't reach the server. Please try again in a moment." };
  if (error.status === 429) return { error: "Too many attempts. Please wait a minute and try again." };
  if (error.code === "user_already_exists") return { error: "An account with that email already exists. Try signing in instead." };
  if (error.code === "weak_password") return { error: "Please choose a stronger password." };
  return { error: error.message };
}

export async function signUp(_: FormState, fd: FormData): Promise<FormState> {
  const fullName = str(fd, "full_name");
  const email = str(fd, "email").toLowerCase();
  const phone = str(fd, "phone");
  const password = String(fd.get("password") ?? "");
  if (!fullName) return { error: "Please enter your name." };
  if (!isEmail(email)) return { error: "Please enter a valid email address." };
  if (!isPhone(phone)) return { error: "Please enter a valid mobile number." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== String(fd.get("confirm") ?? "")) return { error: "Passwords don't match." };

  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName.slice(0, 120), phone: phone.slice(0, 30) },
      emailRedirectTo: `${origin}/portal/auth/confirm?next=/portal`,
    },
  });
  if (error) return authError(error);

  // Email confirmation turned off in Supabase: the user is signed in straight away.
  if (data.session) {
    revalidatePath("/portal", "layout");
    redirect("/portal");
  }
  return { success: `Almost done! We've sent a confirmation link to ${email}. Click it to activate your account.` };
}

export async function signIn(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "Please enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed") return { error: "Please confirm your email first. Check your inbox for the link." };
    if (error.code === "invalid_credentials") return { error: "Email or password is incorrect." };
    return authError(error);
  }
  revalidatePath("/portal", "layout");
  redirect(safeNext(fd.get("next")));
}

export async function requestPasswordReset(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").toLowerCase();
  if (!isEmail(email)) return { error: "Please enter a valid email address." };
  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/portal/auth/confirm?next=/portal/reset-password`,
  });
  if (error && (error.status === 429 || !error.status || error.status >= 500)) return authError(error);
  // Same message either way, so the form doesn't reveal which emails have accounts.
  return { success: "If an account exists for that email, we've sent a link to reset your password." };
}

export async function updatePassword(_: FormState, fd: FormData): Promise<FormState> {
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== String(fd.get("confirm") ?? "")) return { error: "Passwords don't match." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") return { error: "Your new password must be different from your current one." };
    if (error.status === 401 || error.code === "session_not_found") return { error: "Your session has expired. Please sign in again." };
    return authError(error);
  }
  return { success: "Your password has been updated." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/portal", "layout");
  redirect("/portal/login");
}
