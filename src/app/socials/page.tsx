import type { Metadata } from "next";
import { ButtonLink, CheckList, CtaBand, Media, PageHero, SectionHeading, TodoNote } from "@/components/ui";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Social badminton",
  description: "Social badminton sessions, leagues and community group bookings in Brisbane for all ages and skill levels.",
};

export default function SocialsPage() {
  return (
    <>
      <PageHero
        eyebrow="Socials"
        title="Find your game"
        intro="Social sessions, leagues and community bookings for all ages and skill levels. Come alone or bring the crew."
        image="/images/home/home1.jpg"
      >
        <ButtonLink href="/contact">Get involved</ButtonLink>
      </PageHero>

      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Everyone welcome" title="Play, meet people, have fun" />
            <CheckList items={site.socials.points} />
          </div>
          <Media image="/images/socials/fbwall.jpg" alt="Social badminton players group photo" label="Social" className="aspect-[4/3] rounded-3xl" />
        </div>
      </section>

      <section className="section border-t border-line bg-ink-2">
        <div className="container-x">
          <SectionHeading eyebrow="Ways to play" title="Sessions & leagues" />
          <ul className="grid gap-5 md:grid-cols-3">
            {site.socials.sessions.map((s) => (
              <li key={s.name} className="card p-7">
                <h3 className="text-2xl font-bold">{s.name}</h3>
                <p className="mt-3 text-zinc-400">{s.detail}</p>
              </li>
            ))}
          </ul>
          <TodoNote>Add session days, times and prices.</TodoNote>
        </div>
      </section>

      <CtaBand
        title="Run a community group?"
        body="We offer regular court blocks for clubs, cultural groups and social teams."
        primary={{ href: "/contact", label: "Talk to us" }}
        secondary={{ href: "/court-hire", label: "Court hire" }}
      />
    </>
  );
}
