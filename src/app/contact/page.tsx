import type { Metadata } from "next";
import Image from "next/image";
import { Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { PageHero, SectionHeading } from "@/components/ui";
import { WhatsAppIcon } from "@/components/SocialIcons";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Brisbane Badminton at 39 Quilton Pl, Crestmead QLD. Phone, email, opening hours, directions and FAQs.",
};

export default function ContactPage() {
  const { contact } = site;
  const whatsappUrl = `https://wa.me/${contact.whatsapp.replace("+", "")}`;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get in touch"
        intro="Questions about bookings, coaching, the club or events? We're here to help."
        image="/images/gallery/location-building.jpg"
      />

      {/* Location: venue details + map */}
      <section className="section">
        <div className="container-x grid gap-6 lg:grid-cols-2">
          <article className="card overflow-hidden border-l-4 border-l-brand">
            <div className="relative aspect-[3/2]">
              <Image
                src="/images/gallery/building.jpg"
                alt="Brisbane Badminton entrance at 39 Quilton Place, Crestmead"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-6 p-6 sm:p-8">
              <h2 className="flex gap-3 text-2xl font-bold sm:text-3xl">
                <MapPin className="mt-1 h-6 w-6 shrink-0 text-brand-300" aria-hidden="true" />
                {contact.addressFull}
              </h2>

              <div>
                <h3 className="mb-3 text-sm tracking-widest text-zinc-400">Phone</h3>
                <ul className="space-y-2">
                  {contact.phones.map((p) => (
                    <li key={p.label} className="flex flex-wrap items-center gap-x-2 text-zinc-300">
                      <Phone className="h-4 w-4 text-brand-300" aria-hidden="true" />
                      {p.label}:
                      <a href={`tel:${p.number}`} className="font-medium text-white underline-offset-4 hover:underline">
                        {p.display}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-3 text-sm tracking-widest text-zinc-400">Email</h3>
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 break-all font-medium text-white underline-offset-4 hover:underline">
                  <Mail className="h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
                  {contact.email}
                </a>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wider text-ink transition-opacity hover:opacity-90"
                >
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp us
                </a>
                <a
                  href={`tel:${contact.phones[0].number}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:border-white hover:bg-white/5"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" /> Call us
                </a>
              </div>
            </div>
          </article>

          <article className="card flex flex-col border-l-4 border-l-brand p-6 sm:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-brand-300 sm:text-2xl">Find us on Google Maps</h2>
              <a
                href={contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-display text-sm uppercase tracking-wider text-zinc-300 hover:text-white"
              >
                Get directions <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            <div className="relative min-h-80 flex-1 overflow-hidden rounded-xl bg-white">
              <iframe
                title="Google Map showing Brisbane Badminton, 39 Quilton Pl, Crestmead"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(contact.mapsQuery)}&z=16&output=embed`}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </article>
        </div>
      </section>

      {/* Message form + hours */}
      <section className="section border-t border-line bg-ink-2">
        <div className="container-x grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="mb-6 text-3xl font-bold">Send us a message</h2>
            <ContactForm />
          </div>
          <div>
            <div className="card bg-ink p-6">
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
          </div>
        </div>
      </section>

      <section id="faq" className="section">
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
