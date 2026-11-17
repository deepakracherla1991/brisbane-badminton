/**
 * Academy enrolment form settings: term, sessions, plans, discounts and payment details.
 * Update this file each term. Prices are in cents (e.g. 42500 = $425).
 */

export type ProgramId = "kids" | "advanced" | "trial";
export type SessionStatus = "open" | "limited" | "full";
export type PaymentMethodId = "bank" | "playon" | "playon-bank";

export const enrolmentTerm = {
  id: "2026-t4",
  name: "Term 4, 2026",
  shortName: "T4",
  dates: "Monday 5 October 2026 – Sunday 13 December 2026",
  /** Shown on the form while true. Set to false to close enrolments. */
  open: true,
};

export const programStructure = [
  "10-week school term program",
  "Each lesson is 2 hours",
  "Foundation Plan: 1 lesson per week, 10 lessons per term",
  "About 4–6 students per coach where possible",
  "Suitable for kids, teens and adults. Beginners welcome",
];

export const programs: { id: ProgramId; name: string; description: string }[] = [
  { id: "kids", name: "Kids Group Training", description: "Weekday and weekend group sessions for all levels." },
  { id: "advanced", name: "Advanced Squad (Invite Only)", description: "Thursday 7:00pm – 9:00pm, for invited advanced junior players." },
  { id: "trial", name: "Trial Lesson", description: "Try a single group session before committing to a term." },
];

export const kidsSessions: { id: string; day: string; time: string; level: string; status: SessionStatus }[] = [
  { id: "mon-pm", day: "Monday", time: "5:00pm – 7:00pm", level: "Multi-Level Training (All Levels)", status: "limited" },
  { id: "tue-pm", day: "Tuesday", time: "5:00pm – 7:00pm", level: "New Starter & Beginner", status: "full" },
  { id: "wed-pm", day: "Wednesday", time: "5:00pm – 7:00pm", level: "Intermediate to Advanced", status: "limited" },
  { id: "thu-pm", day: "Thursday", time: "5:00pm – 7:00pm", level: "Beginner to Intermediate", status: "limited" },
  { id: "fri-pm", day: "Friday", time: "5:00pm – 7:00pm", level: "Beginner to Intermediate", status: "open" },
  { id: "sat-am", day: "Saturday", time: "10:00am – 12:00pm", level: "Multi-Level Training (All Levels)", status: "limited" },
  { id: "sat-pm", day: "Saturday", time: "2:00pm – 4:00pm", level: "New Starter & Beginner", status: "open" },
  { id: "sun-am", day: "Sunday", time: "10:00am – 12:00pm", level: "Multi-Level Training (All Levels)", status: "limited" },
];

export const advancedSession = { id: "thu-squad", day: "Thursday", time: "7:00pm – 9:00pm", level: "Advanced Squad" };

export type Plan = {
  id: string;
  name: string;
  priceCents: number;
  summary: string;
  programs: ProgramId[];
  /** Minimum number of weekly sessions to choose. */
  minSessions: number;
  /** Family discount applies (Foundation Plan and above, not Starter or other offers). */
  familyDiscount: boolean;
  badge?: string;
};

