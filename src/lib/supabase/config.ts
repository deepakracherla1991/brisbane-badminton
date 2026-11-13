export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** False until NEXT_PUBLIC_SUPABASE_URL and a key are set in .env.local. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

/** Show "Continue with Google" once the Google provider is enabled in Supabase (see README). */
export const isGoogleAuthEnabled = process.env.NEXT_PUBLIC_AUTH_GOOGLE === "true";
