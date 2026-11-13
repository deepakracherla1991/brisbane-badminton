import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

/* ---------- Buttons ---------- */

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
};

export function ButtonLink({ href, children, variant = "primary", className = "" }: ButtonProps) {
  const base =
    "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider transition-colors";
  const styles =
    variant === "primary"
      ? "bg-brand text-white hover:bg-brand-600"
      : "border border-white/25 text-white hover:border-white hover:bg-white/5";
  const external = /^https?:\/\//.test(href);
  const content = (
    <>
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${styles} ${className}`}>
      {content}
    </a>
  ) : (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {content}
    </Link>
  );
}

/* ---------- Headings ---------- */

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`mb-10 max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">{title}</h2>
      {intro && <p className="mt-4 text-base text-zinc-400 sm:text-lg">{intro}</p>}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  /** Optional background photo. */
  image?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {image ? (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
        </>
      ) : (
        <CourtLines className="absolute inset-0 h-full w-full opacity-[0.07]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-transparent to-transparent" />
      <div className="container-x relative py-16 sm:py-24">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-zinc-300">{intro}</p>
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}

/* ---------- Lists ---------- */

export function CheckList({ items, className = "" }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-300">
            <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
          </span>
          <span className="text-zinc-300">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Imagery ---------- */

/** Top-down badminton court line drawing (doubles court, proportions 13.4m x 6.1m). */
export function CourtLines({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 610 1340" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="5" className="text-white">
        <rect x="2.5" y="2.5" width="605" height="1335" />
        <line x1="46" y1="0" x2="46" y2="1340" />
        <line x1="564" y1="0" x2="564" y2="1340" />
        <line x1="0" y1="76" x2="610" y2="76" />
        <line x1="0" y1="1264" x2="610" y2="1264" />
        <line x1="0" y1="472" x2="610" y2="472" />
        <line x1="0" y1="868" x2="610" y2="868" />
        <line x1="305" y1="0" x2="305" y2="472" />
        <line x1="305" y1="868" x2="305" y2="1340" />
        <line x1="0" y1="670" x2="610" y2="670" strokeDasharray="14 10" strokeWidth="7" />
      </g>
    </svg>
  );
}

/**
 * Shows a photo when `image` is set, otherwise a branded court-line panel.
 * Drop photos in /public/images and reference them from src/content/site.ts.
 */
export function Media({
  image,
  alt,
  label,
  tone = "brand",
  className = "",
  priority = false,
}: {
  image?: string;
  alt: string;
  label?: string;
  tone?: "brand" | "court";
  className?: string;
  priority?: boolean;
}) {
  const bg =
    tone === "court"
      ? "bg-gradient-to-br from-court via-[#174f43] to-ink"
      : "bg-gradient-to-br from-brand via-[#7a1414] to-ink";
  return (
    <div className={`relative overflow-hidden ${bg} ${className}`}>
      {image ? (
        <Image src={image} alt={alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" priority={priority} />
      ) : (
        <>
          <CourtLines className="absolute inset-0 h-full w-full rotate-0 opacity-30" />
          {label && (
            <span className="absolute bottom-5 left-5 font-display text-5xl font-bold uppercase leading-none text-white/15 sm:text-7xl">
              {label}
            </span>
          )}
        </>
      )}
    </div>
  );
}

/* ---------- Blocks ---------- */

export function FeatureSplit({
  eyebrow,
  title,
  body,
  points,
  cta,
  label,
  tone,
  image,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  points: readonly string[];
  cta: { href: string; label: string };
  label: string;
  tone?: "brand" | "court";
  image?: string;
  reverse?: boolean;
}) {
  return (
    <div className={`grid items-stretch overflow-hidden rounded-3xl border border-line bg-ink-2 md:grid-cols-2`}>
      <Media image={image} alt={title} label={label} tone={tone} className={`min-h-64 md:min-h-[28rem] ${reverse ? "md:order-2" : ""}`} />
      <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h3 className="text-3xl font-bold sm:text-4xl">{title}</h3>
        <p className="mt-4 text-zinc-400">{body}</p>
        <CheckList items={points} className="mt-6" />
        <div className="mt-8">
          <ButtonLink href={cta.href}>{cta.label}</ButtonLink>
        </div>
      </div>
    </div>
  );
}

export function CtaBand({
  title,
  body,
  primary,
  secondary,
}: {
  title: string;
  body: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="section">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-14 text-center sm:px-12 sm:py-20">
          <Image
            src="/logos/emblem-white.png"
            alt=""
            width={259}
            height={259}
            className="pointer-events-none absolute -right-16 -bottom-20 h-72 w-72 opacity-15 sm:h-96 sm:w-96"
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-5xl">{title}</h2>
            <p className="mt-4 text-lg text-white/85">{body}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={primary.href}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-shuttle"
              >
                {primary.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {secondary && (
                <ButtonLink href={secondary.href} variant="ghost">
                  {secondary.label}
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TodoNote({ children }: { children: React.ReactNode }) {
  // Visible only in development, so placeholders are easy to spot before launch.
  if (process.env.NODE_ENV === "production") return null;
  return (
    <p className="mt-4 rounded-lg border border-dashed border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
      TODO: {children}
    </p>
  );
}
