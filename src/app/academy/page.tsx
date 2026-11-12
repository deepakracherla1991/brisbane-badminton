import type { Metadata } from "next";
import { ButtonLink, CheckList, CtaBand, Media, PageHero, SectionHeading, TodoNote } from "@/components/ui";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Academy",
  description: "Badminton coaching in Brisbane for juniors and adults: group classes, personal training, sparring and school holiday camps.",
};

export default function AcademyPage() {
  const { programs, points } = site.academy;
  return (
    <>
      <PageHero
        eyebrow="Academy"
        title="Train with purpose"
        intro="Structured coaching for every age and stage, with 100+ active academy members on a clear development pathway."
      >
        <ButtonLink href={site.links.academyEnrol}>Enrol now</ButtonLink>
        <ButtonLink href="#programs" variant="ghost">
          View programs
        </ButtonLink>
      </PageHero>

      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <Media alt="Academy training session" label="Academy" tone="court" className="aspect-[4/3] rounded-3xl" />
          <div>
            <SectionHeading
              eyebrow="Why our academy"
              title="A pathway, not just a lesson"
              intro="Every player is assessed and placed in the right group, so you're always challenged and always improving."
            />
            <CheckList items={points} />
          </div>
        </div>
      </section>

      <section id="programs" className="section border-t border-line bg-ink-2">
        <div className="container-x">
          <SectionHeading eyebrow="Programs" title="Find your program" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => (
              <li key={p.slug} id={p.slug} className="card flex flex-col overflow-hidden">
                <Media image={p.image} alt={p.name} tone="court" className="aspect-[16/9]" />
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-300">{p.audience}</p>
                  <h3 className="mt-2 text-2xl font-bold">{p.name}</h3>
                  <p className="mt-3 flex-1 text-sm text-zinc-400">{p.summary}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {p.points.map((pt) => (
                      <li key={pt} className="rounded-full border border-line px-3 py-1 text-xs text-zinc-300">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
          <TodoNote>Add term dates, session times, ages and prices for each program.</TodoNote>
        </div>
      </section>

      <section id="enrol" className="section">
        <div className="container-x">
          <div className="card grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow mb-3">Enrolments</p>
              <h2 className="text-3xl font-bold sm:text-4xl">Not sure where to start?</h2>
              <p className="mt-4 text-zinc-400">
                Book an individual player assessment and our coaches will recommend the right program. PlayOn vouchers
                are accepted.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <ButtonLink href={site.links.academyEnrol}>Enrol</ButtonLink>
              <ButtonLink href="/contact" variant="ghost">
                Ask a question
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        title="School holidays coming up?"
        body="Ask us about dates for the next holiday camp."
        primary={{ href: "/contact", label: "Enquire about camps" }}
      />
    </>
  );
}
