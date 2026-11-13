import type { Metadata } from "next";
import { ButtonLink, CtaBand, Media, PageHero, SectionHeading, TodoNote } from "@/components/ui";

export const metadata: Metadata = {
  title: "Pro shop",
  description: "Badminton racquets, strings, shuttles and accessories at Brisbane Badminton's pro shop.",
};

// TODO: confirm product categories and brands stocked.
const categories = [
  { name: "Racquets", body: "Options for beginners through to advanced players." },
  { name: "Strings", body: "A wide range of strings, ready for restringing in-house." },
  { name: "Shuttlecocks", body: "Feather and nylon shuttles for training and match play." },
  { name: "Grips & accessories", body: "Overgrips, towel grips, bags and more." },
];

export default function ProShopPage() {
  return (
    <>
      <PageHero
        eyebrow="Pro shop"
        title="Gear up"
        intro="Racquets, strings, shuttles and accessories, available at the front desk. Ask our team for advice on the right gear for your game."
        image="/images/gallery/pro-shop2.jpg"
      >
        <ButtonLink href="/contact">Ask about stock</ButtonLink>
      </PageHero>

      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="In store" title="What we stock" />
          <Media image="/images/gallery/pro-shop2.jpg" alt="Pro shop wall with racquets, shoes and apparel" className="mb-8 aspect-[21/9] rounded-3xl" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <li key={c.name} className="card p-6">
                <h3 className="text-xl font-bold">{c.name}</h3>
                <p className="mt-2 text-sm text-zinc-400">{c.body}</p>
              </li>
            ))}
          </ul>
          <TodoNote>Confirm product categories and brands, or link to an online store.</TodoNote>
        </div>
      </section>

      <CtaBand
        title="Need a restring?"
        body="Same-day and express restringing with a wide range of strings."
        primary={{ href: "/services", label: "Restringing" }}
      />
    </>
  );
}
