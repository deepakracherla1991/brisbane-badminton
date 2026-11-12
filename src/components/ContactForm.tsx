"use client";

import { useState } from "react";
import { site } from "@/content/site";

const topics = ["Court hire", "Academy", "Socials", "Club membership", "Restringing", "Events & groups", "Other"];

/**
 * Opens the visitor's email app with the message pre-filled.
 * TODO: swap for a form service (e.g. Fillout, Formspree) or an API route to receive messages directly.
 */
export function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = `[${data.get("topic")}] Enquiry from ${data.get("name")}`;
    const body = `${data.get("message")}\n\n${data.get("name")}\n${data.get("email")}\n${data.get("phone") || ""}`;
    window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  const field =
    "mt-1.5 w-full rounded-lg border border-line bg-ink px-4 py-3 text-white placeholder:text-zinc-500 focus:border-brand-300 focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm text-zinc-300">
          Name
          <input name="name" required autoComplete="name" className={field} />
        </label>
        <label className="block text-sm text-zinc-300">
          Email
          <input name="email" type="email" required autoComplete="email" className={field} />
        </label>
        <label className="block text-sm text-zinc-300">
          Phone <span className="text-zinc-500">(optional)</span>
          <input name="phone" type="tel" autoComplete="tel" className={field} />
        </label>
        <label className="block text-sm text-zinc-300">
          Topic
          <select name="topic" className={field} defaultValue={topics[0]}>
            {topics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm text-zinc-300">
        Message
        <textarea name="message" required rows={5} className={field} />
      </label>
      <button
        type="submit"
        className="w-full rounded-full bg-brand px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-600 sm:w-auto"
      >
        Send message
      </button>
      <p role="status" className="text-sm text-zinc-400">
        {sent ? "Your email app should now be open with your message ready to send." : ""}
      </p>
    </form>
  );
}
