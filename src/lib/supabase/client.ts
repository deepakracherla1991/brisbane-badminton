import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "./config";

/** Supabase client for the browser (used to upload enrolment receipts straight to storage). */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
