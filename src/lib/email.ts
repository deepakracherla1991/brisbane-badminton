import "server-only";
import { Resend } from "resend";
import { site } from "@/content/site";

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
