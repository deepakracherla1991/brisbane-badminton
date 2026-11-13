import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/portal/auth";
import { ageFromDob } from "@/lib/portal/format";
import { ActionForm, SubmitButton } from "@/components/portal/forms";
import { StudentFields } from "@/components/portal/StudentFields";
import { addStudent, deleteStudent, updateStudent } from "../actions";
import type { Student } from "@/lib/portal/types";

export const metadata: Metadata = { title: "Students" };

export default async function StudentsPage() {
  const profile = await requireUser("/portal/students");
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("*, enrolments(status)")
    .eq("owner_id", profile.id)
    .order("created_at")
    .returns<(Student & { enrolments: { status: string }[] })[]>();

  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
      <section>
        <p className="eyebrow mb-2">Students</p>
        <h1 className="text-4xl font-bold">Who&apos;s playing?</h1>
        <p className="mt-2 text-zinc-400">Add everyone you want to enrol: yourself, your children, or both.</p>

        <ul className="mt-8 space-y-3">
          {students?.length ? (
            students.map((s) => {
              const age = ageFromDob(s.date_of_birth);
              const active = s.enrolments.filter((e) => e.status !== "withdrawn").length;
              return (
                <li key={s.id} className="card">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
                      <div>
                        <h2 className="text-xl font-bold">{s.full_name}</h2>
                        <p className="text-sm text-zinc-400">
                          {age != null ? `Age ${age}` : "No date of birth"} · {active} active class{active === 1 ? "" : "es"}
                        </p>
                      </div>
                      <span className="text-sm text-brand-300 group-open:hidden">Edit</span>
                      <span className="hidden text-sm text-zinc-400 group-open:inline">Close</span>
                    </summary>
                    <div className="border-t border-line p-5">
                      <ActionForm action={updateStudent}>
                        <input type="hidden" name="id" value={s.id} />
                        <StudentFields student={s} />
                        <div className="mt-4">
                          <SubmitButton>Save changes</SubmitButton>
                        </div>
                      </ActionForm>
                      <ActionForm action={deleteStudent} confirm={`Remove ${s.full_name}?`} className="mt-4 border-t border-line pt-4">
                        <input type="hidden" name="id" value={s.id} />
                        <SubmitButton variant="danger" pendingText="Removing…" className="!px-3.5 !py-1.5 !text-xs">
                          Remove student
                        </SubmitButton>
                      </ActionForm>
                    </div>
                  </details>
                </li>
              );
            })
          ) : (
            <li className="card p-6 text-zinc-400">No students yet. Add your first one using the form.</li>
          )}
        </ul>
      </section>

      <section className="lg:pt-24">
        <div className="card p-6">
          <h2 className="text-2xl font-bold">Add a student</h2>
          <ActionForm action={addStudent} resetOnSuccess className="mt-5">
            <StudentFields />
            <div className="mt-4">
              <SubmitButton pendingText="Adding…">Add student</SubmitButton>
            </div>
          </ActionForm>
        </div>
      </section>
    </div>
  );
}
