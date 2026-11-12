import type { Metadata } from "next";
import { Clock, Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { PageHero, SectionHeading } from "@/components/ui";
import { WhatsAppIcon } from "@/components/SocialIcons";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Brisbane Badminton at 39 Quilton Pl, Crestmead QLD. Opening hours, directions and FAQs.",
};

export default function ContactPage() {
  const { contact } = site;
  const cards = [
    { Icon: MapPin, title: "Visit", lines: [contact.address], href: contact.mapsUrl, cta: "Get directions" },
    { Icon: Mail, title: "Email", lines: [contact.email], href: `mailto:${contact.email}`, cta: "Send an email" },
    {
      Icon: WhatsAppIcon,
      title: "WhatsApp",
      lines: [contact.whatsappDisplay],
      href: `https://wa.me/${contact.whatsapp.replace("+", "")}`,
      cta: "Message us",
    },
  ];

  return (
    <>
      <PageHero eyebrow="Contact" title="Get in touch" intro="Questions about bookings, coaching, the club or events? We're here to help." />

      <section className="section">
        <div className="container-x">
          <ul className="grid gap-5 md:grid-cols-3">
            {cards.map(({ Icon, title, lines, href, cta }) => (
              <li key={title} className="card flex flex-col p-6">
                <Icon className="h-7 w-7 text-brand-300" aria-hidden="true" />
                <h2 className="mt-4 text-xl font-bold">{title}</h2>
                {lines.map((l) => (
                  <p key={l} className="mt-1 break-words text-zinc-300">
                    {l}
                  </p>
                ))}
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="mt-auto pt-5 font-display text-sm uppercase tracking-wider text-brand-300 hover:text-white"
                >
                  {cta} →
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="mb-6 text-3xl font-bold">Send us a message</h2>
              <ContactForm />
            </div>
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <Clock className="h-5 w-5 text-brand-300" aria-hidden="true" /> Opening hours
                </h2>
                <dl className="mt-4 divide-y divide-line">
                  {site.hours.map((h) => (
                    <div key={h.days} className="flex justify-between gap-4 py-3 text-sm">
                      <dt className="text-zinc-400">{h.days}</dt>
                      <dd className="text-white">{h.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="card overflow-hidden">
                <iframe
                  title="Map showing Brisbane Badminton in Crestmead"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`}
                  className="h-72 w-full border-0 grayscale invert-[0.9] hue-rotate-180"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="section border-t border-line bg-ink-2">
        <div className="container-x max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Frequently asked questions" align="center" />
          <div className="space-y-3">
            {site.faqs.map((f) => (
              <details key={f.q} className="card group p-0 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 font-medium text-white">
                  {f.q}
                  <span className="text-2xl leading-none text-brand-300 transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-5 text-zinc-400">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
