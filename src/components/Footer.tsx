import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "./SocialIcons";
import { site } from "@/content/site";

export function Footer() {
  const { contact } = site;
  const socials = [
    { href: contact.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: contact.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: `https://wa.me/${contact.whatsapp.replace("+", "")}`, label: "WhatsApp", Icon: WhatsAppIcon },
  ];

  return (
    <footer className="border-t border-line bg-ink-2">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo className="h-11 w-auto" />
          <p className="max-w-xs text-sm text-zinc-400">Queensland&apos;s first dedicated badminton venue.</p>
          <ul className="flex gap-2">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-zinc-300 transition-colors hover:bg-brand hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm text-zinc-400">Explore</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-1">
            {site.nav.slice(1).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-zinc-300 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/portal" className="text-zinc-300 hover:text-white">
                Academy portal
              </Link>
            </li>
            <li className="hide-in-app">
              <Link href="/app" className="text-zinc-300 hover:text-white">
                Get the app
              </Link>
            </li>
            <li>
              <Link href="/contact#faq" className="text-zinc-300 hover:text-white">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm text-zinc-400">Opening hours</h2>
          <dl className="space-y-2 text-sm">
            {site.hours.map((h) => (
              <div key={h.days}>
                <dt className="text-zinc-400">{h.days}</dt>
                <dd className="text-zinc-200">{h.time}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="mb-4 text-sm text-zinc-400">Find us</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex gap-2 text-zinc-300 hover:text-white">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                {contact.address}
              </a>
            </li>
            <li>
              <a href={`tel:${contact.phones[0].number}`} className="flex gap-2 text-zinc-300 hover:text-white">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                {contact.phones[0].display}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="flex gap-2 break-all text-zinc-300 hover:text-white">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                {contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-zinc-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Crestmead, Brisbane QLD</p>
        </div>
      </div>
    </footer>
  );
}
