import type { Metadata } from "next";
import { ButtonLink, CheckList, CtaBand, Media, PageHero, SectionHeading, TodoNote } from "@/components/ui";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Services",
  description: "Same-day badminton racquet restringing in Brisbane, plus corporate events, school programs and parties.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Restringing & more"
        intro="Best-value racquet restringing in Queensland, with same-day and express options. Plus events, school programs and parties."
        image="/images/home/home3.jpg"
      >
        <ButtonLink href="/contact">Book a restring</ButtonLink>
      </PageHero>

      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <Media image="/images/home/restringing.jpg" alt="Freshly strung racquets ready for collection" label="Strings" className="aspect-[4/3] rounded-3xl" />
          <div>
            <SectionHeading
              eyebrow="Restringing"
              title="Back on court, fast"
              intro="Drop your racquet at the front desk. We'll restring it with the tension and string you choose."
            />
            <CheckList items={site.services.restringing} />
            <TodoNote>Add restringing prices and turnaround times.</TodoNote>
          </div>
        </div>
      </section>

      <section className="section border-t border-line bg-ink-2">
        <div className="container-x">
          <SectionHeading eyebrow="Also on offer" title="Events & programs" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {site.services.other.map((s) => (
              <li key={s.name} className="card p-7">
                <h3 className="text-xl font-bold">{s.name}</h3>
                <p className="mt-2 text-zinc-400">{s.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        title="Planning an event?"
        body="Tell us what you have in mind and we'll put a package together."
        primary={{ href: "/contact", label: "Enquire now" }}
      />
    </>
  );
}
