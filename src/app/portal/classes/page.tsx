import type { Metadata } from "next";
import Link from "next/link";
import { Clock, User, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/portal/auth";
import { ageFromDob, ageRange, classTime, formatPrice, termDates } from "@/lib/portal/format";
import { EnrolForm } from "@/components/portal/EnrolForm";
import { StatusBadge } from "@/components/portal/badges";
import { site } from "@/content/site";
import type { AcademyClass, Availability, Enrolment, Student, Term } from "@/lib/portal/types";

export const metadata: Metadata = { title: "Enrol in a class" };

const programName = (slug: string) => site.academy.programs.find((p) => p.slug === slug)?.name ?? slug;

export default async function ClassesPage({ searchParams }: { searchParams: Promise<{ program?: string }> }) {
  const { program } = await searchParams;
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: term } = await supabase
    .from("terms")
    .select("*")
    .eq("is_active", true)
    .order("starts_on", { ascending: false })
    .limit(1)
    .maybeSingle<Term>();

  if (!term) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <h1 className="text-3xl font-bold">Enrolments open soon</h1>
        <p className="mt-3 text-zinc-400">Next term&apos;s classes haven&apos;t been published yet. Please check back soon, or contact us.</p>
      </div>
    );
  }

  const [{ data: classes }, { data: availability }, { data: students }] = await Promise.all([
    supabase.from("classes").select("*").eq("term_id", term.id).eq("is_published", true).order("day_of_week").order("start_time").returns<AcademyClass[]>(),
    supabase.rpc("class_availability"),
    profile
      ? supabase.from("students").select("id, full_name, date_of_birth").eq("owner_id", profile.id).order("created_at").returns<Pick<Student, "id" | "full_name" | "date_of_birth">[]>()
      : Promise.resolve({ data: [] as Pick<Student, "id" | "full_name" | "date_of_birth">[] }),
  ]);

  const studentIds = (students ?? []).map((s) => s.id);
  const { data: mine } = studentIds.length
    ? await supabase.from("enrolments").select("id, class_id, student_id, status").in("student_id", studentIds).neq("status", "withdrawn").returns<Pick<Enrolment, "id" | "class_id" | "student_id" | "status">[]>()
    : { data: [] as Pick<Enrolment, "id" | "class_id" | "student_id" | "status">[] };

  const avail = new Map(((availability ?? []) as Availability[]).map((a) => [a.class_id, a]));
  const programsInTerm = [...new Set((classes ?? []).map((c) => c.program))];
  const shown = (classes ?? []).filter((c) => !program || c.program === program);

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-2">{term.name}</p>
        <h1 className="text-4xl font-bold">Enrol in a class</h1>
        <p className="mt-2 text-zinc-400">
          {termDates(term)} · Fees are per student for the whole term. {site.academy.paymentInstructions}
        </p>
      </div>

      {programsInTerm.length > 1 && (
        <nav aria-label="Filter by program" className="mb-6 flex flex-wrap gap-2">
          {[undefined, ...programsInTerm].map((p) => (
            <Link
              key={p ?? "all"}
              href={p ? `/portal/classes?program=${p}` : "/portal/classes"}
              aria-current={program === p ? "page" : undefined}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                program === p ? "border-brand bg-brand text-white" : "border-line text-zinc-300 hover:border-white/40 hover:text-white"
              }`}
            >
              {p ? programName(p) : "All classes"}
            </Link>
          ))}
        </nav>
      )}

      {!profile && (
        <div className="card mb-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-zinc-300">Sign in or create an account to enrol.</p>
          <div className="flex gap-2">
            <Link href="/portal/login?next=/portal/classes" className="rounded-full border border-white/25 px-4 py-2 font-display text-sm uppercase tracking-wider text-white hover:bg-white/5">
              Sign in
            </Link>
            <Link href="/portal/register" className="rounded-full bg-brand px-4 py-2 font-display text-sm uppercase tracking-wider text-white hover:bg-brand-600">
              Create account
            </Link>
          </div>
        </div>
      )}
      {profile && !students?.length && (
        <div className="card mb-6 flex flex-col gap-3 border-brand/40 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-zinc-300">Add a student (yourself or your child) before enrolling.</p>
          <Link href="/portal/students" className="rounded-full bg-brand px-4 py-2 text-center font-display text-sm uppercase tracking-wider text-white hover:bg-brand-600">
            Add a student
          </Link>
        </div>
      )}

      {shown.length ? (
        <ul className="grid gap-5 lg:grid-cols-2">
          {shown.map((c) => {
            const a = avail.get(c.id);
            const taken = a?.enrolled ?? 0;
            const left = Math.max(0, c.capacity - taken);
            const full = left === 0;
            const myHere = (mine ?? []).filter((m) => m.class_id === c.id);
            const eligible = (students ?? []).filter((s) => !myHere.some((m) => m.student_id === s.id));
            return (
              <li key={c.id} className="card flex flex-col p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand-300">{programName(c.program)}</p>
                    <h2 className="mt-1 text-2xl font-bold">
                      {c.name}
                      {c.level && <span className="text-zinc-400"> · {c.level}</span>}
                    </h2>
                  </div>
                  <p className="text-right">
                    <span className="block font-display text-2xl font-bold text-white">{formatPrice(c.price_cents)}</span>
                    <span className="text-xs text-zinc-400">{c.sessions} sessions</span>
                  </p>
                </div>
                {c.description && <p className="mt-3 text-sm text-zinc-400">{c.description}</p>}
                <ul className="mt-4 space-y-1.5 text-sm text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-brand-300" aria-hidden="true" /> {classTime(c)}
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-brand-300" aria-hidden="true" /> {ageRange(c)}
                  </li>
                  {c.coach && (
                    <li className="flex items-center gap-2">
                      <User className="h-4 w-4 text-brand-300" aria-hidden="true" /> Coach {c.coach}
                    </li>
                  )}
                </ul>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className={full ? "font-semibold text-amber-300" : left <= 3 ? "font-semibold text-brand-300" : "text-zinc-400"}>
                      {full ? `Full${a?.waitlisted ? ` · ${a.waitlisted} on waitlist` : ""}` : `${left} of ${c.capacity} spots left`}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                    <div className={`h-full rounded-full ${full ? "bg-amber-400" : "bg-brand"}`} style={{ width: `${Math.min(100, (taken / c.capacity) * 100)}%` }} />
                  </div>
                </div>

                {myHere.length > 0 && (
                  <ul className="mt-4 space-y-1 text-sm">
                    {myHere.map((m) => (
                      <li key={m.id} className="flex items-center gap-2 text-zinc-300">
                        <StatusBadge status={m.status} /> {students?.find((s) => s.id === m.student_id)?.full_name}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto pt-5">
                  {profile && eligible.length > 0 ? (
                    <>
                      <EnrolForm classId={c.id} students={eligible.map(({ id, full_name }) => ({ id, full_name }))} full={full} />
                      {eligible.some((s) => {
                        const age = ageFromDob(s.date_of_birth);
                        return age != null && ((c.min_age != null && age < c.min_age) || (c.max_age != null && age > c.max_age));
                      }) && <p className="mt-2 text-xs text-zinc-500">Check the age range above. Our coaches may move students to a better-suited group.</p>}
                    </>
                  ) : profile && students?.length ? (
                    <p className="text-sm text-zinc-500">All your students are already in this class.</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-zinc-400">No classes in this program this term.</p>
      )}
    </div>
  );
}
