import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/portal/auth";
import { ageFromDob, classTime } from "@/lib/portal/format";
import { ClassForm } from "@/components/portal/ClassForm";
import { PaymentSelect } from "@/components/portal/PaymentSelect";
import { AdminWithdrawButton } from "@/components/portal/AdminWithdrawButton";
import { ActionForm, SubmitButton } from "@/components/portal/forms";
import { deleteClass } from "../../actions";
import type { AcademyClass, Enrolment, Profile, Student, Term } from "@/lib/portal/types";

export const metadata: Metadata = { title: "Class roster" };

type RosterRow = Enrolment & {
  students: Pick<Student, "full_name" | "date_of_birth" | "notes"> & { profiles: Pick<Profile, "full_name" | "email" | "phone"> };
};

export default async function ClassAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { created } = await searchParams;
  const supabase = await createClient();

  const [{ data: cls }, { data: terms }, { data: roster }] = await Promise.all([
    supabase.from("classes").select("*").eq("id", id).maybeSingle<AcademyClass>(),
    supabase.from("terms").select("*").order("starts_on", { ascending: false }).returns<Term[]>(),
    supabase
      .from("enrolments")
      .select("*, students(full_name, date_of_birth, notes, profiles(full_name, email, phone))")
      .eq("class_id", id)
      .order("created_at")
      .returns<RosterRow[]>(),
  ]);
  if (!cls) notFound();

  const enrolled = (roster ?? []).filter((r) => r.status === "enrolled");
  const waitlisted = (roster ?? []).filter((r) => r.status === "waitlisted");
  const withdrawn = (roster ?? []).filter((r) => r.status === "withdrawn");

  const Person = ({ r }: { r: RosterRow }) => {
    const age = ageFromDob(r.students.date_of_birth);
    const parent = r.students.profiles;
    return (
      <div className="min-w-0">
        <p className="font-medium text-white">
          {r.students.full_name}
          {age != null && <span className="text-zinc-400"> · {age}</span>}
        </p>
        <p className="truncate text-xs text-zinc-400">
          {parent.full_name} ·{" "}
          <a href={`mailto:${parent.email}`} className="hover:text-white">
            {parent.email}
          </a>
          {parent.phone && (
            <>
              {" "}
              ·{" "}
              <a href={`tel:${parent.phone}`} className="hover:text-white">
                {parent.phone}
              </a>
            </>
          )}
        </p>
        {r.students.notes && <p className="mt-1 text-xs text-amber-200/80">Note: {r.students.notes}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/portal/admin?term=${cls.term_id}`} className="text-sm text-zinc-400 hover:text-white">
          ← All classes
        </Link>
        <h1 className="mt-3 text-4xl font-bold">
          {cls.name}
          {cls.level && <span className="text-zinc-400"> · {cls.level}</span>}
        </h1>
        <p className="mt-1 text-zinc-400">
          {classTime(cls)} · {enrolled.length}/{cls.capacity} enrolled · {waitlisted.length} waitlisted
        </p>
        {created && <p className="mt-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">Class created.</p>}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-8">
          <section className="card">
            <h2 className="border-b border-line px-5 py-4 text-xl font-bold">Enrolled ({enrolled.length})</h2>
            {enrolled.length ? (
              <ul className="divide-y divide-line">
                {enrolled.map((r) => (
                  <li key={r.id} className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <Person r={r} />
                    <div className="flex shrink-0 items-center gap-2">
                      <PaymentSelect enrolmentId={r.id} value={r.payment_status} />
                      <AdminWithdrawButton enrolmentId={r.id} name={r.students.full_name} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-zinc-400">Nobody enrolled yet.</p>
            )}
          </section>

          <section className="card">
            <h2 className="border-b border-line px-5 py-4 text-xl font-bold">Waitlist ({waitlisted.length})</h2>
            {waitlisted.length ? (
              <ol className="divide-y divide-line">
                {waitlisted.map((r, i) => (
                  <li key={r.id} className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <span className="font-display text-lg text-amber-300">{i + 1}</span>
                      <Person r={r} />
                    </div>
                    <AdminWithdrawButton enrolmentId={r.id} name={r.students.full_name} />
                  </li>
                ))}
              </ol>
            ) : (
              <p className="px-5 py-6 text-zinc-400">No one is waiting. Raise the capacity to enrol waitlisted students automatically.</p>
            )}
          </section>

          {withdrawn.length > 0 && (
            <details className="card px-5 py-4">
              <summary className="cursor-pointer text-sm text-zinc-400">Withdrawn ({withdrawn.length})</summary>
              <ul className="mt-3 space-y-2">
                {withdrawn.map((r) => (
                  <li key={r.id}>
                    <Person r={r} />
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>

        <section className="space-y-4">
          <div className="card p-6">
            <h2 className="mb-5 text-xl font-bold">Class details</h2>
            <ClassForm terms={terms ?? []} cls={cls} />
          </div>
          <ActionForm action={deleteClass} confirm="Delete this class? This can't be undone." className="card p-5">
            <input type="hidden" name="id" value={cls.id} />
            <p className="mb-3 text-sm text-zinc-400">Delete this class. Only possible when nobody is enrolled or waitlisted.</p>
            <SubmitButton variant="danger" pendingText="Deleting…" className="!py-1.5 !text-xs">
              Delete class
            </SubmitButton>
          </ActionForm>
        </section>
      </div>
    </div>
  );
}
