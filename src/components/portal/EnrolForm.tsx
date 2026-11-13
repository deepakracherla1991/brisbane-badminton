"use client";

import { enrol } from "@/app/portal/actions";
import { ActionForm, SubmitButton, inputClass } from "./forms";

export function EnrolForm({
  classId,
  students,
  full,
}: {
  classId: string;
  students: { id: string; full_name: string }[];
  full: boolean;
}) {
  return (
    <ActionForm action={enrol} className="w-full">
      <input type="hidden" name="class_id" value={classId} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`student-${classId}`}>
          Student
        </label>
        <select id={`student-${classId}`} name="student_id" required defaultValue={students.length === 1 ? students[0].id : ""} className={`${inputClass} mt-0 flex-1`}>
          <option value="" disabled>
            Choose student…
          </option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name}
            </option>
          ))}
        </select>
        <SubmitButton pendingText="Enrolling…" variant={full ? "ghost" : "primary"}>
          {full ? "Join waitlist" : "Enrol"}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
