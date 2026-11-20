import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";

/**
 * Server-only Supabase client with full access (bypasses row level security).
 * Used only to record confirmed card payments from Square. Never import this into client code.
 */
const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const isAdminClientConfigured = Boolean(supabaseUrl && secretKey);

export function createAdminClient() {
  if (!isAdminClientConfigured) throw new Error("SUPABASE_SECRET_KEY is not set.");
  return createClient(supabaseUrl, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
