import Image from "next/image";
import Link from "next/link";
import { Award, BadgeDollarSign, GraduationCap, LayoutGrid, Ticket, Users, type LucideIcon } from "lucide-react";
import { ButtonLink, CtaBand, FeatureSplit, SectionHeading } from "@/components/ui";
import { site } from "@/content/site";

const icons: Record<string, LucideIcon> = {
  courts: LayoutGrid,
  academy: GraduationCap,
  award: Award,
  ticket: Ticket,
  community: Users,
  value: BadgeDollarSign,
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image src="/images/gallery/main-page.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(217,32,39,0.25),transparent_60%)]" />
        <div className="container-x relative grid gap-12 py-20 sm:py-28 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow mb-5">Queensland&apos;s first dedicated badminton venue</p>
            <h1 className="text-5xl font-bold leading-[0.95] sm:text-7xl lg:text-8xl">
              Badminton&apos;s
              <br />
              <span className="text-brand">home in Brisbane.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-zinc-300 sm:text-xl">
              Nine BWF-standard courts, the state&apos;s highest ceilings and a community of players at every
              level. Open seven days in Crestmead.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href={site.links.bookCourt}>Book a court</ButtonLink>
              <ButtonLink href="/academy" variant="ghost">
                Explore the academy
              </ButtonLink>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {site.stats.map((s) => (
              <div key={s.label} className="bg-ink-2/85 p-5 backdrop-blur-sm sm:p-6">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-display text-4xl font-bold text-white sm:text-5xl">{s.value}</span>
                  <span className="mt-1 block text-sm text-zinc-400">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Highlights strip */}
      <section aria-label="Highlights" className="border-y border-line bg-ink-2">
        <ul className="container-x grid grid-cols-2 gap-x-6 gap-y-5 py-8 sm:grid-cols-3 lg:grid-cols-6">
          {site.highlights.map((h) => {
            const Icon = icons[h.icon];
            return (
              <li key={h.label} className="flex items-center gap-3">
                <Icon className="h-6 w-6 shrink-0 text-brand-300" aria-hidden="true" />
                <span className="font-display text-sm uppercase leading-tight tracking-wide text-zinc-200">{h.label}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* What we offer */}
      <section className="section">
        <div className="container-x">
          <SectionHeading
            eyebrow="More than just courts"
            title="Everything badminton, under one roof"
            intro="Hire a court, learn from our coaches, play socially or join an affiliated club. Whatever your level, there's a place for you here."
          />
          <div className="space-y-8">
            <FeatureSplit
              eyebrow="Court hire"
              title="Play more, pay less"
              body="Purpose-built badminton courts with the ceiling height for clean, high clears. Book online in seconds."
              points={site.courtHire.points}
              cta={{ href: "/court-hire", label: "Court hire & rates" }}
              label="Courts"
              image="/images/home/court-hire.jpg"
            />
            <FeatureSplit
              eyebrow="Academy"
              title="Train with purpose"
              body="Structured coaching for juniors and adults, from first-time players to tournament competitors. Over 100 active academy members."
              points={site.academy.points}
              cta={{ href: "/academy", label: "View programs" }}
              label="Academy"
              image="/images/academy/academyhome.jpg"
              tone="court"
              reverse
            />
            <FeatureSplit
              eyebrow="Socials"
              title="Find your game"
              body="Social sessions, leagues and community bookings for every age and skill level. Bring friends or meet new ones."
              points={site.socials.points}
              cta={{ href: "/socials", label: "Get involved" }}
              label="Social"
              image="/images/socials/socials-2.jpg"
            />
          </div>
        </div>
      </section>

      {/* Services + club teaser */}
      <section className="section border-t border-line bg-ink-2">
        <div className="container-x grid gap-6 md:grid-cols-2">
          <Link href="/services" className="card group p-8 transition-colors hover:border-brand/60 sm:p-10">
            <p className="eyebrow mb-3">Services</p>
            <h2 className="text-3xl font-bold">Racquet restringing</h2>
            <p className="mt-3 text-zinc-400">
              Same-day and express restringing using the 4-knot method. Wide range of strings, or bring your own.
            </p>
            <span className="mt-6 inline-block font-display text-sm uppercase tracking-wider text-brand-300 group-hover:text-white">
              Restringing & services →
            </span>
          </Link>
          <Link href="/club" className="card group p-8 transition-colors hover:border-brand/60 sm:p-10">
            <p className="eyebrow mb-3">Club</p>
            <h2 className="text-3xl font-bold">Join the club</h2>
            <p className="mt-3 text-zinc-400">
              A QBA-affiliated club recognised by Badminton Australia, with pathways to tournaments, state squads and
              representative teams.
            </p>
            <span className="mt-6 inline-block font-display text-sm uppercase tracking-wider text-brand-300 group-hover:text-white">
              Club membership →
            </span>
          </Link>
        </div>
      </section>

      <CtaBand
        title="Ready to play?"
        body="Courts are open seven days a week. Grab a racquet and book your next game."
        primary={{ href: site.links.bookCourt, label: "Book a court" }}
        secondary={{ href: "/contact", label: "Contact us" }}
      />
    </>
  );
}
