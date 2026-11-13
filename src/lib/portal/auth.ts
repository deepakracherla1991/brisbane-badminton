import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "./types";

/** The signed-in user's profile, or null. Cached per request. */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single<Profile>();
  return profile ?? null;
});

/** Redirects to the login page if nobody is signed in. */
export async function requireUser(nextPath = "/portal") {
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/portal/login?next=${encodeURIComponent(nextPath)}`);
  return profile;
}

/** Redirects non-admins back to the portal home. */
export async function requireAdmin() {
  const profile = await requireUser("/portal/admin");
  if (profile.role !== "admin") redirect("/portal");
  return profile;
}
