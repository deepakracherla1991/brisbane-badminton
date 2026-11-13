import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentProfile } from "@/lib/portal/auth";
import { PortalNav } from "@/components/portal/PortalNav";

export const metadata: Metadata = {
  title: { default: "Academy portal", template: "%s · Academy portal | Brisbane Badminton" },
  robots: { index: false },
};

function SetupNotice() {
  return (
    <div className="card mx-auto max-w-2xl p-6 sm:p-8">
      <p className="eyebrow mb-2">Setup needed</p>
      <h1 className="text-3xl font-bold">Connect the portal to Supabase</h1>
      <p className="mt-3 text-zinc-400">
        The academy portal stores accounts and enrolments in Supabase. It isn&apos;t connected yet. Follow the steps in the
        README (&ldquo;Academy portal&rdquo; section):
      </p>
      <ol className="mt-5 list-decimal space-y-2 pl-5 text-zinc-300">
        <li>Create a free project at supabase.com.</li>
        <li>
          In its SQL editor, run <code className="text-brand-300">supabase/migrations/0001_academy_portal.sql</code>, then
          optionally <code className="text-brand-300">supabase/seed.sql</code> for sample classes.
        </li>
        <li>
          Add <code className="text-brand-300">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-brand-300">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to <code>.env.local</code>.
        </li>
        <li>Restart <code>npm run dev</code>.</li>
      </ol>
    </div>
  );
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) {
    return (
      <section className="container-x py-16">
        <SetupNotice />
      </section>
    );
  }
  const profile = await getCurrentProfile();
  return (
    <>
      {profile && (
        <div className="border-b border-line bg-ink-2">
          <div className="container-x py-4">
            <PortalNav name={profile.full_name || profile.email} isAdmin={profile.role === "admin"} />
          </div>
        </div>
      )}
      <div className="container-x py-10 sm:py-14">{children}</div>
    </>
  );
}
