import {
  advancedSession,
  kidsSessions,
  paymentMethods,
  playerOptions,
  plans,
  priceFor,
  siblingOptions,
  uploadLimits,
  type PaymentMethodId,
  type ProgramId,
} from "@/content/enrolment";

export type EnrolmentInput = {
  program: ProgramId | "";
  planId: string;
  sessions: string[];
  invitedByCoach: "yes" | "no" | "";
  siblingOrder: number;
  player: { name: string; dob: string; gender: string; level: string; experience: string; medical: string; heardFrom: string };
  parent: { name: string; mobile: string; email: string; emergency: string; suburb: string };
  paymentMethod: PaymentMethodId | "";
  voucher: string;
  uploadId: string;
  files: string[];
  agree: boolean;
};

export const emptyEnrolment: EnrolmentInput = {
  program: "",
  planId: "",
  sessions: [],
  invitedByCoach: "",
  siblingOrder: 1,
  player: { name: "", dob: "", gender: "", level: "", experience: "", medical: "", heardFrom: "" },
  parent: { name: "", mobile: "", email: "", emergency: "", suburb: "" },
  paymentMethod: "",
  voucher: "",
  uploadId: "",
  files: [],
  agree: false,
};

export const STEPS = ["Program", "Player", "Parent / Guardian", "Payment"] as const;
export type Errors = Partial<Record<string, string>>;

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
const isPhone = (v: string) => /^\+?[\d\s()-]+$/.test(v) && (v.match(/\d/g)?.length ?? 0) >= 8 && (v.match(/\d/g)?.length ?? 0) <= 15;

export function ageOn(dob: string, at = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const [y, m, d] = dob.split("-").map(Number);
  let age = at.getFullYear() - y;
  if (at.getMonth() + 1 < m || (at.getMonth() + 1 === m && at.getDate() < d)) age--;
  return age;
}

/** Plans offered for a program. */
export const plansFor = (program: ProgramId | "") => plans.filter((p) => program && p.programs.includes(program as ProgramId));

/** Validates one step (0–3). Returns field errors keyed by field name. */
export function validateStep(step: number, v: EnrolmentInput): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!v.program) e.program = "Choose a program.";
    if (v.program === "kids") {
      const plan = plans.find((p) => p.id === v.planId && p.programs.includes("kids"));
      if (!plan) e.planId = "Choose a training plan.";
      const valid = v.sessions.filter((id) => kidsSessions.some((s) => s.id === id && s.status !== "full"));
      if (valid.length !== v.sessions.length) e.sessions = "One of the selected sessions is no longer available.";
      else if (plan && valid.length < plan.minSessions)
        e.sessions = `The ${plan.name} includes ${plan.minSessions} lessons a week. Choose at least ${plan.minSessions} sessions.`;
      else if (!valid.length) e.sessions = "Choose at least one session.";
    }
    if (v.program === "trial") {
      if (v.sessions.length !== 1 || !kidsSessions.some((s) => s.id === v.sessions[0] && s.status !== "full"))
        e.sessions = "Choose one session for the trial lesson.";
    }
    if (v.program === "advanced" && !v.invitedByCoach) e.invitedByCoach = "Let us know whether a coach has invited you.";
    if (!siblingOptions.some((s) => s.value === v.siblingOrder)) e.siblingOrder = "Choose an option.";
  }
  if (step === 1) {
    const p = v.player;
    if (!p.name.trim()) e["player.name"] = "Enter the player's full name.";
    const age = ageOn(p.dob);
    if (age == null || age < 3 || age > 100) e["player.dob"] = "Enter a valid date of birth.";
    if (p.gender && !playerOptions.gender.includes(p.gender)) e["player.gender"] = "Choose an option.";
    if (!playerOptions.level.includes(p.level)) e["player.level"] = "Choose the current playing level.";
    if (!playerOptions.experience.includes(p.experience)) e["player.experience"] = "Choose previous experience.";
    if (!p.medical.trim()) e["player.medical"] = 'Enter any medical conditions, injuries or allergies, or write "None".';
    if (p.heardFrom && !playerOptions.heardFrom.includes(p.heardFrom)) e["player.heardFrom"] = "Choose an option.";
  }
  if (step === 2) {
    const g = v.parent;
    if (!g.name.trim()) e["parent.name"] = "Enter the parent or guardian's full name.";
    if (!isPhone(g.mobile)) e["parent.mobile"] = "Enter a valid mobile number.";
    if (!isEmail(g.email.trim())) e["parent.email"] = "Enter a valid email address.";
    if (!g.emergency.trim()) e["parent.emergency"] = "Enter an emergency contact name and number.";
    if (!g.suburb.trim()) e["parent.suburb"] = "Enter your suburb.";
  }
  if (step === 3) {
    const method = paymentMethods.find((m) => m.id === v.paymentMethod);
    if (!method) e.paymentMethod = "Choose a payment method.";
    if (method?.needsVoucher && !v.voucher.trim()) e.voucher = "Enter your PlayOn voucher number.";
    if (method?.needsReceipt !== false && !v.files.length) e.files = "Upload your payment receipt or PlayOn voucher.";
    if (method?.id === "card" && v.program === "trial") e.paymentMethod = "Card payment isn't available for trial lessons yet. Choose another method.";
    if (v.files.length > uploadLimits.maxFiles) e.files = `Upload up to ${uploadLimits.maxFiles} files.`;
    if (!v.agree) e.agree = "Please read and accept the important notes.";
  }
  return e;
}

export function validateAll(v: EnrolmentInput): Errors {
  return Object.assign({}, ...STEPS.map((_, i) => validateStep(i, v)));
}

/** Normalised selection: plan and sessions forced to match the program. */
export function normalise(v: EnrolmentInput) {
  const planId = v.program === "advanced" ? "advanced-squad" : v.program === "trial" ? null : v.planId;
  const sessions = v.program === "advanced" ? [advancedSession.id] : v.sessions;
  const price = v.program ? priceFor(v.program, planId, v.siblingOrder) : null;
  return { planId, sessions, price };
}

/** Human-readable session labels. */
export function sessionLabel(id: string) {
  if (id === advancedSession.id) return `${advancedSession.day} ${advancedSession.time} | ${advancedSession.level}`;
  const s = kidsSessions.find((k) => k.id === id);
  return s ? `${s.day} ${s.time} | ${s.level}` : id;
}