export const plans: Plan[] = [
  { id: "starter", name: "Starter Plan", priceCents: 20000, summary: "4 lessons · No makeup lessons · PlayOn voucher accepted with no extra fee", programs: ["kids"], minSessions: 1, familyDiscount: false },
  { id: "foundation", name: "Foundation Plan", priceCents: 42500, summary: "10 lessons · 1 lesson per week", programs: ["kids"], minSessions: 1, familyDiscount: true, badge: "Most popular" },
  { id: "development", name: "Development Plan", priceCents: 75000, summary: "20 lessons · 2 lessons per week", programs: ["kids"], minSessions: 2, familyDiscount: true },
  { id: "performance", name: "Performance Plan", priceCents: 95000, summary: "30 lessons · 3 lessons per week", programs: ["kids"], minSessions: 3, familyDiscount: true },
  { id: "elite", name: "Elite Plan", priceCents: 110000, summary: "Up to 70 training sessions", programs: ["kids"], minSessions: 1, familyDiscount: true },
  { id: "double-foundation", name: "Double Term Foundation", priceCents: 80000, summary: "20 lessons across Term 4 & Term 1 2027 · Save $50", programs: ["kids"], minSessions: 1, familyDiscount: false, badge: "Save $50" },
  { id: "double-development", name: "Double Term Development", priceCents: 140000, summary: "40 lessons across Term 4 & Term 1 2027 · Save $100", programs: ["kids"], minSessions: 2, familyDiscount: false, badge: "Save $100" },
  { id: "advanced-squad", name: "Advanced Squad", priceCents: 52500, summary: "10 lessons · Thursday 7:00pm – 9:00pm · Invite only", programs: ["advanced"], minSessions: 1, familyDiscount: true },
];

/** TODO: set the trial lesson fee. While null, the form says the fee will be confirmed by the team. */
export const trialPriceCents: number | null = null;

export const siblingOptions = [
  { value: 1, label: "First child (full price)", discountCents: 0 },
  { value: 2, label: "Second child ($25 off)", discountCents: 2500 },
  { value: 3, label: "Third child or more ($50 off)", discountCents: 5000 },
];

export const familyDiscountNote =
  "Family discount is available on the Foundation Plan and above. It isn't available on Starter Plans, Trial Lessons, Holiday Camps or with any other discount offer.";

export const playerOptions = {
  gender: ["Male", "Female", "Prefer not to say"],
  level: ["New Starter", "Beginner", "Intermediate", "Advanced", "Not Sure"],
  experience: ["None", "School / Social Play", "Less than 1 year training", "1–3 years training", "3+ years training", "Competition Player"],
  heardFrom: ["Existing Academy Student", "Friend / Family", "PlayOn Voucher", "Google Search", "Facebook", "Instagram", "School", "Website", "Other"],
};

export const paymentMethods: { id: PaymentMethodId; label: string; needsVoucher: boolean }[] = [
  { id: "bank", label: "Bank Transfer", needsVoucher: false },
  { id: "playon", label: "PlayOn Voucher", needsVoucher: true },
  { id: "playon-bank", label: "PlayOn Voucher + Balance by Bank Transfer", needsVoucher: true },
];

export const bankDetails = {
  accountName: "Brisbane Badminton Academy",
  bsb: "067873",
  accountNumber: "23183894",
};

/** Bank transfer reference: student name + term. */
export const paymentReference = (playerName: string) => `${playerName.trim() || "Student Name"} ${enrolmentTerm.shortName}`;

export const importantNotes = [
  "Current academy students receive priority placement.",
  "New students may be assessed and placed into the most suitable group.",
  "Places are limited and subject to availability. Preferred sessions are subject to final confirmation by Brisbane Badminton Academy.",
  "Makeup lessons need at least 24 hours' notice by email to admin@badmintonbrisbane.com.au, must be used within the same term, and are limited to 2 per term.",
  "Payment receipt and/or PlayOn voucher details must be submitted with this form.",
  "Non-marking shoes are required for all players.",
];

export const uploadLimits = {
  maxFiles: 5,
  maxBytes: 10 * 1024 * 1024,
  accept: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"],
};

/** Price for a selection, in cents. `null` total means the fee is confirmed later (trial lessons). */
export function priceFor(program: ProgramId, planId: string | null, siblingOrder: number) {
  if (program === "trial") return { base: trialPriceCents, discount: 0, total: trialPriceCents };
  const plan = plans.find((p) => p.id === planId && p.programs.includes(program));
  if (!plan) return null;
  const sibling = siblingOptions.find((s) => s.value === siblingOrder) ?? siblingOptions[0];
  const discount = plan.familyDiscount ? sibling.discountCents : 0;
  return { base: plan.priceCents, discount, total: plan.priceCents - discount };
}
