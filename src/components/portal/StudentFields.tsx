import { inputClass, labelClass } from "./forms";
import type { Student } from "@/lib/portal/types";

export function StudentFields({ student }: { student?: Pick<Student, "full_name" | "date_of_birth" | "notes"> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>
        Full name
        <input name="full_name" required maxLength={120} defaultValue={student?.full_name} className={inputClass} />
      </label>
      <label className={labelClass}>
        Date of birth <span className="text-zinc-500">(helps us place juniors)</span>
        <input name="date_of_birth" type="date" defaultValue={student?.date_of_birth ?? ""} className={inputClass} />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Notes for coaches <span className="text-zinc-500">(optional: experience, medical info, etc.)</span>
        <textarea name="notes" rows={2} maxLength={1000} defaultValue={student?.notes ?? ""} className={inputClass} />
      </label>
    </div>
  );
}
