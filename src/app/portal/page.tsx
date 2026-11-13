import Link from "next/link";
import { CalendarDays, CreditCard, GraduationCap, UserPlus, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/portal/auth";
import { classTime, formatPrice } from "@/lib/portal/format";
import { PaymentBadge, StatusBadge } from "@/components/portal/badges";
import { WithdrawButton } from "@/components/portal/WithdrawButton";
import { ButtonLink } from "@/components/ui";
import { site } from "@/content/site";
import type { AcademyClass, Enrolment, Student, Term } from "@/lib/portal/types";

type Row = Enrolment & {
  students: Pick<Student, "id" | "full_name">;
  classes: AcademyClass & { terms: Pick<Term, "name" | "ends_on"> };
};

function Landing() {
  const steps = [
    { Icon: UserPlus, title: "Create an account", body: "One login for the whole family." },
    { Icon: Users, title: "Add your students", body: "Yourself, your kids, or both." },
    { Icon: CalendarDays, title: "Pick a class", body: "See times, coaches and spots left. Join the waitlist if it's full." },
    { Icon: CreditCard, title: "Manage it all", body: "View enrolments and payments, or withdraw any time." },
  ];
  return (
    <div className="mx-auto max-w-4xl text-center">
      <p className="eyebrow mb-3">Academy portal</p>
      <h1 className="text-4xl font-bold sm:text-6xl">Enrol in the academy</h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
        Register for term classes, manage your family&apos;s enrolments and keep track of payments, all in one place.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/portal/register">Create an account</ButtonLink>
        <ButtonLink href="/portal/login" variant="ghost">
          Sign in
        </ButtonLink>
      </div>
      <ul className="mt-14 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ Icon, title, body }) => (
          <li key={title} className="card p-5">
            <Icon className="h-6 w-6 text-brand-300" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-bold">{title}</h2>
            <p className="mt-1 text-sm text-zinc-400">{body}</p>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-sm text-zinc-400">
        Just looking?{" "}
        <Link href="/portal/classes" className="text-brand-300 hover:text-white">
          Browse this term&apos;s classes →
        </Link>
      </p>
    </div>
  );
}

export default async function PortalHome() {
  const profile = await getCurrentProfile();
  if (!profile) return <Landing />;

  const supabase = await createClient();
  const [{ data: students }, { data: rows }] = await Promise.all([
    supabase.from("students").select("id, full_name").eq("owner_id", profile.id).order("created_at"),
    supabase
      .from("enrolments")
      .select("*, students!inner(id, full_name, owner_id), classes(*, terms(name, ends_on))")
      .eq("students.owner_id", profile.id)
      .neq("status", "withdrawn")
      .order("created_at")
      .returns<Row[]>(),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const current = (rows ?? []).filter((r) => r.classes.terms.ends_on >= today);
  const unpaid = current.filter((r) => r.status === "enrolled" && r.payment_status === "unpaid");
  const unpaidTotal = unpaid.reduce((sum, r) => sum + r.classes.price_cents, 0);
  const firstName = profile.full_name.split(" ")[0] || "there";

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">My classes</p>
          <h1 className="text-4xl font-bold">Hi {firstName}!</h1>
        </div>
        <ButtonLink href="/portal/classes">Enrol in a class</ButtonLink>
      </div>

      {!profile.phone && (
        <div className="card flex flex-col gap-4 border-amber-500/40 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Add your mobile number</h2>
            <p className="mt-1 text-sm text-zinc-400">We need a contact number before you can enrol, so our coaches can reach you.</p>
          </div>
          <ButtonLink href="/portal/account">Add mobile</ButtonLink>
        </div>
      )}

      {!students?.length && (
        <div className="card flex flex-col gap-4 border-brand/40 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">First, add a student</h2>
            <p className="mt-1 text-sm text-zinc-400">Add yourself and/or your children so you can enrol them in classes.</p>
          </div>
          <ButtonLink href="/portal/students">Add a student</ButtonLink>
        </div>
      )}

      {unpaid.length > 0 && (
        <div className="card border-brand/40 bg-brand/5 p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <CreditCard className="h-5 w-5 text-brand-300" aria-hidden="true" /> {formatPrice(unpaidTotal)} awaiting payment
          </h2>
          <p className="mt-1 text-sm text-zinc-300">{site.academy.paymentInstructions}</p>
        </div>
      )}

      <section>
        <h2 className="mb-4 text-2xl font-bold">Current enrolments</h2>
        {current.length ? (
          <ul className="space-y-3">
            {current.map((r) => {
              const label = [r.classes.name, r.classes.level].filter(Boolean).join(" – ");
              return (
                <li key={r.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={r.status} />
                      {r.status === "enrolled" && <PaymentBadge status={r.payment_status} />}
                    </div>
                    <h3 className="mt-2 text-xl font-bold">{label}</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      <span className="text-white">{r.students.full_name}</span> · {classTime(r.classes)} · {r.classes.terms.name} ·{" "}
                      {formatPrice(r.classes.price_cents)}
                      {r.classes.coach ? ` · Coach ${r.classes.coach}` : ""}
                    </p>
                  </div>
                  <WithdrawButton enrolmentId={r.id} label={`${r.students.full_name} – ${label}`} waitlisted={r.status === "waitlisted"} />
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="card p-8 text-center">
            <GraduationCap className="mx-auto h-8 w-8 text-zinc-500" aria-hidden="true" />
            <p className="mt-3 text-zinc-400">No current enrolments yet.</p>
            <Link href="/portal/classes" className="mt-2 inline-block text-brand-300 hover:text-white">
              Browse classes →
            </Link>
          </div>
        )}
      </section>

      <p className="text-sm text-zinc-500">
        Questions about classes or payments? Call {site.contact.phones[0].display} or email{" "}
        <a href={`mailto:${site.contact.email}`} className="text-zinc-300 hover:text-white">
          {site.contact.email}
        </a>
        .
      </p>
    </div>
  );
}
