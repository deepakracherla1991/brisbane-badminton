import type { Metadata } from "next";
import { ButtonLink, CheckList, CtaBand, PageHero, SectionHeading, TodoNote } from "@/components/ui";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Court hire",
  description: "Hire a BWF-standard badminton court in Brisbane from $15/hr off-peak. Open 7 days with instant online booking.",
};

const uses = [
  { title: "Casual games", body: "Book a court with friends any day of the week." },
  { title: "Corporate events", body: "Team-building days with multiple courts and optional coaching." },
  { title: "Schools", body: "Curriculum sport, carnivals and after-school programs." },
  { title: "Tournaments", body: "Nine courts for club competitions and community events." },
];

export default function CourtHirePage() {
  return (
    <>
      <PageHero
        eyebrow="Court hire"
        title="Play more, pay less"
        intro="Nine BWF-standard courts, Queensland's highest ceilings, open seven days a week. Off-peak court hire starts from $15 an hour."
        image="/images/gallery/courts1.jpg"
      >
        <ButtonLink href={site.links.bookCourt}>Book now</ButtonLink>
      </PageHero>

      <section id="book" className="section">
        <div className="container-x">
          <SectionHeading
            eyebrow="Rates"
            title="Simple, honest pricing"
            intro="Prices are per court, per hour, for up to four players. Weekend and public holiday prices are shown when you book."
          />
          <ul className="grid gap-5 md:grid-cols-3">
            {site.courtHire.rates.map((r, i) => (
              <li key={r.label} className={`card flex flex-col p-7 ${i === 0 ? "border-brand/60 ring-1 ring-brand/30" : ""}`}>
                <h3 className="text-lg text-zinc-300">{r.label}</h3>
                <p className="mt-3 font-display text-5xl font-bold text-white">{r.price}</p>
                <p className="mt-1 text-sm text-zinc-400">{r.unit}</p>
                <p className="mt-5 border-t border-line pt-4 text-sm text-zinc-300">{r.note}</p>
              </li>
            ))}
          </ul>
          <div className="card mt-6 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h3 className="text-2xl font-bold">Book online</h3>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-zinc-300">
                <li>Pick a day, then choose a free court and time.</li>
                <li>Log in or register, then check out.</li>
                <li>Have credit or a PlayOn voucher? Use the Credit and Redeem voucher links on the booking site.</li>
              </ol>
            </div>
            <ButtonLink href={site.links.bookCourt} className="shrink-0">
              See availability
            </ButtonLink>
          </div>
          <TodoNote>Confirm weekend and public holiday rates.</TodoNote>
        </div>
      </section>

      <section className="section border-t border-line bg-ink-2">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Why play here" title="Courts built for the game" />
            <CheckList items={site.courtHire.points} />
          </div>
          <div>
            <SectionHeading eyebrow="Opening hours" title="Open 7 days" />
            <dl className="card divide-y divide-line">
              {site.hours.map((h) => (
                <div key={h.days} className="flex items-center justify-between gap-4 px-6 py-4">
                  <dt className="text-zinc-300">{h.days}</dt>
                  <dd className="font-display text-lg text-white">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="Groups & events" title="More than a casual hit" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {uses.map((u) => (
              <li key={u.title} className="card p-6">
                <h3 className="text-xl font-bold">{u.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{u.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        title="Booking a group?"
        body="Get in touch for multi-court bookings, regular slots and event packages."
        primary={{ href: "/contact", label: "Request a quote" }}
      />
    </>
  );
}
