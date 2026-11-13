import type { AcademyClass, Term } from "./types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const dayName = (d: number) => DAYS[d] ?? "";
export const DAY_OPTIONS = DAYS.map((label, value) => ({ value, label }));

/** "17:30:00" -> "5:30pm" */
export function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}${m ? `:${String(m).padStart(2, "0")}` : ""}${suffix}`;
}

export const classTime = (c: Pick<AcademyClass, "day_of_week" | "start_time" | "end_time">) =>
  `${dayName(c.day_of_week)}s, ${formatTime(c.start_time)} – ${formatTime(c.end_time)}`;

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: cents % 100 ? 2 : 0,
  }).format(cents / 100);
}

/** "2027-01-27" -> "27 Jan 2027" (dates are stored without time zones). */
export function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const termDates = (t: Pick<Term, "starts_on" | "ends_on">) => `${formatDate(t.starts_on)} – ${formatDate(t.ends_on)}`;

export function ageRange(c: Pick<AcademyClass, "min_age" | "max_age">) {
  if (c.min_age != null && c.max_age != null) return `Ages ${c.min_age}–${c.max_age}`;
  if (c.min_age != null) return `Ages ${c.min_age}+`;
  if (c.max_age != null) return `Up to age ${c.max_age}`;
  return "All ages";
}

export function ageFromDob(dob: string | null) {
  if (!dob) return null;
  const [y, m, d] = dob.split("-").map(Number);
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
  return age;
}

/** Only allow redirects to paths inside the portal. */
export function safeNext(next: unknown, fallback = "/portal") {
  return typeof next === "string" && next.startsWith("/portal") && !next.startsWith("//") ? next : fallback;
}
