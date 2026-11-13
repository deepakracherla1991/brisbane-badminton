import type { Metadata } from "next";
import Image from "next/image";
import { CheckList, CtaBand, Media, PageHero, SectionHeading } from "@/components/ui";
import { gallery, site } from "@/content/site";

export const metadata: Metadata = {
  title: "About us",
  description: "Queensland's first dedicated badminton venue, home to nine BWF-standard courts, a coaching academy and an affiliated club.",
};

const values = [
  { title: "Built for badminton", body: "Not a multi-sport hall with lines painted on. Every detail of the venue is designed around the game." },
  { title: "For every player", body: "From kids picking up a racquet for the first time to state-level competitors, everyone belongs here." },
  { title: "Community first", body: "We welcome all communities, ages and skill levels, and support local groups with regular court bookings." },
  { title: "Real value", body: "Great courts shouldn't cost a fortune. Off-peak court hire starts from $15 an hour." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="More than just courts"
        intro="Brisbane Badminton is Queensland's first dedicated badminton venue: a home for social players, juniors, coaches and competitors alike."
        image="/images/gallery/courts3.jpg"
      />

      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Our venue" title="A home for the game in Brisbane" />
            <div className="space-y-4 text-zinc-300">
              <p>
                Located in Crestmead on Brisbane&apos;s south side, our venue has nine BWF-standard courts and the highest
                ceilings of any badminton courts in Queensland, so every clear, lob and high serve stays in play.
              </p>
              <p>
                Alongside court hire we run a coaching academy, social sessions and leagues, racquet restringing and a
                QBA-affiliated club with pathways into competitive badminton.
              </p>
            </div>
            <CheckList
              className="mt-8"
              items={["9 BWF-standard courts", "Open 7 days, year-round", "QBA-affiliated club", "PlayOn vouchers accepted"]}
            />
          </div>
          <Media image="/images/gallery/building.jpg" alt="Brisbane Badminton venue entrance in Crestmead" label="Venue" className="aspect-[4/3] rounded-3xl" />
        </div>
      </section>

      <section className="section border-t border-line bg-ink-2">
        <div className="container-x">
          <SectionHeading eyebrow="What we stand for" title="Our values" align="center" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <li key={v.title} className="card p-6">
                <span className="font-display text-4xl font-bold text-brand/70">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-xl font-bold">{v.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{v.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="Gallery" title="Inside the venue" />
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {gallery.map((g, i) => (
              <li
                key={g.src}
                className={`relative overflow-hidden rounded-2xl bg-ink-2 ${i === 0 ? "col-span-2 row-span-2 aspect-square lg:aspect-auto" : "aspect-square"}`}
              >
                <Image
                  src={g.src}
                  alt={g.alt}
                  fill
                  sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        title="Come and see for yourself"
        body={`Visit us at ${site.contact.address}.`}
        primary={{ href: site.links.bookCourt, label: "Book a court" }}
        secondary={{ href: "/contact", label: "Get directions" }}
      />
    </>
  );
}
