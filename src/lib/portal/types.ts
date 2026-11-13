export type Role = "customer" | "admin";
export type EnrolmentStatus = "enrolled" | "waitlisted" | "withdrawn";
export type PaymentStatus = "unpaid" | "paid" | "waived";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: Role;
  created_at: string;
};

export type Student = {
  id: string;
  owner_id: string;
  full_name: string;
  date_of_birth: string | null;
  notes: string | null;
  created_at: string;
};

export type Term = {
  id: string;
  name: string;
  starts_on: string;
  ends_on: string;
  is_active: boolean;
};

export type AcademyClass = {
  id: string;
  term_id: string;
  program: string;
  name: string;
  level: string | null;
  description: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  coach: string | null;
  capacity: number;
  price_cents: number;
  sessions: number;
  min_age: number | null;
  max_age: number | null;
  is_published: boolean;
};

export type Enrolment = {
  id: string;
  class_id: string;
  student_id: string;
  status: EnrolmentStatus;
  payment_status: PaymentStatus;
  created_at: string;
};

export type Availability = { class_id: string; enrolled: number; waitlisted: number };

/** Returned by withdraw_enrolment / promote_waitlist for people moved off the waitlist. */
export type Promotion = { enrolment_id: string; email: string; student_name: string; class_name: string };

/** Result shown by portal forms. */
export type FormState = { error?: string; success?: string } | null;
