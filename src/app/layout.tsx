import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { site } from "@/content/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  appleWebApp: { capable: true, title: "Badminton", statusBarStyle: "black" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.name,
    description: site.description,
    locale: "en_AU",
  },
};

export const viewport: Viewport = { themeColor: "#0b0b0c" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: site.name,
  description: site.description,
  url: site.url,
  logo: `${site.url}/logos/logo-full-color.png`,
  image: `${site.url}/images/gallery/main-page.jpg`,
  email: site.contact.email,
  telephone: site.contact.whatsapp,
  address: {
    "@type": "PostalAddress",
    streetAddress: "39 Quilton Pl",
    addressLocality: "Crestmead",
    addressRegion: "QLD",
    postalCode: "4132",
    addressCountry: "AU",
  },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "10:00", closes: "23:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "06:00", closes: "23:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "06:00", closes: "21:00" },
  ],
  sameAs: [site.contact.facebook, site.contact.instagram],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: browser extensions (e.g. Grammarly) add attributes to <html>/<body>
    // before React loads. This only silences attribute mismatches on these two tags.
    <html lang="en-AU" className={`${inter.variable} ${oswald.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-ink">
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
        <ServiceWorkerRegister />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
