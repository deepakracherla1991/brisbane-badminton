import { ActionForm, SubmitButton, inputClass, labelClass } from "./forms";
import { DAY_OPTIONS } from "@/lib/portal/format";
import { saveClass } from "@/app/portal/admin/actions";
import { site } from "@/content/site";
import type { AcademyClass, Term } from "@/lib/portal/types";

export function ClassForm({ terms, cls, defaultTermId }: { terms: Term[]; cls?: AcademyClass; defaultTermId?: string }) {
  const v = cls;
  return (
    <ActionForm action={saveClass} className="space-y-4">
      {v && <input type="hidden" name="id" value={v.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Term
          <select name="term_id" required defaultValue={v?.term_id ?? defaultTermId ?? ""} className={inputClass}>
            {terms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {t.is_active ? " (open)" : ""}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Program
          <select name="program" required defaultValue={v?.program ?? site.academy.programs[0].slug} className={inputClass}>
            {site.academy.programs.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Class name
          <input name="name" required maxLength={120} defaultValue={v?.name} placeholder="e.g. Junior Group Training" className={inputClass} />
        </label>
        <label className={labelClass}>
          Level <span className="text-zinc-500">(optional)</span>
          <input name="level" maxLength={60} defaultValue={v?.level ?? ""} placeholder="e.g. Beginner" className={inputClass} />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Description <span className="text-zinc-500">(optional)</span>
          <textarea name="description" rows={2} maxLength={1000} defaultValue={v?.description ?? ""} className={inputClass} />
        </label>
        <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
          <label className={labelClass}>
            Day
            <select name="day_of_week" required defaultValue={v?.day_of_week ?? 6} className={inputClass}>
              {DAY_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Starts
            <input name="start_time" type="time" required defaultValue={v?.start_time.slice(0, 5) ?? "16:30"} className={inputClass} />
          </label>
          <label className={labelClass}>
            Ends
            <input name="end_time" type="time" required defaultValue={v?.end_time.slice(0, 5) ?? "18:00"} className={inputClass} />
          </label>
        </div>
        <label className={labelClass}>
          Coach <span className="text-zinc-500">(optional)</span>
          <input name="coach" maxLength={80} defaultValue={v?.coach ?? ""} className={inputClass} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Capacity
            <input name="capacity" type="number" min={1} required defaultValue={v?.capacity ?? 16} className={inputClass} />
          </label>
          <label className={labelClass}>
            Sessions
            <input name="sessions" type="number" min={1} required defaultValue={v?.sessions ?? 10} className={inputClass} />
          </label>
        </div>
        <label className={labelClass}>
          Term fee (AUD)
          <input name="price" type="number" min={0} step="0.01" required defaultValue={v ? (v.price_cents / 100).toFixed(2) : ""} className={inputClass} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Min age
            <input name="min_age" type="number" min={0} defaultValue={v?.min_age ?? ""} className={inputClass} />
          </label>
          <label className={labelClass}>
            Max age
            <input name="max_age" type="number" min={0} defaultValue={v?.max_age ?? ""} className={inputClass} />
          </label>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input type="checkbox" name="is_published" defaultChecked={v?.is_published ?? true} className="h-4 w-4 accent-[#d92027]" />
        Published (visible to customers)
      </label>
      <SubmitButton>{v ? "Save class" : "Create class"}</SubmitButton>
    </ActionForm>
  );
}
