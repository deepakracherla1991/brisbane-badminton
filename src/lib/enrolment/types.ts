export type ApplicationStatus = "new" | "confirmed" | "waitlisted" | "declined" | "cancelled";
export type ApplicationPayment = "pending" | "verified" | "refunded";

export type Application = {
  id: string;
  reference: string;
  created_at: string;
  user_id: string | null;
  term: string;
  program: "kids" | "advanced" | "trial";
  plan: string | null;
  sessions: string[];
  invited_by_coach: boolean | null;
  player_name: string;
  date_of_birth: string;
  gender: string | null;
  level: string;
  experience: string;
  medical: string;
  heard_from: string | null;
  parent_name: string;
  mobile: string;
  email: string;
  emergency_contact: string;
  suburb: string;
  sibling_order: number;
  price_cents: number | null;
  discount_cents: number;
  total_cents: number | null;
  payment_method: string;
  playon_voucher: string | null;
  files: string[];
  status: ApplicationStatus;
  payment_status: ApplicationPayment;
  admin_notes: string | null;
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  waitlisted: "Waitlisted",
  declined: "Declined",
  cancelled: "Cancelled",
};

export const PAYMENT_LABELS: Record<ApplicationPayment, string> = {
  pending: "Payment to check",
  verified: "Payment verified",
  refunded: "Refunded",
};

export function statusClass(s: ApplicationStatus) {
  return {
    new: "bg-sky-500/15 text-sky-300",
    confirmed: "bg-emerald-500/15 text-emerald-300",
    waitlisted: "bg-amber-500/15 text-amber-300",
    declined: "bg-white/10 text-zinc-400",
    cancelled: "bg-white/10 text-zinc-400",
  }[s];
}
