import type { Metadata } from "next";
import { ButtonLink, CheckList, CtaBand, Media, PageHero, SectionHeading } from "@/components/ui";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Club",
  description: "Join a QBA-affiliated badminton club in Brisbane with access to sanctioned tournaments and pathways to state squads.",
};

const steps = [
  { title: "Register", body: "Complete the club registration form online." },
  { title: "Get affiliated", body: "Your membership is registered with Queensland Badminton." },
  { title: "Play & compete", body: "Enter QBA-sanctioned tournaments and club events." },
];

export default function ClubPage() {
  return (
    <>
      <PageHero
        eyebrow="Club"
        title="Join the club"
        intro="A QBA-affiliated club recognised by Badminton Australia, offering a safe, structured environment and real pathways into competitive badminton."
        image="/images/club/club.jpg"
      >
        <ButtonLink href={site.links.clubJoin}>Register</ButtonLink>
      </PageHero>

      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Membership benefits" title="Why join" />
            <CheckList items={site.club.points} />
          </div>
          <Media image="/images/club/club-banner.jpg" alt="Club members group photo" label="Club" tone="court" className="aspect-[4/3] rounded-3xl" />
        </div>
      </section>

      <section id="join" className="section border-t border-line bg-ink-2">
        <div className="container-x">
          <SectionHeading eyebrow="How it works" title="Three steps to membership" align="center" />
          <ol className="grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="card p-7">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand font-display text-lg font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-2xl font-bold">{s.title}</h3>
                <p className="mt-2 text-zinc-400">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <ButtonLink href={site.links.clubJoin}>Start registration</ButtonLink>
          </div>
        </div>
      </section>

      <CtaBand
        title="Questions about membership?"
        body="Our team is happy to help with fees, eligibility and PlayOn vouchers."
        primary={{ href: "/contact", label: "Contact us" }}
      />
    </>
  );
}
