import "server-only";
import { Resend } from "resend";
import { site } from "@/content/site";
import { enrolmentTerm, paymentMethods } from "@/content/enrolment";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? `${site.name} <onboarding@resend.dev>`;
const replyTo = process.env.EMAIL_REPLY_TO ?? site.contact.email;
const resend = apiKey ? new Resend(apiKey) : null;

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function layout(title: string, paragraphs: string[], cta?: { label: string; url: string }) {
  const body = paragraphs.map((p) => `<p style="margin:0 0 14px;line-height:1.55">${p}</p>`).join("");
  const button = cta
    ? `<p style="margin:22px 0"><a href="${cta.url}" style="background:#d92027;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">${escape(cta.label)}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b">
<div style="max-width:560px;margin:0 auto;padding:28px 16px">
<div style="background:#0b0b0c;color:#fff;padding:18px 24px;border-radius:14px 14px 0 0;font-weight:700;letter-spacing:.08em">BRISBANE BADMINTON</div>
<div style="background:#fff;padding:26px 24px;border-radius:0 0 14px 14px">
<h1 style="font-size:20px;margin:0 0 16px">${escape(title)}</h1>${body}${button}
<p style="margin:24px 0 0;font-size:13px;color:#71717a">${escape(site.contact.addressFull)} · ${escape(site.contact.phones[0].display)} · ${escape(site.contact.email)}</p>
</div></div></body></html>`;
}

/** Sends an email via Resend. Without RESEND_API_KEY it logs the email instead, so local development works. */
async function send(to: string, subject: string, html: string) {
  if (!to) return;
  if (!resend) {
    console.info(`[email] RESEND_API_KEY not set; would send "${subject}" to ${to}`);
    return;
  }
  const { error } = await resend.emails.send({ from, to, replyTo, subject, html });
  if (error) console.error(`[email] Failed to send "${subject}" to ${to}: ${error.message}`);
}

type ClassInfo = { studentName: string; className: string; when: string; termName: string; price: string; origin: string };

export async function sendEnrolmentEmail(to: string, info: ClassInfo & { status: "enrolled" | "waitlisted" }) {
  const s = (v: string) => `<strong>${escape(v)}</strong>`;
  if (info.status === "enrolled") {
    await send(
      to,
      `Enrolment confirmed: ${info.studentName} – ${info.className}`,
      layout(
        "You're enrolled!",
        [
          `${s(info.studentName)} is enrolled in ${s(info.className)} for ${escape(info.termName)}.`,
          `When: ${escape(info.when)}<br>Fee: ${escape(info.price)}`,
          `Your place is confirmed. ${escape(site.academy.paymentInstructions)}`,
        ],
        { label: "View my classes", url: `${info.origin}/portal` },
      ),
    );
  } else {
    await send(
      to,
      `Waitlisted: ${info.studentName} – ${info.className}`,
      layout(
        "You're on the waitlist",
        [
          `${s(info.className)} (${escape(info.when)}) is currently full, so ${s(info.studentName)} has been added to the waitlist for ${escape(info.termName)}.`,
          `If a place opens up we'll move ${escape(info.studentName)} into the class automatically and email you straight away.`,
        ],
        { label: "View my classes", url: `${info.origin}/portal` },
      ),
    );
  }
}

export async function sendPromotedEmails(promotions: { email: string; student_name: string; class_name: string }[], origin: string) {
  await Promise.all(
    promotions.map((p) =>
      send(
        p.email,
        `A place opened up: ${p.student_name} – ${p.class_name}`,
        layout(
          "Good news, a place opened up!",
          [
            `<strong>${escape(p.student_name)}</strong> has been moved off the waitlist and is now enrolled in <strong>${escape(p.class_name)}</strong>.`,
            `${escape(site.academy.paymentInstructions)} If you no longer need the place, please withdraw in the portal so the next person can join.`,
          ],
          { label: "View my classes", url: `${origin}/portal` },
        ),
      ),
    ),
  );
}

const money = (cents: number) => `$${(cents / 100).toLocaleString("en-AU", { minimumFractionDigits: cents % 100 ? 2 : 0 })}`;

