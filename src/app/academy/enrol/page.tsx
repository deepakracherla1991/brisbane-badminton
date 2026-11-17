import type { Metadata } from "next";
import { CalendarDays, MapPin, Mail, Phone } from "lucide-react";
import { EnrolmentForm } from "@/components/enrol/EnrolmentForm";
import { PageHero } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentProfile } from "@/lib/portal/auth";
import { advancedSession, enrolmentTerm, familyDiscountNote, kidsSessions, plans, programStructure } from "@/content/enrolment";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `Academy enrolment – ${enrolmentTerm.name}`,
  description: `Enrol in Brisbane Badminton Academy group training for ${enrolmentTerm.name}. Kids group training, Advanced Squad and trial lessons.`,
};

const money = (cents: number) => `$${(cents / 100).toLocaleString("en-AU")}`;
const byDay = kidsSessions.reduce<Record<string, string[]>>((acc, s) => {
  (acc[s.day] ??= []).push(s.time);
  return acc;
}, {});

export default async function EnrolPage() {
  const profile = isSupabaseConfigured ? await getCurrentProfile().catch(() => null) : null;
  const prefill = profile ? { name: profile.full_name, email: profile.email, phone: profile.phone ?? "" } : undefined;

  return (
    <>
      <PageHero
        eyebrow="Academy enrolment"
        title={`${enrolmentTerm.name} group training`}
        intro={`Term dates: ${enrolmentTerm.dates}. Beginners welcome. Suitable for kids, teens and adults.`}
        image="/images/academy/training2.jpg"
      />

      <section className="section">
        <div className="container-x space-y-10">
          {/* Term information */}
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="card p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <CalendarDays className="h-5 w-5 text-brand-300" aria-hidden="true" /> Program structure
              </h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-300">
                {programStructure.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <h2 className="text-xl font-bold">Weekly schedule</h2>
              <dl className="mt-3 space-y-1.5 text-sm">
                {Object.entries(byDay).map(([day, times]) => (
                  <div key={day} className="flex justify-between gap-3">
                    <dt className="text-zinc-400">{day}</dt>
                    <dd className="text-right text-zinc-200">{times.join(" & ")}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-3 border-t border-line pt-1.5">
                  <dt className="text-zinc-400">Advanced Squad</dt>
                  <dd className="text-right text-zinc-200">
                    {advancedSession.day} {advancedSession.time}
                    <span className="block text-xs text-zinc-500">Invite only</span>
                  </dd>
                </div>
              </dl>
            </div>
            <div className="card p-6">
              <h2 className="text-xl font-bold">Training plans</h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {plans.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3">
                    <span className="text-zinc-300">{p.name}</span>
                    <span className="shrink-0 font-medium text-white">{money(p.priceCents)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-line pt-3 text-xs text-zinc-500">
                Family discount: second child $25 off, third child and more $50 off per term. {familyDiscountNote}
              </p>
            </div>
          </div>

          {/* Form */}
          <div id="form" className="scroll-mt-24">
            {isSupabaseConfigured ? (
              <EnrolmentForm prefill={prefill} />
            ) : (
              <div className="card p-8 text-center">
                <h2 className="text-2xl font-bold">Online enrolment is being set up</h2>
                <p className="mt-2 text-zinc-400">
                  Please email {site.contact.email} or call {site.contact.phones[0].display} to enrol for {enrolmentTerm.name}.
                </p>
              </div>
            )}
          </div>

          <div className="card flex flex-col gap-4 p-6 text-sm text-zinc-300 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-300" aria-hidden="true" /> {site.contact.addressFull}
            </span>
            <a href={`mailto:${site.contact.email}`} className="flex items-center gap-2 hover:text-white">
              <Mail className="h-4 w-4 text-brand-300" aria-hidden="true" /> {site.contact.email}
            </a>
            <a href={`tel:${site.contact.phones[0].number}`} className="flex items-center gap-2 hover:text-white">
              <Phone className="h-4 w-4 text-brand-300" aria-hidden="true" /> {site.contact.phones[0].display}
            </a>
            <span className="text-zinc-500">PlayOn QLD vouchers accepted for eligible junior players.</span>
          </div>
        </div>
      </section>
    </>
  );
}