/** Enrolment form: tells the parent their enrolment was confirmed, waitlisted, declined or cancelled. */
export async function sendEnrolmentStatus(e: {
  to: string;
  parentName: string;
  playerName: string;
  reference: string;
  status: "confirmed" | "waitlisted" | "declined" | "cancelled";
  sessions: string[];
}) {
  const hi = `Hi ${escape(e.parentName.split(" ")[0] || "there")},`;
  const content = {
    confirmed: {
      title: "Enrolment confirmed!",
      body: [
        `${hi} ${escape(e.playerName)}'s place in ${escape(enrolmentTerm.name)} group training is confirmed.`,
        `<strong>Sessions:</strong><br>${e.sessions.map(escape).join("<br>")}`,
        "Please bring non-marking shoes and a water bottle. See you on court!",
      ],
    },
    waitlisted: {
      title: "You're on the waitlist",
      body: [`${hi} the sessions you chose for ${escape(e.playerName)} are currently full, so we've added them to the waitlist. We'll be in touch as soon as a place opens up.`],
    },
    declined: {
      title: "About your enrolment",
      body: [`${hi} unfortunately we couldn't offer ${escape(e.playerName)} a place in the sessions requested this term. Our team will contact you about other options and any refund.`],
    },
    cancelled: {
      title: "Enrolment cancelled",
      body: [`${hi} ${escape(e.playerName)}'s enrolment for ${escape(enrolmentTerm.name)} has been cancelled. If this is unexpected, please contact us.`],
    },
  }[e.status];
  await send(
    e.to,
    `${content.title.replace("!", "")}: ${e.playerName} (${e.reference})`,
    layout(content.title, [...content.body, `Reference: ${escape(e.reference)}. Questions? Call ${escape(site.contact.phones[0].display)}.`]),
  );
}

/** Enrolment form: confirmation to the parent, and a notice to the academy inbox. */
export async function sendEnrolmentReceived(e: {
  reference: string;
  parentEmail: string;
  parentName: string;
  playerName: string;
  program: string;
  plan: string;
  sessions: string[];
  totalCents: number | null;
  discountCents: number;
  paymentMethod: string;
  /** Card payment already confirmed by Square. */
  paid?: boolean;
  origin: string;
}) {
  const method = e.paid ? "Paid by card ✓" : (paymentMethods.find((m) => m.id === e.paymentMethod)?.label ?? e.paymentMethod);
  const total = e.totalCents == null ? "To be confirmed by our team" : money(e.totalCents);
  const details = [
    `<strong>Reference:</strong> ${escape(e.reference)}`,
    `<strong>Player:</strong> ${escape(e.playerName)}`,
    `<strong>Program:</strong> ${escape(e.program)}${e.plan ? ` · ${escape(e.plan)}` : ""}`,
    `<strong>Preferred sessions:</strong><br>${e.sessions.map(escape).join("<br>")}`,
    `<strong>Total:</strong> ${escape(total)}${e.discountCents ? ` (family discount ${money(e.discountCents)} applied)` : ""}`,
    `<strong>Payment method:</strong> ${escape(method)}`,
  ].join("<br>");

  await send(
    e.parentEmail,
    `Enrolment received: ${e.playerName} – ${enrolmentTerm.name} (${e.reference})`,
    layout("We've received your enrolment", [
      `Hi ${escape(e.parentName.split(" ")[0] || "there")}, thanks for enrolling ${escape(e.playerName)} in ${escape(enrolmentTerm.name)} group training.`,
      details,
      e.paid
        ? "We've received your payment. Our team will confirm the final session placement by email. Preferred sessions are subject to availability."
        : "Our team will check your payment and confirm the final session placement by email. Preferred sessions are subject to availability.",
      `Questions? Reply to this email or call ${escape(site.contact.phones[0].display)}, quoting your reference.`,
    ]),
  );

  const notify = process.env.ACADEMY_NOTIFY_EMAIL ?? site.contact.email;
  await send(
    notify,
    `New enrolment${e.paid ? " (paid by card)" : ""}: ${e.playerName} – ${e.plan || e.program} (${e.reference})`,
    layout("New academy enrolment", [`Parent: ${escape(e.parentName)} &lt;${escape(e.parentEmail)}&gt;`, details], {
      label: "Review in admin",
      url: `${e.origin}/portal/admin/enrolments`,
    }),
  );
}
